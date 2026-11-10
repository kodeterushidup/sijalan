<?php

namespace App\Http\Controllers;

use App\Enums\TripStatus;
use App\Models\Setting;
use App\Models\Trip;
use Inertia\Inertia;
use Inertia\Response;

class SppdController extends Controller
{
    public function show(Trip $trip): Response
    {
        $this->authorize('view', $trip);

        abort_unless(in_array($trip->status, [
            TripStatus::Disetujui,
            TripStatus::Berlangsung,
            TripStatus::Selesai,
        ], true), 404);

        $trip->load(['user.unit', 'unit', 'costs', 'approver']);

        $setting = Setting::current();
        $approver = $trip->approver;

        return Inertia::render('Trips/Sppd', [
            'trip' => [
                'id' => $trip->id,
                'nomor_sppd' => $trip->nomor_sppd,
                'maksud' => $trip->maksud,
                'tempat_tujuan' => $trip->tempat_tujuan,
                'tanggal_mulai' => $trip->tanggal_mulai->toDateString(),
                'tanggal_selesai' => $trip->tanggal_selesai->toDateString(),
                'lama_hari' => $trip->lamaHari(),
                'alat_angkut' => $trip->alat_angkut,
                'sumber_dana' => $trip->sumber_dana,
                'pegawai' => [
                    'name' => $trip->user->name,
                    'nip' => $trip->user->nip,
                    'jabatan' => $trip->user->jabatan,
                    'golongan' => $trip->user->golongan,
                    'unit' => $trip->user->unit?->nama ?? $trip->unit->nama,
                ],
                'total_biaya' => $trip->totalBiaya(),
                'costs' => $trip->costs->map(fn ($cost): array => [
                    'id' => $cost->id,
                    'jenis_biaya' => $cost->jenis_biaya,
                    'keterangan' => $cost->keterangan,
                    'jumlah' => $cost->jumlah,
                    'tarif' => (float) $cost->tarif,
                    'subtotal' => (float) $cost->subtotal,
                ])->values(),
            ],
            'instansi' => [
                'nama' => $setting->nama_instansi,
                'alamat' => $setting->alamat,
                'logo_url' => $setting->logoUrl(),
            ],
            'penandaTangan' => [
                'nama' => $approver?->name ?? $setting->nama_pejabat,
                'nip' => $approver?->nip ?? $setting->nip_pejabat,
                'ttd_url' => $approver?->ttd_path ? route('ttd.show', $approver) : null,
            ],
            'dicetak' => now()->translatedFormat('j F Y'),
        ]);
    }
}
