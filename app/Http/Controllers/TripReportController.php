<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use App\Models\Trip;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TripReportController extends Controller
{
    public function edit(Trip $trip): Response
    {
        $this->authorize('updateReport', $trip);

        $trip->load('report');

        return Inertia::render('Reports/Edit', [
            'trip' => [
                'id' => $trip->id,
                'nomor_sppd' => $trip->nomor_sppd,
                'maksud' => $trip->maksud,
                'tempat_tujuan' => $trip->tempat_tujuan,
                'tanggal_mulai' => $trip->tanggal_mulai->toDateString(),
                'tanggal_selesai' => $trip->tanggal_selesai->toDateString(),
            ],
            'report' => [
                'hasil' => $trip->report?->hasil ?? '',
                'kendala' => $trip->report?->kendala ?? '',
                'rekomendasi' => $trip->report?->rekomendasi ?? '',
                'disusun_at' => $trip->report?->disusun_at?->toIso8601String(),
            ],
        ]);
    }

    public function update(Request $request, Trip $trip): RedirectResponse
    {
        $this->authorize('updateReport', $trip);

        $validated = $request->validate([
            'hasil' => ['required', 'string', 'max:5000'],
            'kendala' => ['required', 'string', 'max:5000'],
            'rekomendasi' => ['required', 'string', 'max:5000'],
        ], [
            'hasil.required' => 'Uraian hasil wajib diisi.',
            'kendala.required' => 'Kendala wajib diisi. Tulis "Tidak ada kendala" bila tidak ada.',
            'rekomendasi.required' => 'Rekomendasi atau tindak lanjut wajib diisi.',
        ]);

        $trip->report()->updateOrCreate([], [
            ...$validated,
            'disusun_at' => now(),
        ]);

        return redirect()
            ->route('trips.show', $trip)
            ->with('success', 'Laporan perjalanan disimpan.');
    }

    public function show(Trip $trip): Response
    {
        $this->authorize('view', $trip);

        $trip->load(['user.unit', 'unit', 'report', 'photos', 'approver']);

        abort_if($trip->report === null, 404);

        $setting = Setting::current();
        $pegawai = $trip->user;

        return Inertia::render('Reports/Show', [
            'trip' => [
                'id' => $trip->id,
                'nomor_sppd' => $trip->nomor_sppd,
                'maksud' => $trip->maksud,
                'tempat_tujuan' => $trip->tempat_tujuan,
                'tanggal_mulai' => $trip->tanggal_mulai->toDateString(),
                'tanggal_selesai' => $trip->tanggal_selesai->toDateString(),
                'lama_hari' => $trip->lamaHari(),
                'disetujui_at' => $trip->disetujui_at?->toIso8601String(),
            ],
            'report' => [
                'hasil' => $trip->report->hasil,
                'kendala' => $trip->report->kendala,
                'rekomendasi' => $trip->report->rekomendasi,
                'disusun_at' => $trip->report->disusun_at?->toIso8601String(),
            ],
            'pegawai' => [
                'name' => $pegawai->name,
                'nip' => $pegawai->nip,
                'jabatan' => $pegawai->jabatan,
                'golongan' => $pegawai->golongan,
                'unit' => $pegawai->unit?->nama ?? $trip->unit->nama,
                'ttd_url' => $pegawai->ttd_path ? route('ttd.show', $pegawai) : null,
            ],
            'photos' => $trip->photos->map(fn ($photo): array => [
                'id' => $photo->id,
                'url' => $photo->url(),
                'is_image' => $photo->isImage(),
                'keterangan' => $photo->keterangan,
            ])->values(),
            'instansi' => [
                'nama' => $setting->nama_instansi,
                'alamat' => $setting->alamat,
                'logo_url' => $setting->logoUrl(),
            ],
            'dicetak' => now()->translatedFormat('j F Y'),
        ]);
    }
}
