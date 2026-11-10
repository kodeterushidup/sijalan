<?php

namespace App\Http\Controllers;

use App\Enums\Role;
use App\Enums\TripStatus;
use App\Models\Trip;
use App\Models\TripCost;
use App\Models\Unit;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class TripController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $filters = [
            'q' => trim((string) $request->query('q', '')),
            'status' => (string) $request->query('status', ''),
            'unit' => $request->integer('unit'),
            'pegawai' => $request->integer('pegawai'),
            'dari' => (string) $request->query('dari', ''),
            'sampai' => (string) $request->query('sampai', ''),
        ];

        $trips = Trip::query()
            ->with(['user:id,name,nip', 'unit:id,nama'])
            ->withSum('costs', 'subtotal')
            ->when($user->role === Role::Pegawai, fn ($query) => $query->where('user_id', $user->id))
            ->when($filters['status'] !== '' && TripStatus::tryFrom($filters['status']), fn ($query) => $query->where('status', $filters['status']))
            ->when($filters['unit'] > 0, fn ($query) => $query->where('unit_id', $filters['unit']))
            ->when($filters['pegawai'] > 0, fn ($query) => $query->where('user_id', $filters['pegawai']))
            ->when($filters['q'] !== '', function ($query) use ($filters): void {
                $query->where(fn ($query) => $query
                    ->where('maksud', 'like', '%'.$filters['q'].'%')
                    ->orWhere('tempat_tujuan', 'like', '%'.$filters['q'].'%')
                    ->orWhere('nomor_sppd', 'like', '%'.$filters['q'].'%'));
            })
            ->when($filters['dari'] !== '', fn ($query) => $query->whereDate('tanggal_selesai', '>=', $filters['dari']))
            ->when($filters['sampai'] !== '', fn ($query) => $query->whereDate('tanggal_mulai', '<=', $filters['sampai']))
            ->orderByDesc('tanggal_mulai')
            ->orderByDesc('id')
            ->paginate(15)
            ->withQueryString()
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
                'status' => $trip->status->value,
                'status_label' => $trip->status->label(),
                'nomor_sppd' => $trip->nomor_sppd,
                'total_biaya' => (float) ($trip->costs_sum_subtotal ?? 0),
            ]);

        return Inertia::render('Trips/Index', [
            'trips' => $trips,
            'units' => $this->unitOptions(),
            'employees' => $this->employeeOptions(false),
            'statuses' => $this->statusOptions(),
            'filters' => [
                ...$filters,
                'unit' => $filters['unit'] ?: null,
                'pegawai' => $filters['pegawai'] ?: null,
            ],
            'canManage' => $user->role->canManageData(),
        ]);
    }

    public function create(Request $request): Response
    {
        $this->authorize('create', Trip::class);

        return Inertia::render('Trips/Create', [
            'employees' => $this->employeeOptions(true),
            'defaults' => [
                'tanggal_mulai' => (string) $request->query('tanggal', ''),
                'unit' => (string) $request->query('unit', ''),
            ],
            'alatAngkut' => $this->transportOptions(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorize('create', Trip::class);

        $validated = $this->validateTrip($request);
        $this->ensureNoOverlap($validated);

        $trip = DB::transaction(function () use ($validated, $request): Trip {
            $employee = User::query()->findOrFail($validated['user_id']);

            $trip = Trip::query()->create([
                'user_id' => $employee->id,
                'unit_id' => $employee->unit_id,
                ...$this->tripAttributes($validated),
                'status' => $validated['status'] === TripStatus::Diajukan->value
                    ? TripStatus::Diajukan
                    : TripStatus::Draft,
                'created_by' => $request->user()->id,
            ]);

            $this->syncCosts($trip, $validated['costs'] ?? []);

            return $trip;
        });

        return redirect()
            ->route('trips.show', $trip)
            ->with('success', 'Perjalanan dinas disimpan.');
    }

    public function show(Request $request, Trip $trip): Response
    {
        $this->authorize('view', $trip);

        $trip->load([
            'user:id,name,nip,jabatan,golongan,unit_id',
            'user.unit:id,nama',
            'unit:id,nama',
            'creator:id,name',
            'approver:id,name',
            'costs',
        ]);

        $user = $request->user();
        $canManage = $user->role->canManageData();

        return Inertia::render('Trips/Show', [
            'trip' => [
                'id' => $trip->id,
                'nomor_sppd' => $trip->nomor_sppd,
                'status' => $trip->status->value,
                'status_label' => $trip->status->label(),
                'maksud' => $trip->maksud,
                'tempat_tujuan' => $trip->tempat_tujuan,
                'tanggal_mulai' => $trip->tanggal_mulai->toDateString(),
                'tanggal_selesai' => $trip->tanggal_selesai->toDateString(),
                'lama_hari' => $trip->lamaHari(),
                'alat_angkut' => $trip->alat_angkut,
                'sumber_dana' => $trip->sumber_dana,
                'catatan' => $trip->catatan,
                'pegawai' => [
                    'name' => $trip->user->name,
                    'nip' => $trip->user->nip,
                    'jabatan' => $trip->user->jabatan,
                    'golongan' => $trip->user->golongan,
                    'unit' => $trip->user->unit?->nama,
                ],
                'unit' => $trip->unit->nama,
                'total_biaya' => $trip->totalBiaya(),
                'costs' => $trip->costs->map(fn (TripCost $cost): array => [
                    'id' => $cost->id,
                    'jenis_biaya' => $cost->jenis_biaya,
                    'keterangan' => $cost->keterangan,
                    'jumlah' => $cost->jumlah,
                    'tarif' => (float) $cost->tarif,
                    'subtotal' => (float) $cost->subtotal,
                ])->values(),
                'alasan_penolakan' => $trip->alasan_penolakan,
                'alasan_pembatalan' => $trip->alasan_pembatalan,
                'created_by' => $trip->creator?->name,
                'created_at' => $trip->created_at?->toIso8601String(),
                'diajukan_at' => null,
                'disetujui_at' => $trip->disetujui_at?->toIso8601String(),
                'selesai_at' => $trip->selesai_at?->toIso8601String(),
                'dibatalkan_at' => $trip->dibatalkan_at?->toIso8601String(),
                'approver' => $trip->approver?->name,
            ],
            'actions' => [
                'canEdit' => $canManage && in_array($trip->status, [
                    TripStatus::Draft,
                    TripStatus::Diajukan,
                    TripStatus::Ditolak,
                    TripStatus::Disetujui,
                    TripStatus::Berlangsung,
                ], true),
                'locked' => ! $trip->status->canBeEdited(),
                'canDelete' => $canManage && $trip->status === TripStatus::Draft,
                'canSubmit' => $canManage && in_array($trip->status, [TripStatus::Draft, TripStatus::Ditolak], true),
                'canCancel' => $canManage && in_array($trip->status, [
                    TripStatus::Draft,
                    TripStatus::Diajukan,
                    TripStatus::Disetujui,
                    TripStatus::Berlangsung,
                ], true),
            ],
        ]);
    }

    public function edit(Request $request, Trip $trip): Response
    {
        $this->authorize('update', $trip);

        $trip->load(['costs', 'user:id,name']);

        return Inertia::render('Trips/Edit', [
            'trip' => [
                'id' => $trip->id,
                'user_id' => $trip->user_id,
                'maksud' => $trip->maksud,
                'tempat_tujuan' => $trip->tempat_tujuan,
                'tanggal_mulai' => $trip->tanggal_mulai->toDateString(),
                'tanggal_selesai' => $trip->tanggal_selesai->toDateString(),
                'alat_angkut' => $trip->alat_angkut,
                'sumber_dana' => $trip->sumber_dana,
                'catatan' => $trip->catatan ?? '',
                'status' => $trip->status->value,
                'status_label' => $trip->status->label(),
                'costs' => $trip->costs->map(fn (TripCost $cost): array => [
                    'jenis_biaya' => $cost->jenis_biaya,
                    'keterangan' => $cost->keterangan ?? '',
                    'jumlah' => $cost->jumlah,
                    'tarif' => (float) $cost->tarif,
                ])->values(),
            ],
            'employees' => $this->employeeOptions(true, $trip->user_id),
            'alatAngkut' => $this->transportOptions(),
            'locked' => ! $trip->status->canBeEdited(),
        ]);
    }

    public function update(Request $request, Trip $trip): RedirectResponse
    {
        $this->authorize('update', $trip);

        if (! $trip->status->canBeEdited()) {
            $validated = $request->validate([
                'catatan' => ['nullable', 'string', 'max:2000'],
            ]);

            $trip->update(['catatan' => $validated['catatan'] ?? null]);

            return back()->with('success', 'Catatan perjalanan diperbarui.');
        }

        $validated = $this->validateTrip($request, $trip);
        $this->ensureNoOverlap($validated, $trip);

        DB::transaction(function () use ($trip, $validated): void {
            $employee = User::query()->findOrFail($validated['user_id']);

            $trip->update([
                'user_id' => $employee->id,
                'unit_id' => $employee->unit_id,
                ...$this->tripAttributes($validated),
            ]);

            if ($validated['status'] === TripStatus::Diajukan->value
                && $trip->status->canTransitionTo(TripStatus::Diajukan)) {
                $trip->update(['status' => TripStatus::Diajukan]);
            }

            $this->syncCosts($trip, $validated['costs'] ?? []);
            $trip->unsetRelation('costs');
        });

        return redirect()
            ->route('trips.show', $trip)
            ->with('success', 'Perjalanan dinas diperbarui.');
    }

    public function submit(Trip $trip): RedirectResponse
    {
        $this->authorize('update', $trip);

        if (! $trip->status->canTransitionTo(TripStatus::Diajukan)) {
            return back()->with('error', 'Perjalanan dengan status '.$trip->status->label().' tidak dapat diajukan.');
        }

        $trip->update(['status' => TripStatus::Diajukan]);

        return back()->with('success', 'Perjalanan diajukan ke Pejabat Penyetuju.');
    }

    public function cancel(Request $request, Trip $trip): RedirectResponse
    {
        $this->authorize('update', $trip);

        if (! in_array($trip->status, [
            TripStatus::Draft,
            TripStatus::Diajukan,
            TripStatus::Disetujui,
            TripStatus::Berlangsung,
        ], true)) {
            return back()->with('error', 'Perjalanan dengan status '.$trip->status->label().' tidak dapat dibatalkan.');
        }

        $validated = $request->validate([
            'alasan_pembatalan' => ['required', 'string', 'max:500'],
        ]);

        $trip->update([
            'status' => TripStatus::Dibatalkan,
            'alasan_pembatalan' => $validated['alasan_pembatalan'],
            'dibatalkan_at' => now(),
            'dibatalkan_oleh' => $request->user()->id,
        ]);

        return back()->with('success', 'Perjalanan dibatalkan.');
    }

    public function destroy(Trip $trip): RedirectResponse
    {
        $this->authorize('delete', $trip);

        $trip->delete();

        return redirect()->route('trips.index')->with('success', 'Perjalanan dinas dihapus.');
    }

    /**
     * @return array<string, mixed>
     */
    private function validateTrip(Request $request, ?Trip $trip = null): array
    {
        $validated = $request->validate([
            'user_id' => [
                'required',
                Rule::exists('users', 'id')->where(fn ($query) => $query
                    ->where('role', Role::Pegawai->value)
                    ->where('is_active', true)
                    ->whereNotNull('unit_id')),
            ],
            'maksud' => ['required', 'string', 'max:255'],
            'tempat_tujuan' => ['required', 'string', 'max:255'],
            'tanggal_mulai' => ['required', 'date'],
            'tanggal_selesai' => ['required', 'date', 'after_or_equal:tanggal_mulai'],
            'alat_angkut' => ['required', 'string', 'max:80'],
            'sumber_dana' => ['required', 'string', 'max:120'],
            'catatan' => ['nullable', 'string', 'max:2000'],
            'status' => ['sometimes', Rule::in([TripStatus::Draft->value, TripStatus::Diajukan->value])],
            'costs' => ['nullable', 'array'],
            'costs.*.jenis_biaya' => ['required', 'string', 'max:80'],
            'costs.*.keterangan' => ['nullable', 'string', 'max:160'],
            'costs.*.jumlah' => ['required', 'integer', 'min:1', 'max:9999'],
            'costs.*.tarif' => ['required', 'numeric', 'min:0', 'max:999999999'],
        ], [
            'user_id.exists' => 'Pegawai harus aktif, memiliki unit kerja, dan berperan sebagai Pegawai.',
            'tanggal_selesai.after_or_equal' => 'Tanggal selesai tidak boleh lebih awal dari tanggal mulai.',
        ]);

        $validated['status'] ??= TripStatus::Draft->value;

        return $validated;
    }

    /**
     * @param  array<string, mixed>  $validated
     */
    private function ensureNoOverlap(array $validated, ?Trip $trip = null): void
    {
        $overlap = Trip::query()
            ->with('user:id,name')
            ->where('user_id', $validated['user_id'])
            ->whereIn('status', [
                TripStatus::Draft,
                TripStatus::Diajukan,
                TripStatus::Disetujui,
                TripStatus::Berlangsung,
            ])
            ->when($trip, fn ($query) => $query->whereKeyNot($trip->id))
            ->where('tanggal_mulai', '<=', $validated['tanggal_selesai'])
            ->where('tanggal_selesai', '>=', $validated['tanggal_mulai'])
            ->orderBy('tanggal_mulai')
            ->first();

        if ($overlap === null) {
            return;
        }

        throw ValidationException::withMessages([
            'tanggal_mulai' => 'Jadwal bentrok dengan perjalanan "'.$overlap->maksud.'" ('
                .$overlap->tanggal_mulai->translatedFormat('j F Y').' sampai '
                .$overlap->tanggal_selesai->translatedFormat('j F Y').').',
        ]);
    }

    /**
     * @param  array<string, mixed>  $validated
     * @return array<string, mixed>
     */
    private function tripAttributes(array $validated): array
    {
        return [
            'maksud' => $validated['maksud'],
            'tempat_tujuan' => $validated['tempat_tujuan'],
            'tanggal_mulai' => $validated['tanggal_mulai'],
            'tanggal_selesai' => $validated['tanggal_selesai'],
            'alat_angkut' => $validated['alat_angkut'],
            'sumber_dana' => $validated['sumber_dana'],
            'catatan' => $validated['catatan'] ?? null,
        ];
    }

    /**
     * @param  array<int, array<string, mixed>>  $costs
     */
    private function syncCosts(Trip $trip, array $costs): void
    {
        $trip->costs()->delete();

        foreach ($costs as $cost) {
            $trip->costs()->create([
                'jenis_biaya' => $cost['jenis_biaya'],
                'keterangan' => $cost['keterangan'] ?? null,
                'jumlah' => (int) $cost['jumlah'],
                'tarif' => (float) $cost['tarif'],
            ]);
        }
    }

    /**
     * @return array<int, array{value: int, label: string}>
     */
    private function employeeOptions(bool $onlyActive, ?int $includeId = null): array
    {
        return User::query()
            ->where('role', Role::Pegawai)
            ->when($onlyActive, fn ($query) => $query->where('is_active', true))
            ->where(fn ($query) => $query->whereNotNull('unit_id')
                ->when($includeId, fn ($query) => $query->orWhere('id', $includeId)))
            ->with('unit:id,nama')
            ->orderBy('name')
            ->get()
            ->map(fn (User $user): array => [
                'value' => $user->id,
                'label' => $user->name.' · '.($user->unit?->nama ?? '-'),
            ])
            ->all();
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
     * @return array<int, array{value: string, label: string}>
     */
    private function statusOptions(): array
    {
        return collect(TripStatus::cases())
            ->map(fn (TripStatus $status): array => [
                'value' => $status->value,
                'label' => $status->label(),
            ])
            ->all();
    }

    /**
     * @return array<int, string>
     */
    private function transportOptions(): array
    {
        return ['Darat', 'Udara', 'Laut'];
    }
}
