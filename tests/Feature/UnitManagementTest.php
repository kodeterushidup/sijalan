<?php

namespace Tests\Feature;

use App\Models\Trip;
use App\Models\Unit;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia;
use Tests\TestCase;

class UnitManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_pegawai_cannot_access_unit_management(): void
    {
        $this->actingAs(User::factory()->create())
            ->get('/unit')
            ->assertForbidden();
    }

    public function test_admin_sees_units_with_counts(): void
    {
        $unit = Unit::factory()->create(['kode' => 'SEK', 'nama' => 'Sekretariat']);
        $employee = User::factory()->withUnit($unit)->create();
        Trip::factory()->create(['unit_id' => $unit->id, 'user_id' => $employee->id]);

        $this->actingAs(User::factory()->admin()->create())
            ->get('/unit')
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->component('Units/Index')
                ->has('units', 1)
                ->where('units.0.kode', 'SEK')
                ->where('units.0.users_count', 1)
                ->where('units.0.trips_count', 1));
    }

    public function test_admin_can_create_and_update_a_unit(): void
    {
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)
            ->post('/unit', ['kode' => 'bid-a', 'nama' => 'Bidang Perencanaan'])
            ->assertRedirect();

        $unit = Unit::query()->where('kode', 'BID-A')->firstOrFail();

        $this->actingAs($admin)
            ->patch("/unit/{$unit->id}", ['kode' => 'BID-A', 'nama' => 'Bidang Perencanaan dan Evaluasi'])
            ->assertRedirect('/unit');

        $this->assertSame('Bidang Perencanaan dan Evaluasi', $unit->fresh()->nama);
    }

    public function test_unit_code_must_be_unique(): void
    {
        Unit::factory()->create(['kode' => 'SEK']);

        $this->actingAs(User::factory()->admin()->create())
            ->post('/unit', ['kode' => 'SEK', 'nama' => 'Sekretariat Baru'])
            ->assertSessionHasErrors('kode');
    }

    public function test_unit_with_employees_cannot_be_deleted(): void
    {
        $unit = Unit::factory()->create();
        User::factory()->withUnit($unit)->create();

        $this->actingAs(User::factory()->admin()->create())
            ->delete("/unit/{$unit->id}")
            ->assertSessionHas('error');

        $this->assertDatabaseHas('units', ['id' => $unit->id]);
    }

    public function test_unused_unit_can_be_deleted(): void
    {
        $unit = Unit::factory()->create();

        $this->actingAs(User::factory()->admin()->create())
            ->delete("/unit/{$unit->id}")
            ->assertSessionHas('success');

        $this->assertDatabaseMissing('units', ['id' => $unit->id]);
    }
}
