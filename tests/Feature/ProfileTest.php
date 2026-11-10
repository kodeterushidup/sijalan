<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia;
use Tests\TestCase;

class ProfileTest extends TestCase
{
    use RefreshDatabase;

    public function test_profile_page_is_rendered(): void
    {
        $this->actingAs(User::factory()->create())
            ->get('/profil')
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->component('Profile/Edit')
                ->where('profile.has_ttd', false));
    }

    public function test_user_can_update_their_profile(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->patch('/profil', [
                'name' => 'Nama Baru',
                'no_hp' => '081234567890',
            ])
            ->assertRedirect();

        $this->assertSame('Nama Baru', $user->fresh()->name);
        $this->assertSame('081234567890', $user->fresh()->no_hp);
    }

    public function test_user_can_upload_signature_to_private_disk(): void
    {
        Storage::fake('local');
        Storage::fake('public');
        $user = User::factory()->create();

        $this->actingAs($user)
            ->post('/profil/ttd', [
                'ttd' => UploadedFile::fake()->image('ttd.png', 240, 80),
            ])
            ->assertRedirect();

        $path = $user->fresh()->ttd_path;

        $this->assertNotNull($path);
        Storage::disk('local')->assertExists($path);
        Storage::disk('public')->assertMissing($path);
    }

    public function test_signature_requires_authentication(): void
    {
        Storage::fake('local');
        $user = User::factory()->create();
        Storage::disk('local')->put('ttd/ttd-1.png', 'x');
        $user->update(['ttd_path' => 'ttd/ttd-1.png']);

        $this->get("/ttd/{$user->id}")->assertRedirect('/login');
        $this->actingAs(User::factory()->create())->get("/ttd/{$user->id}")->assertOk();
    }

    public function test_signature_upload_validates_mime_and_size(): void
    {
        Storage::fake('local');
        Storage::fake('public');
        $user = User::factory()->create();

        $this->actingAs($user)
            ->post('/profil/ttd', [
                'ttd' => UploadedFile::fake()->create('dokumen.pdf', 100, 'application/pdf'),
            ])
            ->assertSessionHasErrors('ttd');

        $this->assertNull($user->fresh()->ttd_path);
    }
}
