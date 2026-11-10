<?php

namespace Tests\Feature;

use App\Models\Setting;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia;
use Tests\TestCase;

class SettingTest extends TestCase
{
    use RefreshDatabase;

    public function test_only_super_admin_can_open_settings(): void
    {
        $this->actingAs(User::factory()->admin()->create())
            ->get('/pengaturan')
            ->assertForbidden();

        $this->actingAs(User::factory()->create())
            ->get('/pengaturan')
            ->assertForbidden();

        $this->actingAs(User::factory()->superAdmin()->create())
            ->get('/pengaturan')
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->component('Settings/Edit')
                ->has('setting.nama_instansi'));
    }

    public function test_super_admin_can_update_institution_settings(): void
    {
        $this->actingAs(User::factory()->superAdmin()->create())
            ->patch('/pengaturan', [
                'nama_instansi' => 'Dinas Pendidikan',
                'alamat' => 'Jl. Pendidikan No. 1',
                'format_nomor' => '090/SPPD/{urut}/{kode_unit}/{tahun}',
                'nama_pejabat' => 'Kepala Dinas',
                'nip_pejabat' => '197001012000031001',
            ])
            ->assertRedirect();

        $setting = Setting::current();

        $this->assertSame('Dinas Pendidikan', $setting->nama_instansi);
        $this->assertSame('Kepala Dinas', $setting->nama_pejabat);
    }

    public function test_super_admin_can_upload_and_remove_logo(): void
    {
        Storage::fake('public');
        $superAdmin = User::factory()->superAdmin()->create();

        $this->actingAs($superAdmin)
            ->patch('/pengaturan', [
                'nama_instansi' => 'Dinas Pendidikan',
                'format_nomor' => '090/SPPD/{urut}/{kode_unit}/{tahun}',
                'logo' => UploadedFile::fake()->image('logo.png', 200, 200),
            ])
            ->assertRedirect();

        $setting = Setting::current();

        $this->assertNotNull($setting->logo_path);
        Storage::disk('public')->assertExists($setting->logo_path);

        $this->actingAs($superAdmin)
            ->patch('/pengaturan', [
                'nama_instansi' => 'Dinas Pendidikan',
                'format_nomor' => '090/SPPD/{urut}/{kode_unit}/{tahun}',
                'remove_logo' => true,
            ])
            ->assertRedirect();

        $this->assertNull(Setting::current()->logo_path);
        Storage::disk('public')->assertMissing($setting->logo_path);
    }

    public function test_nip_pejabat_must_be_eighteen_digits(): void
    {
        $this->actingAs(User::factory()->superAdmin()->create())
            ->patch('/pengaturan', [
                'nama_instansi' => 'Dinas Pendidikan',
                'format_nomor' => '090/SPPD/{urut}/{kode_unit}/{tahun}',
                'nip_pejabat' => '1970',
            ])
            ->assertSessionHasErrors('nip_pejabat');
    }
}
