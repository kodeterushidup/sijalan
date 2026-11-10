<?php

namespace Tests\Feature;

use App\Enums\TripStatus;
use App\Models\Trip;
use App\Models\TripPhoto;
use App\Models\TripReport;
use App\Models\Unit;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia;
use Tests\TestCase;

class TripReportTest extends TestCase
{
    use RefreshDatabase;

    private function ongoingTrip(): array
    {
        $unit = Unit::factory()->create();
        $pegawai = User::factory()->withUnit($unit)->create();
        $trip = Trip::factory()->create([
            'user_id' => $pegawai->id,
            'unit_id' => $unit->id,
            'tanggal_mulai' => now()->subDays(2)->toDateString(),
            'tanggal_selesai' => now()->subDay()->toDateString(),
            'status' => TripStatus::Berlangsung,
        ]);

        return [$trip, $pegawai, $unit];
    }

    public function test_only_the_owner_can_fill_the_report_while_the_trip_is_ongoing(): void
    {
        [$trip, $pegawai, $unit] = $this->ongoingTrip();
        $other = User::factory()->withUnit($unit)->create();

        $this->actingAs($pegawai)
            ->get("/perjalanan/{$trip->id}/laporan/isi")
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->component('Reports/Edit')
                ->where('trip.id', $trip->id));

        $this->actingAs($other)->get("/perjalanan/{$trip->id}/laporan/isi")->assertForbidden();
        $this->actingAs(User::factory()->admin()->create())->get("/perjalanan/{$trip->id}/laporan/isi")->assertForbidden();
        $this->actingAs(User::factory()->pejabat()->create())->get("/perjalanan/{$trip->id}/laporan/isi")->assertForbidden();
    }

    public function test_report_cannot_be_filled_before_the_trip_starts(): void
    {
        [$trip, $pegawai] = $this->ongoingTrip();
        $trip->update(['status' => TripStatus::Disetujui]);

        $this->actingAs($pegawai)->get("/perjalanan/{$trip->id}/laporan/isi")->assertForbidden();
    }

    public function test_report_is_validated_and_can_be_updated_until_finished(): void
    {
        [$trip, $pegawai] = $this->ongoingTrip();

        $this->actingAs($pegawai)
            ->patch("/perjalanan/{$trip->id}/laporan", [])
            ->assertSessionHasErrors(['hasil', 'kendala', 'rekomendasi']);

        $this->assertDatabaseCount('trip_reports', 0);

        $this->actingAs($pegawai)
            ->patch("/perjalanan/{$trip->id}/laporan", [
                'hasil' => 'Rapat koordinasi menghasilkan tiga kesepakatan.',
                'kendala' => 'Tidak ada kendala.',
                'rekomendasi' => 'Tindak lanjut minggu depan.',
            ])
            ->assertRedirect("/perjalanan/{$trip->id}")
            ->assertSessionHas('success');

        $report = TripReport::query()->firstOrFail();

        $this->assertSame($trip->id, $report->trip_id);
        $this->assertNotNull($report->disusun_at);

        $this->actingAs($pegawai)->patch("/perjalanan/{$trip->id}/laporan", [
            'hasil' => 'Hasil diperbarui.',
            'kendala' => 'Kendala diperbarui.',
            'rekomendasi' => 'Rekomendasi diperbarui.',
        ]);

        $this->assertDatabaseCount('trip_reports', 1);
        $this->assertSame('Hasil diperbarui.', $report->fresh()->hasil);

        $trip->update(['status' => TripStatus::Selesai]);

        $this->actingAs($pegawai)->get("/perjalanan/{$trip->id}/laporan/isi")->assertForbidden();
        $this->actingAs($pegawai)->patch("/perjalanan/{$trip->id}/laporan", [
            'hasil' => 'Tidak boleh.',
            'kendala' => 'Tidak boleh.',
            'rekomendasi' => 'Tidak boleh.',
        ])->assertForbidden();
    }

    public function test_report_print_page_requires_an_existing_report(): void
    {
        [$trip, $pegawai] = $this->ongoingTrip();

        $this->actingAs($pegawai)->get("/perjalanan/{$trip->id}/laporan")->assertNotFound();

        TripReport::factory()->create(['trip_id' => $trip->id]);

        $this->actingAs($pegawai)
            ->get("/perjalanan/{$trip->id}/laporan")
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->component('Reports/Show')
                ->where('trip.id', $trip->id)
                ->has('photos'));

        $this->actingAs(User::factory()->admin()->create())
            ->get("/perjalanan/{$trip->id}/laporan")
            ->assertOk();

        $other = User::factory()->withUnit($trip->unit)->create();
        $this->actingAs($other)->get("/perjalanan/{$trip->id}/laporan")->assertForbidden();
    }

    public function test_owner_can_upload_photos_with_captions(): void
    {
        Storage::fake('public');

        [$trip, $pegawai] = $this->ongoingTrip();

        $this->actingAs($pegawai)
            ->post("/perjalanan/{$trip->id}/dokumentasi", [
                'photos' => [
                    UploadedFile::fake()->create('foto-1.jpg', 200, 'image/jpeg'),
                    UploadedFile::fake()->create('berkas.pdf', 200, 'application/pdf'),
                ],
                'keterangan' => ['Pembukaan kegiatan', ''],
            ])
            ->assertSessionHas('success');

        $this->assertDatabaseCount('trip_photos', 2);

        $photos = TripPhoto::query()->orderBy('id')->get();

        $this->assertSame('Pembukaan kegiatan', $photos[0]->keterangan);
        $this->assertNull($photos[1]->keterangan);
        $this->assertSame($pegawai->id, $photos[0]->uploaded_by);

        Storage::disk('public')->assertExists($photos[0]->path);
        Storage::disk('public')->assertExists($photos[1]->path);
    }

    public function test_photo_upload_rejects_unsupported_files_and_respects_the_ten_file_limit(): void
    {
        Storage::fake('public');

        [$trip, $pegawai] = $this->ongoingTrip();

        $this->actingAs($pegawai)
            ->post("/perjalanan/{$trip->id}/dokumentasi", [
                'photos' => [UploadedFile::fake()->create('catatan.txt', 10, 'text/plain')],
            ])
            ->assertSessionHasErrors('photos.0');

        $this->assertDatabaseCount('trip_photos', 0);

        for ($index = 0; $index < 10; $index++) {
            TripPhoto::factory()->create([
                'trip_id' => $trip->id,
                'uploaded_by' => $pegawai->id,
                'path' => "dokumentasi/{$trip->id}/foto-{$index}.jpg",
            ]);
        }

        $this->actingAs($pegawai)
            ->post("/perjalanan/{$trip->id}/dokumentasi", [
                'photos' => [UploadedFile::fake()->create('foto-baru.jpg', 200, 'image/jpeg')],
            ])
            ->assertSessionHas('error');

        $this->assertDatabaseCount('trip_photos', 10);
    }

    public function test_photos_are_scoped_to_the_owner_and_the_ongoing_status(): void
    {
        Storage::fake('public');

        [$trip, $pegawai, $unit] = $this->ongoingTrip();
        $other = User::factory()->withUnit($unit)->create();

        $this->actingAs($other)
            ->post("/perjalanan/{$trip->id}/dokumentasi", [
                'photos' => [UploadedFile::fake()->create('foto.jpg', 200, 'image/jpeg')],
            ])
            ->assertForbidden();

        $trip->update(['status' => TripStatus::Selesai]);

        $this->actingAs($pegawai)
            ->post("/perjalanan/{$trip->id}/dokumentasi", [
                'photos' => [UploadedFile::fake()->create('foto.jpg', 200, 'image/jpeg')],
            ])
            ->assertForbidden();
    }

    public function test_owner_can_delete_a_photo_before_the_trip_is_finished(): void
    {
        Storage::fake('public');
        Storage::disk('public')->put('dokumentasi/berkas.jpg', 'isi');

        [$trip, $pegawai, $unit] = $this->ongoingTrip();
        $photo = TripPhoto::factory()->create([
            'trip_id' => $trip->id,
            'uploaded_by' => $pegawai->id,
            'path' => 'dokumentasi/berkas.jpg',
        ]);
        $other = User::factory()->withUnit($unit)->create();

        $this->actingAs($other)->delete("/perjalanan/{$trip->id}/dokumentasi/{$photo->id}")->assertForbidden();
        $this->assertDatabaseHas('trip_photos', ['id' => $photo->id]);

        $this->actingAs($pegawai)
            ->delete("/perjalanan/{$trip->id}/dokumentasi/{$photo->id}")
            ->assertSessionHas('success');

        $this->assertDatabaseMissing('trip_photos', ['id' => $photo->id]);
        Storage::disk('public')->assertMissing('dokumentasi/berkas.jpg');
    }

    public function test_admin_can_only_finish_the_trip_once_all_requirements_are_met(): void
    {
        [$trip] = $this->ongoingTrip();
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)->post("/perjalanan/{$trip->id}/selesai")->assertSessionHas('error');
        $this->assertSame(TripStatus::Berlangsung, $trip->fresh()->status);

        TripReport::factory()->create(['trip_id' => $trip->id]);

        $this->actingAs($admin)->post("/perjalanan/{$trip->id}/selesai")->assertSessionHas('error');
        $this->assertSame(TripStatus::Berlangsung, $trip->fresh()->status);

        TripPhoto::factory()->create([
            'trip_id' => $trip->id,
            'uploaded_by' => $trip->user_id,
        ]);

        $trip->update(['tanggal_selesai' => now()->addDay()->toDateString()]);

        $this->actingAs($admin)->post("/perjalanan/{$trip->id}/selesai")->assertSessionHas('error');
        $this->assertSame(TripStatus::Berlangsung, $trip->fresh()->status);

        $trip->update(['tanggal_selesai' => now()->subDay()->toDateString()]);

        $this->actingAs($admin)->post("/perjalanan/{$trip->id}/selesai")->assertSessionHas('success');

        $trip->refresh();

        $this->assertSame(TripStatus::Selesai, $trip->status);
        $this->assertNotNull($trip->selesai_at);
    }

    public function test_pegawai_and_pejabat_cannot_finish_a_trip(): void
    {
        [$trip, $pegawai] = $this->ongoingTrip();

        $this->actingAs($pegawai)->post("/perjalanan/{$trip->id}/selesai")->assertForbidden();
        $this->actingAs(User::factory()->pejabat()->create())->post("/perjalanan/{$trip->id}/selesai")->assertForbidden();

        $this->assertSame(TripStatus::Berlangsung, $trip->fresh()->status);
    }
}
