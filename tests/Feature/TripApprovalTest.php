<?php

namespace Tests\Feature;

use App\Enums\TripStatus;
use App\Models\Setting;
use App\Models\Trip;
use App\Models\Unit;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia;
use Tests\TestCase;

class TripApprovalTest extends TestCase
{
    use RefreshDatabase;

    public function test_only_pejabat_can_open_the_approval_queue(): void
    {
        $unit = Unit::factory()->create();
        $pegawai = User::factory()->withUnit($unit)->create();
        $trip = Trip::factory()->create([
            'user_id' => $pegawai->id,
            'unit_id' => $unit->id,
            'status' => TripStatus::Diajukan,
        ]);

        $this->actingAs(User::factory()->pejabat()->create())
            ->get('/persetujuan')
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->component('Approvals/Index')
                ->has('trips.data', 1)
                ->where('trips.data.0.id', $trip->id));

        $this->actingAs(User::factory()->admin()->create())->get('/persetujuan')->assertForbidden();
        $this->actingAs($pegawai)->get('/persetujuan')->assertForbidden();
    }

    public function test_queue_lists_the_oldest_submission_first(): void
    {
        $unit = Unit::factory()->create();
        $pegawai = User::factory()->withUnit($unit)->create();

        $older = Trip::factory()->create([
            'user_id' => $pegawai->id,
            'unit_id' => $unit->id,
            'status' => TripStatus::Diajukan,
        ]);
        $older->forceFill(['updated_at' => now()->subDays(2)])->save();

        $newer = Trip::factory()->create([
            'user_id' => $pegawai->id,
            'unit_id' => $unit->id,
            'status' => TripStatus::Diajukan,
        ]);

        $this->actingAs(User::factory()->pejabat()->create())
            ->get('/persetujuan')
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->has('trips.data', 2)
                ->where('trips.data.0.id', $older->id)
                ->where('trips.data.1.id', $newer->id));
    }

    public function test_approval_issues_a_number_once_and_records_the_actor(): void
    {
        Setting::factory()->create([
            'format_nomor' => '090/SPPD/{urut}/{kode_unit}/{tahun}',
        ]);

        $unit = Unit::factory()->create(['kode' => 'SEK']);
        $pegawai = User::factory()->withUnit($unit)->create();
        $pejabat = User::factory()->pejabat()->create();
        $trip = Trip::factory()->create([
            'user_id' => $pegawai->id,
            'unit_id' => $unit->id,
            'tanggal_mulai' => '2026-11-20',
            'tanggal_selesai' => '2026-11-22',
            'status' => TripStatus::Diajukan,
        ]);

        $this->actingAs($pejabat)
            ->post("/perjalanan/{$trip->id}/setujui")
            ->assertRedirect("/perjalanan/{$trip->id}")
            ->assertSessionHas('success');

        $trip->refresh();

        $this->assertSame(TripStatus::Disetujui, $trip->status);
        $this->assertSame('090/SPPD/001/SEK/2026', $trip->nomor_sppd);
        $this->assertSame(1, $trip->nomor_urut);
        $this->assertSame(2026, $trip->tahun);
        $this->assertSame($pejabat->id, $trip->disetujui_oleh);

        $this->actingAs($pejabat)
            ->post("/perjalanan/{$trip->id}/setujui")
            ->assertForbidden();

        $this->assertSame('090/SPPD/001/SEK/2026', $trip->fresh()->nomor_sppd);
    }

    public function test_number_format_follows_the_institution_setting(): void
    {
        Setting::factory()->create([
            'format_nomor' => 'SPPD-{kode_unit}-{urut}-{tahun}',
        ]);

        $unit = Unit::factory()->create(['kode' => 'BID']);
        $pegawai = User::factory()->withUnit($unit)->create();
        $trip = Trip::factory()->create([
            'user_id' => $pegawai->id,
            'unit_id' => $unit->id,
            'tanggal_mulai' => '2026-03-01',
            'tanggal_selesai' => '2026-03-02',
            'status' => TripStatus::Diajukan,
        ]);

        $this->actingAs(User::factory()->pejabat()->create())
            ->post("/perjalanan/{$trip->id}/setujui");

        $this->assertSame('SPPD-BID-001-2026', $trip->fresh()->nomor_sppd);
    }

    public function test_numbers_are_sequential_per_unit_and_year_without_reuse(): void
    {
        $unitA = Unit::factory()->create(['kode' => 'AAA']);
        $unitB = Unit::factory()->create(['kode' => 'BBB']);
        $pegawaiA = User::factory()->withUnit($unitA)->create();
        $pegawaiB = User::factory()->withUnit($unitB)->create();

        Trip::factory()->create([
            'user_id' => $pegawaiA->id,
            'unit_id' => $unitA->id,
            'status' => TripStatus::Dibatalkan,
            'nomor_sppd' => '090/SPPD/001/AAA/2026',
            'nomor_urut' => 1,
            'tahun' => 2026,
        ]);

        $pendingA = Trip::factory()->create([
            'user_id' => $pegawaiA->id,
            'unit_id' => $unitA->id,
            'tanggal_mulai' => '2026-05-01',
            'tanggal_selesai' => '2026-05-02',
            'status' => TripStatus::Diajukan,
        ]);
        $pendingB = Trip::factory()->create([
            'user_id' => $pegawaiB->id,
            'unit_id' => $unitB->id,
            'tanggal_mulai' => '2026-05-01',
            'tanggal_selesai' => '2026-05-02',
            'status' => TripStatus::Diajukan,
        ]);

        $pejabat = User::factory()->pejabat()->create();

        $this->actingAs($pejabat)->post("/perjalanan/{$pendingA->id}/setujui");
        $this->actingAs($pejabat)->post("/perjalanan/{$pendingB->id}/setujui");

        $this->assertSame('090/SPPD/002/AAA/2026', $pendingA->fresh()->nomor_sppd);
        $this->assertSame('090/SPPD/001/BBB/2026', $pendingB->fresh()->nomor_sppd);
    }

    public function test_rejection_requires_a_reason_and_allows_resubmission(): void
    {
        $unit = Unit::factory()->create();
        $pegawai = User::factory()->withUnit($unit)->create();
        $trip = Trip::factory()->create([
            'user_id' => $pegawai->id,
            'unit_id' => $unit->id,
            'status' => TripStatus::Diajukan,
        ]);
        $pejabat = User::factory()->pejabat()->create();

        $this->actingAs($pejabat)
            ->post("/perjalanan/{$trip->id}/tolak", [])
            ->assertSessionHasErrors('alasan_penolakan');

        $this->assertSame(TripStatus::Diajukan, $trip->fresh()->status);

        $this->actingAs($pejabat)
            ->post("/perjalanan/{$trip->id}/tolak", ['alasan_penolakan' => 'Anggaran belum tersedia'])
            ->assertRedirect("/perjalanan/{$trip->id}")
            ->assertSessionHas('success');

        $trip->refresh();

        $this->assertSame(TripStatus::Ditolak, $trip->status);
        $this->assertSame('Anggaran belum tersedia', $trip->alasan_penolakan);

        $this->actingAs(User::factory()->admin()->create())
            ->post("/perjalanan/{$trip->id}/ajukan")
            ->assertSessionHas('success');

        $this->assertSame(TripStatus::Diajukan, $trip->fresh()->status);
    }

    public function test_admin_and_pegawai_cannot_approve_or_reject(): void
    {
        $unit = Unit::factory()->create();
        $pegawai = User::factory()->withUnit($unit)->create();
        $trip = Trip::factory()->create([
            'user_id' => $pegawai->id,
            'unit_id' => $unit->id,
            'status' => TripStatus::Diajukan,
        ]);

        $this->actingAs(User::factory()->admin()->create())
            ->post("/perjalanan/{$trip->id}/setujui")
            ->assertForbidden();

        $this->actingAs($pegawai)
            ->post("/perjalanan/{$trip->id}/tolak", ['alasan_penolakan' => 'Tidak setuju'])
            ->assertForbidden();

        $this->assertSame(TripStatus::Diajukan, $trip->fresh()->status);
    }

    public function test_sppd_print_page_is_only_available_after_approval(): void
    {
        Setting::factory()->create();

        $unit = Unit::factory()->create();
        $pegawai = User::factory()->withUnit($unit)->create();
        $pejabat = User::factory()->pejabat()->create();
        $trip = Trip::factory()->create([
            'user_id' => $pegawai->id,
            'unit_id' => $unit->id,
            'tanggal_mulai' => '2026-06-01',
            'tanggal_selesai' => '2026-06-03',
            'status' => TripStatus::Diajukan,
        ]);

        $this->actingAs($pegawai)->get("/perjalanan/{$trip->id}/sppd")->assertNotFound();

        $this->actingAs($pejabat)->post("/perjalanan/{$trip->id}/setujui");

        $this->actingAs($pegawai)
            ->get("/perjalanan/{$trip->id}/sppd")
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->component('Trips/Sppd')
                ->where('trip.nomor_sppd', $trip->fresh()->nomor_sppd)
                ->where('penandaTangan.nama', $pejabat->name)
                ->has('trip.costs'));

        $other = User::factory()->withUnit($unit)->create();
        $this->actingAs($other)->get("/perjalanan/{$trip->id}/sppd")->assertForbidden();
    }
}
