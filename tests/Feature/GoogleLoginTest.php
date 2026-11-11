<?php

namespace Tests\Feature;

use App\Enums\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia;
use Laravel\Socialite\Socialite;
use Laravel\Socialite\Two\User as SocialiteUser;
use Tests\TestCase;

class GoogleLoginTest extends TestCase
{
    use RefreshDatabase;

    public function test_login_page_hides_google_button_when_not_configured(): void
    {
        config([
            'services.google.client_id' => null,
            'services.google.client_secret' => null,
        ]);

        $this->get('/login')
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->component('Auth/Login')
                ->where('googleEnabled', false));
    }

    public function test_login_page_shows_google_button_when_configured(): void
    {
        $this->enableGoogle();

        $this->get('/login')
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->component('Auth/Login')
                ->where('googleEnabled', true));
    }

    public function test_google_routes_are_not_found_when_not_configured(): void
    {
        config([
            'services.google.client_id' => null,
            'services.google.client_secret' => null,
        ]);

        $this->get('/auth/google/redirect')->assertNotFound();
        $this->get('/auth/google/callback')->assertNotFound();
    }

    public function test_redirect_sends_the_user_to_google(): void
    {
        $this->enableGoogle();
        Socialite::fake('google');

        $this->get('/auth/google/redirect')
            ->assertRedirect('https://socialite.fake/google/authorize');
    }

    public function test_cancelled_google_login_returns_to_login_with_message(): void
    {
        $this->enableGoogle();

        $this->get('/auth/google/callback?error=access_denied')
            ->assertRedirect('/login')
            ->assertSessionHas('error', 'Masuk dengan Google dibatalkan.');

        $this->assertGuest();
    }

    public function test_new_google_account_is_created_inactive_and_not_logged_in(): void
    {
        $this->enableGoogle();
        $this->fakeGoogleUser(id: 'google-1', email: 'baru@example.test', name: 'Pegawai Baru');

        $this->get('/auth/google/callback')
            ->assertRedirect('/login')
            ->assertSessionHas('error', 'Akun dibuat. Tunggu aktivasi Admin Kepegawaian.');

        $this->assertGuest();
        $this->assertDatabaseHas('users', [
            'email' => 'baru@example.test',
            'name' => 'Pegawai Baru',
            'role' => Role::Pegawai->value,
            'google_id' => 'google-1',
            'is_active' => false,
            'password' => null,
            'nip' => null,
        ]);
        $this->assertNotNull(User::query()->where('email', 'baru@example.test')->value('email_verified_at'));
    }

    public function test_unverified_google_email_creates_no_account(): void
    {
        $this->enableGoogle();
        $this->fakeGoogleUser(id: 'google-2', email: 'belum@example.test', verified: false);

        $this->get('/auth/google/callback')
            ->assertRedirect('/login')
            ->assertSessionHas('error', 'Gagal masuk dengan Google. Coba lagi.');

        $this->assertGuest();
        $this->assertDatabaseCount('users', 0);
    }

    public function test_existing_active_account_is_linked_and_logged_in(): void
    {
        $this->enableGoogle();
        $employee = User::factory()->create(['email' => 'budi@example.test']);
        $this->fakeGoogleUser(id: 'google-3', email: 'budi@example.test');

        $this->get('/auth/google/callback')->assertRedirect('/');

        $this->assertAuthenticatedAs($employee);
        $this->assertSame('google-3', $employee->refresh()->google_id);
    }

    public function test_returning_google_user_logs_in_after_email_change(): void
    {
        $this->enableGoogle();
        $employee = User::factory()->create([
            'email' => 'lama@example.test',
            'google_id' => 'google-4',
        ]);
        $this->fakeGoogleUser(id: 'google-4', email: 'baru@example.test');

        $this->get('/auth/google/callback')->assertRedirect('/');

        $this->assertAuthenticatedAs($employee);
        $this->assertSame('lama@example.test', $employee->refresh()->email);
    }

    public function test_inactive_account_is_refused(): void
    {
        $this->enableGoogle();
        $employee = User::factory()->inactive()->create(['email' => 'nonaktif@example.test']);
        $this->fakeGoogleUser(id: 'google-5', email: 'nonaktif@example.test');

        $this->get('/auth/google/callback')
            ->assertRedirect('/login')
            ->assertSessionHas('error', 'Akun tidak aktif. Hubungi Admin Kepegawaian.');

        $this->assertGuest();
        $this->assertNull($employee->refresh()->google_id);
    }

    public function test_super_admin_is_refused(): void
    {
        $this->enableGoogle();
        $superAdmin = User::factory()->superAdmin()->create(['email' => 'super@example.test']);
        $this->fakeGoogleUser(id: 'google-6', email: 'super@example.test');

        $this->get('/auth/google/callback')
            ->assertRedirect('/login')
            ->assertSessionHas('error', 'Akun ini harus masuk dengan kata sandi.');

        $this->assertGuest();
        $this->assertNull($superAdmin->refresh()->google_id);
    }

    public function test_google_identity_linked_to_another_account_is_refused(): void
    {
        $this->enableGoogle();
        $employee = User::factory()->create([
            'email' => 'shared@example.test',
            'google_id' => 'google-lama',
        ]);
        $this->fakeGoogleUser(id: 'google-baru', email: 'shared@example.test');

        $this->get('/auth/google/callback')
            ->assertRedirect('/login')
            ->assertSessionHas('error', 'Akun Google ini sudah tertaut ke pengguna lain.');

        $this->assertGuest();
        $this->assertSame('google-lama', $employee->refresh()->google_id);
    }

    public function test_unverified_google_email_does_not_link_an_existing_account(): void
    {
        $this->enableGoogle();
        $employee = User::factory()->create(['email' => 'belum@example.test']);
        $this->fakeGoogleUser(id: 'google-baru', email: 'belum@example.test', verified: false);

        $this->get('/auth/google/callback')
            ->assertRedirect('/login')
            ->assertSessionHas('error', 'Gagal masuk dengan Google. Coba lagi.');

        $this->assertGuest();
        $this->assertNull($employee->refresh()->google_id);
    }

    public function test_linked_google_user_logs_in_even_when_google_email_is_unverified(): void
    {
        $this->enableGoogle();
        $employee = User::factory()->create([
            'email' => 'tertaut@example.test',
            'google_id' => 'google-7',
        ]);
        $this->fakeGoogleUser(id: 'google-7', email: 'tertaut@example.test', verified: false);

        $this->get('/auth/google/callback')->assertRedirect('/');

        $this->assertAuthenticatedAs($employee);
    }

    public function test_inactive_google_account_is_refused(): void
    {
        $this->enableGoogle();
        $employee = User::factory()->googlePending()->create([
            'email' => 'tertunda@example.test',
            'google_id' => 'google-8',
        ]);
        $this->fakeGoogleUser(id: 'google-8', email: 'tertunda@example.test');

        $this->get('/auth/google/callback')
            ->assertRedirect('/login')
            ->assertSessionHas('error', 'Akun tidak aktif. Hubungi Admin Kepegawaian.');

        $this->assertGuest();
        $this->assertFalse($employee->refresh()->is_active);
    }

    private function enableGoogle(): void
    {
        config([
            'services.google.client_id' => 'test-client-id',
            'services.google.client_secret' => 'test-client-secret',
            'services.google.redirect' => 'http://localhost/auth/google/callback',
        ]);
    }

    private function fakeGoogleUser(
        string $id,
        string $email,
        string $name = 'Pegawai Google',
        bool $verified = true,
    ): void {
        Socialite::fake('google', SocialiteUser::fake([
            'id' => $id,
            'name' => $name,
            'email' => $email,
            'email_verified' => $verified,
        ]));
    }
}
