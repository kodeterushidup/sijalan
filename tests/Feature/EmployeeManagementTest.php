<?php

namespace Tests\Feature;

use App\Enums\Role;
use App\Models\Unit;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Inertia\Testing\AssertableInertia;
use Tests\TestCase;

class EmployeeManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_pegawai_cannot_access_employee_management(): void
    {
        $this->actingAs(User::factory()->create())
            ->get('/pegawai')
            ->assertForbidden();
    }

    public function test_admin_sees_only_employees(): void
    {
        $unit = Unit::factory()->create();
        User::factory()->withUnit($unit)->create(['name' => 'Pegawai Satu']);
        User::factory()->admin()->create(['name' => 'Admin Satu']);

        $this->actingAs(User::factory()->admin()->create())
            ->get('/pegawai')
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->component('Employees/Index')
                ->has('employees.data', 1)
                ->where('employees.data.0.name', 'Pegawai Satu'));
    }

    public function test_admin_can_create_an_employee(): void
    {
        $unit = Unit::factory()->create();

        $this->actingAs(User::factory()->admin()->create())
            ->post('/pegawai', [
                'name' => 'Pegawai Baru',
                'nip' => '199001012020011001',
                'jabatan' => 'Analis Kebijakan',
                'golongan' => 'III/b',
                'unit_id' => $unit->id,
                'email' => 'pegawai.baru@example.test',
                'no_hp' => '081234567890',
                'password' => 'rahasia123',
                'password_confirmation' => 'rahasia123',
            ])
            ->assertRedirect('/pegawai');

        $employee = User::query()->where('email', 'pegawai.baru@example.test')->firstOrFail();

        $this->assertSame(Role::Pegawai, $employee->role);
        $this->assertTrue($employee->is_active);
    }

    public function test_employee_requires_eighteen_digit_nip(): void
    {
        $unit = Unit::factory()->create();

        $this->actingAs(User::factory()->admin()->create())
            ->post('/pegawai', [
                'name' => 'Pegawai Baru',
                'nip' => '123',
                'unit_id' => $unit->id,
                'email' => 'pegawai.baru@example.test',
                'password' => 'rahasia123',
                'password_confirmation' => 'rahasia123',
            ])
            ->assertSessionHasErrors('nip');
    }

    public function test_admin_can_update_an_employee_without_changing_password(): void
    {
        $unit = Unit::factory()->create();
        $employee = User::factory()->withUnit($unit)->create(['password' => 'lama12345']);
        $oldPassword = $employee->password;

        $this->actingAs(User::factory()->admin()->create())
            ->patch("/pegawai/{$employee->id}", [
                'name' => 'Nama Diperbarui',
                'nip' => $employee->nip,
                'unit_id' => $unit->id,
                'email' => $employee->email,
                'password' => '',
                'is_active' => true,
            ])
            ->assertRedirect('/pegawai');

        $employee->refresh();

        $this->assertSame('Nama Diperbarui', $employee->name);
        $this->assertSame($oldPassword, $employee->password);
    }

    public function test_admin_cannot_edit_a_non_employee_account(): void
    {
        $admin = User::factory()->admin()->create();
        $otherAdmin = User::factory()->admin()->create();

        $this->actingAs($admin)
            ->get("/pegawai/{$otherAdmin->id}/edit")
            ->assertNotFound();
    }

    public function test_csv_import_creates_valid_rows_and_reports_failures(): void
    {
        $unit = Unit::factory()->create(['kode' => 'SEK']);

        $csv = implode("\n", [
            'nip,nama,jabatan,golongan,kode_unit,email',
            '199001012020011001,Pegawai Impor,Analis,III/b,SEK,impor@example.test',
            '123,Pegawai Salah,Staf,III/a,SEK,salah@example.test',
            '199001012020011002,Pegawai Tanpa Unit,Staf,III/a,XXX,tanpaunit@example.test',
        ]);

        $this->actingAs(User::factory()->admin()->create())
            ->post('/pegawai/impor', [
                'file' => UploadedFile::fake()->createWithContent('pegawai.csv', $csv),
            ])
            ->assertRedirect()
            ->assertSessionHas('success')
            ->assertSessionHas('import_errors');

        $this->assertDatabaseHas('users', [
            'email' => 'impor@example.test',
            'role' => Role::Pegawai->value,
        ]);
        $this->assertDatabaseMissing('users', ['email' => 'salah@example.test']);
        $this->assertDatabaseMissing('users', ['email' => 'tanpaunit@example.test']);
    }

    public function test_import_rejects_non_csv_files(): void
    {
        $this->actingAs(User::factory()->admin()->create())
            ->post('/pegawai/impor', [
                'file' => UploadedFile::fake()->create('pegawai.pdf', 100, 'application/pdf'),
            ])
            ->assertSessionHasErrors('file');
    }
}
