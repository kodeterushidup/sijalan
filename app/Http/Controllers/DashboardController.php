<?php

namespace App\Http\Controllers;

use App\Enums\TripStatus;
use App\Models\Trip;
use App\Models\Unit;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $user = $request->user();
        $monthStart = Carbon::now()->startOfMonth();
        $monthEnd = Carbon::now()->endOfMonth();

        $base = Trip::query()
            ->when($user->role->value === 'pegawai', fn ($query) => $query->where('user_id', $user->id));

        $stats = [
            'bulan_ini' => (clone $base)->whereBetween('tanggal_mulai', [$monthStart, $monthEnd])->count(),
            'menunggu' => (clone $base)->where('status', TripStatus::Diajukan)->count(),
            'berlangsung' => (clone $base)->where('status', TripStatus::Berlangsung)->count(),
            'belum_lengkap' => (clone $base)
                ->where('status', TripStatus::Berlangsung)
                ->where(fn ($query) => $query
                    ->whereDoesntHave('report')
                    ->orWhereDoesntHave('photos'))
                ->count(),
        ];

        $upcoming = (clone $base)
            ->with(['user:id,name', 'unit:id,nama'])
            ->whereIn('status', [TripStatus::Disetujui, TripStatus::Berlangsung])
            ->whereDate('tanggal_selesai', '>=', today())
            ->orderBy('tanggal_mulai')
            ->limit(5)
            ->get()
            ->map(fn (Trip $trip): array => [
                'id' => $trip->id,
                'pegawai' => $trip->user->name,
                'unit' => $trip->unit->nama,
                'tujuan' => $trip->tempat_tujuan,
                'maksud' => $trip->maksud,
                'mulai' => $trip->tanggal_mulai->toDateString(),
                'selesai' => $trip->tanggal_selesai->toDateString(),
                'status' => $trip->status->value,
                'status_label' => $trip->status->label(),
            ]);

        $chartSince = Carbon::now()->subMonthsNoOverflow(5)->startOfMonth();

        $unitChart = $user->role->value === 'pegawai'
            ? []
            : Unit::query()
                ->withCount(['trips as total' => fn ($query) => $query
                    ->whereDate('tanggal_mulai', '>=', $chartSince)
                    ->whereIn('status', [
                        TripStatus::Draft,
                        TripStatus::Diajukan,
                        TripStatus::Disetujui,
                        TripStatus::Berlangsung,
                        TripStatus::Selesai,
                    ])])
                ->orderByDesc('total')
                ->orderBy('nama')
                ->get(['id', 'nama'])
                ->map(fn (Unit $unit): array => [
                    'nama' => $unit->nama,
                    'total' => (int) $unit->total,
                ])
                ->all();

        return Inertia::render('Dashboard', [
            'stats' => $stats,
            'upcoming' => $upcoming,
            'unitChart' => $unitChart,
        ]);
    }
}
