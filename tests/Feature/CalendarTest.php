<?php

namespace Tests\Feature;

use App\Enums\TripStatus;
use App\Models\Trip;
use App\Models\Unit;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia;
use Tests\TestCase;

class CalendarTest extends TestCase
{
    use RefreshDatabase;

    public function test_pegawai_only_sees_their_own_trips(): void
    {
        $unit = Unit::factory()->create();
        $pegawai = User::factory()->withUnit($unit)->create();
        $other = User::factory()->withUnit($unit)->create();

        Trip::factory()->create([
            'user_id' => $pegawai->id,
            'unit_id' => $unit->id,
            'maksud' => 'Milik sendiri',
            'tanggal_mulai' => '2026-11-10',
            'tanggal_selesai' => '2026-11-11',
        ]);
        Trip::factory()->create([
            'user_id' => $other->id,
            'unit_id' => $unit->id,
            'maksud' => 'Milik orang lain',
            'tanggal_mulai' => '2026-11-10',
            'tanggal_selesai' => '2026-11-11',
        ]);

        $this->actingAs($pegawai)
            ->get('/kalender?bulan=2026-11')
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->component('Calendar/Index')
                ->has('trips', 1)
                ->where('trips.0.maksud', 'Milik sendiri')
                ->where('canCreate', false)
                ->where('units', []));
    }

    public function test_admin_sees_all_units_and_can_filter_by_unit(): void
    {
        $unitA = Unit::factory()->create(['nama' => 'Sekretariat']);
        $unitB = Unit::factory()->create(['nama' => 'Bidang Anggaran']);
        $pegawaiA = User::factory()->withUnit($unitA)->create();
        $pegawaiB = User::factory()->withUnit($unitB)->create();

        Trip::factory()->create([
            'user_id' => $pegawaiA->id,
            'unit_id' => $unitA->id,
            'maksud' => 'Rapat Sekretariat',
            'tanggal_mulai' => '2026-11-10',
            'tanggal_selesai' => '2026-11-10',
        ]);
        Trip::factory()->create([
            'user_id' => $pegawaiB->id,
            'unit_id' => $unitB->id,
            'maksud' => 'Rapat Anggaran',
            'tanggal_mulai' => '2026-11-12',
            'tanggal_selesai' => '2026-11-12',
        ]);

        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)
            ->get('/kalender?bulan=2026-11')
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->has('trips', 2)
                ->where('canCreate', true));

        $this->actingAs($admin)
            ->get("/kalender?bulan=2026-11&unit={$unitA->id}")
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->has('trips', 1)
                ->where('trips.0.maksud', 'Rapat Sekretariat'));
    }

    public function test_month_grid_starts_on_monday_and_navigation_is_correct(): void
    {
        $this->actingAs(User::factory()->admin()->create())
            ->get('/kalender?bulan=2026-11')
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->component('Calendar/Index')
                ->where('bulan', '2026-11-01')
                ->where('bulanLabel', 'November 2026')
                ->where('prev', '2026-10')
                ->where('next', '2026-12')
                ->has('days', 42)
                ->where('days.0.date', '2026-10-26')
                ->where('days.0.in_month', false)
                ->where('days.6.date', '2026-11-01')
                ->where('days.6.in_month', true));
    }

    public function test_invalid_month_falls_back_to_the_current_month(): void
    {
        $this->actingAs(User::factory()->admin()->create())
            ->get('/kalender?bulan=2026-13')
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->where('bulan', now()->startOfMonth()->toDateString()));
    }

    public function test_rejected_and_cancelled_trips_are_hidden_but_completed_are_shown(): void
    {
        $unit = Unit::factory()->create();
        $pegawai = User::factory()->withUnit($unit)->create();

        foreach ([TripStatus::Ditolak, TripStatus::Dibatalkan, TripStatus::Selesai] as $status) {
            Trip::factory()->create([
                'user_id' => $pegawai->id,
                'unit_id' => $unit->id,
                'maksud' => 'Status '.$status->value,
                'tanggal_mulai' => '2026-11-15',
                'tanggal_selesai' => '2026-11-15',
                'status' => $status,
            ]);
        }

        $this->actingAs($pegawai)
            ->get('/kalender?bulan=2026-11')
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->has('trips', 1)
                ->where('trips.0.maksud', 'Status selesai'));
    }

    public function test_clicking_a_date_prefills_the_create_form(): void
    {
        $this->actingAs(User::factory()->admin()->create())
            ->get('/perjalanan/baru?tanggal=2026-12-05')
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->component('Trips/Create')
                ->where('defaults.tanggal_mulai', '2026-12-05'));
    }

    public function test_pejabat_sees_all_trips_but_cannot_create(): void
    {
        $unit = Unit::factory()->create();
        $pegawai = User::factory()->withUnit($unit)->create();
        Trip::factory()->create([
            'user_id' => $pegawai->id,
            'unit_id' => $unit->id,
            'tanggal_mulai' => '2026-11-10',
            'tanggal_selesai' => '2026-11-10',
        ]);

        $this->actingAs(User::factory()->pejabat()->create())
            ->get('/kalender?bulan=2026-11')
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->has('trips', 1)
                ->where('canCreate', false)
                ->has('units'));
    }
}
