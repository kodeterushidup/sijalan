<?php

namespace Database\Seeders;

use App\Enums\Role;
use App\Models\Unit;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $sekretariat = Unit::query()->create(['kode' => 'SEK', 'nama' => 'Sekretariat']);
        $bidangA = Unit::query()->create(['kode' => 'BID-A', 'nama' => 'Bidang Perencanaan']);
        $bidangB = Unit::query()->create(['kode' => 'BID-B', 'nama' => 'Bidang Keuangan']);

        User::factory()->superAdmin()->create([
            'name' => 'Super Admin',
            'email' => 'superadmin@sijalan.test',
            'unit_id' => $sekretariat->id,
        ]);

        User::factory()->admin()->create([
            'name' => 'Admin Kepegawaian',
            'email' => 'admin@sijalan.test',
            'unit_id' => $sekretariat->id,
        ]);

        User::factory()->pejabat()->create([
            'name' => 'Pejabat Penyetuju',
            'email' => 'pejabat@sijalan.test',
            'unit_id' => $sekretariat->id,
        ]);

        User::factory()->create([
            'name' => 'Pegawai Contoh',
            'email' => 'pegawai@sijalan.test',
            'role' => Role::Pegawai,
            'unit_id' => $bidangA->id,
        ]);

        User::factory()->create([
            'name' => 'Pegawai Kedua',
            'email' => 'pegawai2@sijalan.test',
            'role' => Role::Pegawai,
            'unit_id' => $bidangB->id,
        ]);

        $this->call(DemoSeeder::class);
    }
}
