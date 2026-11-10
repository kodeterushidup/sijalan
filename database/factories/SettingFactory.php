<?php

namespace Database\Factories;

use App\Models\Setting;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Setting>
 */
class SettingFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'nama_instansi' => 'Dinas Contoh',
            'alamat' => 'Jl. Contoh No. 1, Kota Contoh',
            'format_nomor' => '090/SPPD/{urut}/{kode_unit}/{tahun}',
            'nama_pejabat' => 'Kepala Dinas Contoh',
            'nip_pejabat' => '197001012000031001',
        ];
    }
}
