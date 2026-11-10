<?php

namespace Tests\Feature;

use App\Enums\TripStatus;
use App\Models\Trip;
use App\Models\Unit;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TripScheduleTest extends TestCase
{
    use RefreshDatabase;

    public function test_approved_trips_become_ongoing_when_the_start_date_arrives(): void
    {
        $unit = Unit::factory()->create();
        $pegawai = User::factory()->withUnit($unit)->create();

        $started = Trip::factory()->create([
            'user_id' => $pegawai->id,
            'unit_id' => $unit->id,
            'tanggal_mulai' => now()->subDay()->toDateString(),
            'tanggal_selesai' => now()->addDay()->toDateString(),
            'status' => TripStatus::Disetujui,
        ]);

        $startsToday = Trip::factory()->create([
            'user_id' => $pegawai->id,
            'unit_id' => $unit->id,
            'tanggal_mulai' => now()->toDateString(),
            'tanggal_selesai' => now()->addDays(2)->toDateString(),
            'status' => TripStatus::Disetujui,
        ]);

        $future = Trip::factory()->create([
            'user_id' => $pegawai->id,
            'unit_id' => $unit->id,
            'tanggal_mulai' => now()->addWeek()->toDateString(),
            'tanggal_selesai' => now()->addDays(8)->toDateString(),
            'status' => TripStatus::Disetujui,
        ]);

        $draft = Trip::factory()->create([
            'user_id' => $pegawai->id,
            'unit_id' => $unit->id,
            'tanggal_mulai' => now()->subDay()->toDateString(),
            'tanggal_selesai' => now()->addDay()->toDateString(),
            'status' => TripStatus::Draft,
        ]);

        $this->artisan('trips:advance-status')->assertSuccessful();

        $this->assertSame(TripStatus::Berlangsung, $started->fresh()->status);
        $this->assertSame(TripStatus::Berlangsung, $startsToday->fresh()->status);
        $this->assertSame(TripStatus::Disetujui, $future->fresh()->status);
        $this->assertSame(TripStatus::Draft, $draft->fresh()->status);
    }
}
