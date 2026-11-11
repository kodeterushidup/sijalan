<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia;
use Tests\TestCase;

class AuthenticationTest extends TestCase
{
    use RefreshDatabase;

    public function test_login_page_is_rendered(): void
    {
        $this->get('/login')
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page->component('Auth/Login'));
    }

    public function test_guest_is_redirected_to_login(): void
    {
        $this->get('/')->assertRedirect('/login');
    }

    public function test_active_user_can_login(): void
    {
        $user = User::factory()->admin()->create(['email' => 'admin@example.test']);

        $this->post('/login', [
            'email' => 'admin@example.test',
            'password' => 'password',
        ])->assertRedirect('/');

        $this->assertAuthenticatedAs($user);
    }

    public function test_inactive_user_cannot_login(): void
    {
        User::factory()->inactive()->create(['email' => 'nonaktif@example.test']);

        $this->post('/login', [
            'email' => 'nonaktif@example.test',
            'password' => 'password',
        ])->assertSessionHasErrors('email');

        $this->assertGuest();
    }

    public function test_google_only_account_is_told_to_use_google(): void
    {
        config([
            'services.google.client_id' => 'test-client-id',
            'services.google.client_secret' => 'test-client-secret',
            'services.google.redirect' => 'http://localhost/auth/google/callback',
        ]);

        User::factory()->googlePending()->create(['email' => 'googleonly@example.test']);

        $this->post('/login', [
            'email' => 'googleonly@example.test',
            'password' => 'apa-saja',
        ])->assertSessionHasErrors([
            'email' => 'Akun ini masuk dengan Google. Gunakan tombol Masuk dengan Google.',
        ]);

        $this->assertGuest();
    }

    public function test_google_only_account_gets_generic_message_when_google_is_disabled(): void
    {
        config([
            'services.google.client_id' => null,
            'services.google.client_secret' => null,
            'services.google.redirect' => null,
        ]);

        User::factory()->googlePending()->create(['email' => 'googleonly@example.test']);

        $this->post('/login', [
            'email' => 'googleonly@example.test',
            'password' => 'apa-saja',
        ])->assertSessionHasErrors([
            'email' => 'Akun tidak ditemukan atau sudah dinonaktifkan.',
        ]);

        $this->assertGuest();
    }

    public function test_user_can_logout(): void
    {
        $this->actingAs(User::factory()->create());

        $this->post('/logout')->assertRedirect('/login');

        $this->assertGuest();
    }

    public function test_dashboard_requires_authentication(): void
    {
        $this->get('/')->assertRedirect('/login');
    }

    public function test_dashboard_shows_real_counts(): void
    {
        $this->actingAs(User::factory()->create())
            ->get('/')
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->component('Dashboard')
                ->where('stats.menunggu', 0)
                ->where('stats.bulan_ini', 0)
                ->has('upcoming', 0));
    }
}
