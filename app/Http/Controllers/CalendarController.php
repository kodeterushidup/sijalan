<?php

namespace App\Http\Controllers;

use App\Enums\Role;
use App\Enums\TripStatus;
use App\Models\Trip;
use App\Models\Unit;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class CalendarController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $user = $request->user();
        $bulan = $this->month((string) $request->query('bulan', ''));
        $unitFilter = $request->integer('unit');
        $pegawaiFilter = $request->integer('pegawai');

        $gridStart = $bulan->copy()->startOfWeek(Carbon::MONDAY);
        $gridEnd = $gridStart->copy()->addDays(41);

        $trips = Trip::query()
            ->with(['user:id,name', 'unit:id,nama'])
            ->when($user->role === Role::Pegawai, fn ($query) => $query->where('user_id', $user->id))
            ->when($unitFilter > 0, fn ($query) => $query->where('unit_id', $unitFilter))
            ->when($pegawaiFilter > 0, fn ($query) => $query->where('user_id', $pegawaiFilter))
            ->whereIn('status', [
                TripStatus::Draft,
                TripStatus::Diajukan,
                TripStatus::Disetujui,
                TripStatus::Berlangsung,
                TripStatus::Selesai,
            ])
            ->where('tanggal_mulai', '<=', $gridEnd->toDateString())
            ->where('tanggal_selesai', '>=', $gridStart->toDateString())
            ->orderBy('tanggal_mulai')
            ->orderBy('id')
            ->get();

        $canFilter = $user->role !== Role::Pegawai;

        return Inertia::render('Calendar/Index', [
            'bulan' => $bulan->toDateString(),
            'bulanLabel' => $bulan->translatedFormat('F Y'),
            'today' => now()->format('Y-m'),
            'prev' => $bulan->copy()->subMonthNoOverflow()->format('Y-m'),
            'next' => $bulan->copy()->addMonthNoOverflow()->format('Y-m'),
            'days' => collect(range(0, 41))->map(function (int $offset) use ($gridStart, $bulan): array {
                $date = $gridStart->copy()->addDays($offset);

                return [
                    'date' => $date->toDateString(),
                    'day' => $date->day,
                    'in_month' => $date->month === $bulan->month && $date->year === $bulan->year,
                    'is_today' => $date->isToday(),
                ];
            }),
            'trips' => $trips->map(fn (Trip $trip): array => [
                'id' => $trip->id,
                'maksud' => $trip->maksud,
                'tempat_tujuan' => $trip->tempat_tujuan,
                'pegawai' => $trip->user->name,
                'unit' => $trip->unit->nama,
                'tanggal_mulai' => $trip->tanggal_mulai->toDateString(),
                'tanggal_selesai' => $trip->tanggal_selesai->toDateString(),
                'status' => $trip->status->value,
                'status_label' => $trip->status->label(),
                'nomor_sppd' => $trip->nomor_sppd,
            ])->values(),
            'units' => $canFilter ? $this->unitOptions() : [],
            'employees' => $canFilter ? $this->employeeOptions() : [],
            'filters' => [
                'unit' => $unitFilter ?: null,
                'pegawai' => $pegawaiFilter ?: null,
            ],
            'canCreate' => $user->role->canManageData(),
        ]);
    }

    private function month(string $value): Carbon
    {
        if (preg_match('/^\d{4}-(0[1-9]|1[0-2])$/', $value) !== 1) {
            return now()->startOfMonth();
        }

        return Carbon::createFromFormat('!Y-m-d', $value.'-01')->startOfMonth();
    }

    /**
     * @return array<int, array{value: int, label: string}>
     */
    private function unitOptions(): array
    {
        return Unit::query()
            ->orderBy('nama')
            ->get(['id', 'nama'])
            ->map(fn (Unit $unit): array => ['value' => $unit->id, 'label' => $unit->nama])
            ->all();
    }

    /**
     * @return array<int, array{value: int, label: string}>
     */
    private function employeeOptions(): array
    {
        return User::query()
            ->where('role', Role::Pegawai)
            ->where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name', 'nip'])
            ->map(fn (User $user): array => [
                'value' => $user->id,
                'label' => $user->nip ? $user->name.' · '.$user->nip : $user->name,
            ])
            ->all();
    }
}
