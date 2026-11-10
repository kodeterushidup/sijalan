<?php

namespace App\Http\Controllers;

use App\Enums\TripStatus;
use App\Models\Trip;
use App\Services\SppdNumberGenerator;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class TripApprovalController extends Controller
{
    public function index(): Response
    {
        $this->authorize('viewAny', Trip::class);

        $trips = Trip::query()
            ->with(['user:id,name,nip', 'unit:id,nama'])
            ->withSum('costs', 'subtotal')
            ->where('status', TripStatus::Diajukan)
            ->orderBy('updated_at')
            ->orderBy('id')
            ->paginate(15)
            ->through(fn (Trip $trip): array => [
                'id' => $trip->id,
                'maksud' => $trip->maksud,
                'tempat_tujuan' => $trip->tempat_tujuan,
                'pegawai' => $trip->user->name,
                'nip' => $trip->user->nip,
                'unit' => $trip->unit->nama,
                'tanggal_mulai' => $trip->tanggal_mulai->toDateString(),
                'tanggal_selesai' => $trip->tanggal_selesai->toDateString(),
                'lama_hari' => $trip->lamaHari(),
                'total_biaya' => (float) ($trip->costs_sum_subtotal ?? 0),
                'diajukan_at' => $trip->updated_at?->toIso8601String(),
            ]);

        return Inertia::render('Approvals/Index', [
            'trips' => $trips,
        ]);
    }

    public function approve(Request $request, Trip $trip, SppdNumberGenerator $generator): RedirectResponse
    {
        $this->authorize('approve', $trip);

        DB::transaction(function () use ($request, $trip, $generator): void {
            $locked = Trip::query()->lockForUpdate()->findOrFail($trip->id);

            if ($locked->status !== TripStatus::Diajukan || $locked->nomor_sppd !== null) {
                throw ValidationException::withMessages([
                    'status' => 'Perjalanan ini sudah diproses. Muat ulang halaman untuk melihat status terbaru.',
                ]);
            }

            $number = $generator->generate($locked);

            $locked->update([
                'status' => TripStatus::Disetujui,
                'nomor_sppd' => $number['nomor'],
                'nomor_urut' => $number['urut'],
                'tahun' => $number['tahun'],
                'disetujui_oleh' => $request->user()->id,
                'disetujui_at' => now(),
                'alasan_penolakan' => null,
            ]);
        });

        return redirect()
            ->route('trips.show', $trip)
            ->with('success', 'Perjalanan disetujui dan SPPD bernomor '.$trip->fresh()->nomor_sppd.' terbit.');
    }

    public function reject(Request $request, Trip $trip): RedirectResponse
    {
        $this->authorize('reject', $trip);

        $validated = $request->validate([
            'alasan_penolakan' => ['required', 'string', 'max:500'],
        ], [
            'alasan_penolakan.required' => 'Alasan penolakan wajib diisi.',
        ]);

        DB::transaction(function () use ($trip, $validated): void {
            $locked = Trip::query()->lockForUpdate()->findOrFail($trip->id);

            if ($locked->status !== TripStatus::Diajukan) {
                throw ValidationException::withMessages([
                    'status' => 'Perjalanan ini sudah diproses. Muat ulang halaman untuk melihat status terbaru.',
                ]);
            }

            $locked->update([
                'status' => TripStatus::Ditolak,
                'alasan_penolakan' => $validated['alasan_penolakan'],
            ]);
        });

        return redirect()
            ->route('trips.show', $trip)
            ->with('success', 'Perjalanan ditolak. Admin dapat memperbaiki lalu mengajukan ulang.');
    }
}
