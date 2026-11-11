<?php

namespace App\Http\Controllers\Auth;

use App\Enums\Role;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Laravel\Socialite\Socialite;
use Throwable;

class GoogleController extends Controller
{
    public static function isConfigured(): bool
    {
        return filled(config('services.google.client_id'))
            && filled(config('services.google.client_secret'))
            && filled(config('services.google.redirect'));
    }

    public function redirect(): RedirectResponse
    {
        abort_unless(self::isConfigured(), 404);

        return Socialite::driver('google')->redirect();
    }

    public function callback(Request $request): RedirectResponse
    {
        abort_unless(self::isConfigured(), 404);

        if ($request->has('error')) {
            return $this->fail('Masuk dengan Google dibatalkan.');
        }

        try {
            $googleUser = Socialite::driver('google')->user();
        } catch (Throwable $exception) {
            report($exception);

            return $this->fail('Gagal masuk dengan Google. Coba lagi.');
        }

        $googleId = (string) $googleUser->getId();
        $email = Str::lower(trim((string) $googleUser->getEmail()));
        $emailVerified = filter_var($googleUser->getRaw()['email_verified'] ?? false, FILTER_VALIDATE_BOOL);

        if ($googleId === '' || $email === '') {
            return $this->fail('Gagal masuk dengan Google. Coba lagi.');
        }

        $user = User::query()->where('google_id', $googleId)->first();

        if ($user === null) {
            if (! $emailVerified) {
                return $this->fail('Gagal masuk dengan Google. Coba lagi.');
            }

            $user = User::query()->whereRaw('LOWER(email) = ?', [$email])->first();
        }

        if ($user === null) {
            $this->createInactiveUser($googleId, $email, $googleUser->getName());

            return $this->fail('Akun dibuat. Tunggu aktivasi Admin Kepegawaian.');
        }

        if ($user->google_id !== null && $user->google_id !== $googleId) {
            return $this->fail('Akun Google ini sudah tertaut ke pengguna lain.');
        }

        if ($user->role === Role::SuperAdmin) {
            return $this->fail('Akun ini harus masuk dengan kata sandi.');
        }

        if (! $user->is_active) {
            return $this->fail('Akun tidak aktif. Hubungi Admin Kepegawaian.');
        }

        if ($user->google_id === null) {
            $user->update(['google_id' => $googleId]);
        }

        Auth::login($user, true);
        $request->session()->regenerate();

        return redirect()->intended(route('dashboard'));
    }

    private function createInactiveUser(string $googleId, string $email, ?string $name): void
    {
        $user = User::query()->create([
            'name' => trim((string) $name) !== '' ? trim((string) $name) : Str::before($email, '@'),
            'email' => $email,
            'google_id' => $googleId,
            'role' => Role::Pegawai,
            'is_active' => false,
            'password' => null,
        ]);

        $user->forceFill(['email_verified_at' => now()])->save();
    }

    private function fail(string $message): RedirectResponse
    {
        return redirect()->route('login')->with('error', $message);
    }
}
