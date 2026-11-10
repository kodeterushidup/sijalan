<?php

namespace App\Services;

use App\Models\Setting;
use App\Models\Trip;
use Illuminate\Support\Str;

class SppdNumberGenerator
{
    /**
     * Build the SPPD number for a trip. Must run inside a database transaction.
     *
     * @return array{nomor: string, urut: int, tahun: int}
     */
    public function generate(Trip $trip): array
    {
        $trip->loadMissing('unit');

        $setting = Setting::current();
        $tahun = (int) $trip->tanggal_mulai->year;

        $lastUrut = Trip::query()
            ->where('unit_id', $trip->unit_id)
            ->where('tahun', $tahun)
            ->orderByDesc('nomor_urut')
            ->lockForUpdate()
            ->value('nomor_urut');

        $urut = (int) $lastUrut + 1;

        $nomor = strtr($setting->format_nomor, [
            '{urut}' => str_pad((string) $urut, 3, '0', STR_PAD_LEFT),
            '{kode_unit}' => Str::upper($trip->unit->kode),
            '{tahun}' => (string) $tahun,
        ]);

        return [
            'nomor' => $nomor,
            'urut' => $urut,
            'tahun' => $tahun,
        ];
    }
}
