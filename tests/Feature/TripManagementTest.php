<?php

namespace Tests\Feature;

use App\Enums\TripStatus;
use App\Models\Trip;
use App\Models\Unit;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia;
use Tests\TestCase;

class TripManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_pegawai_cannot_open_create_or_edit_forms(): void
    {
        $unit = Unit::factory()->create();
        $pegawai = User::factory()->withUnit($unit)->create();
        $trip = Trip::factory()->create(['user_id' => $pegawai->id, 'unit_id' => $unit->id]);

        $this->actingAs($pegawai)->get('/perjalanan/baru')->assertForbidden();
        $this->actingAs($pegawai)->get("/perjalanan/{$trip->id}/edit")->assertForbidden();
        $this->actingAs($pegawai)->post('/perjalanan', [])->assertForbidden();
    }

    public function test_pegawai_only_sees_their_own_trips(): void
    {
        $unit = Unit::factory()->create();
        $pegawai = User::factory()->withUnit($unit)->create();
        $other = User::factory()->withUnit($unit)->create();

        Trip::factory()->create(['user_id' => $pegawai->id, 'unit_id' => $unit->id, 'maksud' => 'Milik sendiri']);
        Trip::factory()->create(['user_id' => $other->id, 'unit_id' => $unit->id, 'maksud' => 'Milik orang lain']);

        $this->actingAs($pegawai)
            ->get('/perjalanan')
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->component('Trips/Index')
                ->has('trips.data', 1)
                ->where('trips.data.0.maksud', 'Milik sendiri'));

        $this->actingAs($pegawai)
            ->get('/perjalanan/'.Trip::query()->where('maksud', 'Milik orang lain')->value('id'))
            ->assertForbidden();
    }

    public function test_admin_can_create_trip_with_costs_and_unit_follows_employee(): void
    {
        $unit = Unit::factory()->create();
        $pegawai = User::factory()->withUnit($unit)->create();

        $response = $this->actingAs(User::factory()->admin()->create())
            ->post('/perjalanan', [
                'user_id' => $pegawai->id,
                'maksud' => 'Rapat Koordinasi',
                'tempat_tujuan' => 'Jakarta',
                'tanggal_mulai' => '2026-11-20',
                'tanggal_selesai' => '2026-11-22',
                'alat_angkut' => 'Udara',
                'sumber_dana' => 'APBD 2026',
                'catatan' => 'Bawa dokumen',
                'status' => 'draft',
                'costs' => [
                    ['jenis_biaya' => 'Uang Harian', 'keterangan' => null, 'jumlah' => 3, 'tarif' => 150000],
                    ['jenis_biaya' => 'Transport', 'keterangan' => 'Pulang pergi', 'jumlah' => 2, 'tarif' => 500000],
                ],
            ]);

        $trip = Trip::query()->where('maksud', 'Rapat Koordinasi')->firstOrFail();

        $response->assertRedirect("/perjalanan/{$trip->id}");

        $this->assertSame($unit->id, $trip->unit_id);
        $this->assertSame(TripStatus::Draft, $trip->status);
        $this->assertSame(3, $trip->lamaHari());
        $this->assertCount(2, $trip->costs);
        $this->assertSame(1450000.0, $trip->totalBiaya());
    }

    public function test_trip_can_be_created_directly_as_submitted(): void
    {
        $unit = Unit::factory()->create();
        $pegawai = User::factory()->withUnit($unit)->create();

        $this->actingAs(User::factory()->admin()->create())
            ->post('/perjalanan', [
                'user_id' => $pegawai->id,
                'maksud' => 'Sosialisasi',
                'tempat_tujuan' => 'Bandung',
                'tanggal_mulai' => '2026-12-01',
                'tanggal_selesai' => '2026-12-02',
                'alat_angkut' => 'Darat',
                'sumber_dana' => 'APBD',
                'status' => 'diajukan',
            ])
            ->assertRedirect();

        $this->assertSame(TripStatus::Diajukan, Trip::query()->firstOrFail()->status);
    }

    public function test_end_date_cannot_be_before_start_date(): void
    {
        $unit = Unit::factory()->create();
        $pegawai = User::factory()->withUnit($unit)->create();

        $this->actingAs(User::factory()->admin()->create())
            ->post('/perjalanan', [
                'user_id' => $pegawai->id,
                'maksud' => 'Rapat',
                'tempat_tujuan' => 'Jakarta',
                'tanggal_mulai' => '2026-11-20',
                'tanggal_selesai' => '2026-11-19',
                'alat_angkut' => 'Darat',
                'sumber_dana' => 'APBD',
            ])
            ->assertSessionHasErrors('tanggal_selesai');

        $this->assertDatabaseCount('trips', 0);
    }

    public function test_overlapping_schedule_is_rejected_with_the_conflicting_trip(): void
    {
        $unit = Unit::factory()->create();
        $pegawai = User::factory()->withUnit($unit)->create();
        Trip::factory()->create([
            'user_id' => $pegawai->id,
            'unit_id' => $unit->id,
            'maksud' => 'Perjalanan Lama',
            'tanggal_mulai' => '2026-11-18',
            'tanggal_selesai' => '2026-11-20',
            'status' => TripStatus::Draft,
        ]);

        $response = $this->actingAs(User::factory()->admin()->create())
            ->post('/perjalanan', [
                'user_id' => $pegawai->id,
                'maksud' => 'Perjalanan Baru',
                'tempat_tujuan' => 'Surabaya',
                'tanggal_mulai' => '2026-11-20',
                'tanggal_selesai' => '2026-11-21',
                'alat_angkut' => 'Darat',
                'sumber_dana' => 'APBD',
            ]);

        $response->assertSessionHasErrors('tanggal_mulai');
        $this->assertStringContainsString('Perjalanan Lama', (string) session('errors')->first('tanggal_mulai'));

        $this->assertDatabaseMissing('trips', ['maksud' => 'Perjalanan Baru']);
    }

    public function test_rejected_or_cancelled_trips_do_not_block_new_schedule(): void
    {
        $unit = Unit::factory()->create();
        $pegawai = User::factory()->withUnit($unit)->create();

        foreach ([TripStatus::Ditolak, TripStatus::Dibatalkan] as $status) {
            Trip::factory()->create([
                'user_id' => $pegawai->id,
                'unit_id' => $unit->id,
                'tanggal_mulai' => '2026-11-18',
                'tanggal_selesai' => '2026-11-20',
                'status' => $status,
            ]);
        }

        $this->actingAs(User::factory()->admin()->create())
            ->post('/perjalanan', [
                'user_id' => $pegawai->id,
                'maksud' => 'Jadwal Baru',
                'tempat_tujuan' => 'Surabaya',
                'tanggal_mulai' => '2026-11-19',
                'tanggal_selesai' => '2026-11-20',
                'alat_angkut' => 'Darat',
                'sumber_dana' => 'APBD',
            ])
            ->assertSessionHasNoErrors();

        $this->assertDatabaseHas('trips', ['maksud' => 'Jadwal Baru']);
    }

    public function test_inactive_or_non_employee_users_are_rejected(): void
    {
        $unit = Unit::factory()->create();
        $inactive = User::factory()->withUnit($unit)->inactive()->create();
        $admin = User::factory()->admin()->create();

        $this->actingAs(User::factory()->admin()->create())
            ->post('/perjalanan', [
                'user_id' => $inactive->id,
                'maksud' => 'Rapat',
                'tempat_tujuan' => 'Jakarta',
                'tanggal_mulai' => '2026-11-20',
                'tanggal_selesai' => '2026-11-20',
                'alat_angkut' => 'Darat',
                'sumber_dana' => 'APBD',
            ])
            ->assertSessionHasErrors('user_id');

        $this->actingAs(User::factory()->admin()->create())
            ->post('/perjalanan', [
                'user_id' => $admin->id,
                'maksud' => 'Rapat',
                'tempat_tujuan' => 'Jakarta',
                'tanggal_mulai' => '2026-11-20',
                'tanggal_selesai' => '2026-11-20',
                'alat_angkut' => 'Darat',
                'sumber_dana' => 'APBD',
            ])
            ->assertSessionHasErrors('user_id');
    }

    public function test_draft_can_be_submitted_and_submitted_trip_cannot_be_submitted_twice(): void
    {
        $unit = Unit::factory()->create();
        $pegawai = User::factory()->withUnit($unit)->create();
        $trip = Trip::factory()->create([
            'user_id' => $pegawai->id,
            'unit_id' => $unit->id,
            'status' => TripStatus::Draft,
        ]);

        $this->actingAs(User::factory()->admin()->create())
            ->post("/perjalanan/{$trip->id}/ajukan")
            ->assertSessionHas('success');

        $this->assertSame(TripStatus::Diajukan, $trip->fresh()->status);

        $this->actingAs(User::factory()->admin()->create())
            ->post("/perjalanan/{$trip->id}/ajukan")
            ->assertSessionHas('error');

        $this->assertSame(TripStatus::Diajukan, $trip->fresh()->status);
    }

    public function test_editing_a_draft_can_submit_it_for_approval(): void
    {
        $unit = Unit::factory()->create();
        $pegawai = User::factory()->withUnit($unit)->create();
        $trip = Trip::factory()->create([
            'user_id' => $pegawai->id,
            'unit_id' => $unit->id,
            'maksud' => 'Draft awal',
            'status' => TripStatus::Draft,
        ]);

        $this->actingAs(User::factory()->admin()->create())
            ->patch("/perjalanan/{$trip->id}", [
                'user_id' => $pegawai->id,
                'maksud' => 'Draft disubmit',
                'tempat_tujuan' => 'Jakarta',
                'tanggal_mulai' => $trip->tanggal_mulai->toDateString(),
                'tanggal_selesai' => $trip->tanggal_selesai->toDateString(),
                'alat_angkut' => 'Darat',
                'sumber_dana' => 'APBD',
                'status' => 'diajukan',
            ])
            ->assertRedirect();

        $trip->refresh();

        $this->assertSame(TripStatus::Diajukan, $trip->status);
        $this->assertSame('Draft disubmit', $trip->maksud);
    }

    public function test_only_draft_can_be_deleted(): void
    {
        $unit = Unit::factory()->create();
        $pegawai = User::factory()->withUnit($unit)->create();
        $draft = Trip::factory()->create([
            'user_id' => $pegawai->id,
            'unit_id' => $unit->id,
            'status' => TripStatus::Draft,
        ]);
        $submitted = Trip::factory()->create([
            'user_id' => $pegawai->id,
            'unit_id' => $unit->id,
            'status' => TripStatus::Diajukan,
        ]);
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)->delete("/perjalanan/{$submitted->id}")->assertForbidden();
        $this->actingAs($admin)->delete("/perjalanan/{$draft->id}")->assertRedirect('/perjalanan');

        $this->assertDatabaseMissing('trips', ['id' => $draft->id]);
        $this->assertDatabaseHas('trips', ['id' => $submitted->id]);
    }

    public function test_approved_trip_only_allows_editing_the_note(): void
    {
        $unit = Unit::factory()->create();
        $pegawai = User::factory()->withUnit($unit)->create();
        $trip = Trip::factory()->create([
            'user_id' => $pegawai->id,
            'unit_id' => $unit->id,
            'maksud' => 'Maksud Asli',
            'status' => TripStatus::Disetujui,
        ]);

        $this->actingAs(User::factory()->admin()->create())
            ->patch("/perjalanan/{$trip->id}", [
                'maksud' => 'Maksud Diubah',
                'catatan' => 'Catatan baru',
            ])
            ->assertRedirect();

        $trip->refresh();

        $this->assertSame('Maksud Asli', $trip->maksud);
        $this->assertSame('Catatan baru', $trip->catatan);
    }

    public function test_cancelling_requires_a_reason_and_records_the_actor(): void
    {
        $unit = Unit::factory()->create();
        $pegawai = User::factory()->withUnit($unit)->create();
        $trip = Trip::factory()->create([
            'user_id' => $pegawai->id,
            'unit_id' => $unit->id,
            'status' => TripStatus::Disetujui,
        ]);
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)
            ->post("/perjalanan/{$trip->id}/batalkan", [])
            ->assertSessionHasErrors('alasan_pembatalan');

        $this->assertSame(TripStatus::Disetujui, $trip->fresh()->status);

        $this->actingAs($admin)
            ->post("/perjalanan/{$trip->id}/batalkan", ['alasan_pembatalan' => 'Kegiatan dibatalkan'])
            ->assertSessionHas('success');

        $trip->refresh();

        $this->assertSame(TripStatus::Dibatalkan, $trip->status);
        $this->assertSame($admin->id, $trip->dibatalkan_oleh);
        $this->assertNotNull($trip->dibatalkan_at);
    }

    public function test_completed_trip_cannot_be_cancelled(): void
    {
        $unit = Unit::factory()->create();
        $pegawai = User::factory()->withUnit($unit)->create();
        $trip = Trip::factory()->create([
            'user_id' => $pegawai->id,
            'unit_id' => $unit->id,
            'status' => TripStatus::Selesai,
        ]);

        $this->actingAs(User::factory()->admin()->create())
            ->post("/perjalanan/{$trip->id}/batalkan", ['alasan_pembatalan' => 'Tes'])
            ->assertForbidden();

        $this->assertSame(TripStatus::Selesai, $trip->fresh()->status);
    }

    public function test_pejabat_can_view_trips_but_not_manage_them(): void
    {
        $unit = Unit::factory()->create();
        $pegawai = User::factory()->withUnit($unit)->create();
        $trip = Trip::factory()->create(['user_id' => $pegawai->id, 'unit_id' => $unit->id]);
        $pejabat = User::factory()->pejabat()->create();

        $this->actingAs($pejabat)
            ->get("/perjalanan/{$trip->id}")
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->component('Trips/Show')
                ->where('actions.canEdit', false)
                ->where('actions.canSubmit', false));

        $this->actingAs($pejabat)->get('/perjalanan/baru')->assertForbidden();
    }
}
