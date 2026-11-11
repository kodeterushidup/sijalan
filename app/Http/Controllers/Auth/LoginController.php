<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class LoginController extends Controller
{
    public function create(): Response
    {
        return Inertia::render('Auth/Login', [
            'demoAccounts' => app()->environment('local') ? [
                ['role' => 'Admin', 'email' => 'admin@sijalan.test'],
                ['role' => 'Pejabat', 'email' => 'pejabat@sijalan.test'],
                ['role' => 'Pegawai', 'email' => 'pegawai@sijalan.test'],
            ] : [],
            'googleEnabled' => GoogleController::isConfigured(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $user = User::query()->where('email', $credentials['email'])->first();

        if ($user !== null && $user->password === null && GoogleController::isConfigured()) {
            throw ValidationException::withMessages([
                'email' => 'Akun ini masuk dengan Google. Gunakan tombol Masuk dengan Google.',
            ]);
        }

        if (! $user || ! $user->is_active) {
            throw ValidationException::withMessages([
                'email' => 'Akun tidak ditemukan atau sudah dinonaktifkan.',
            ]);
        }

        if (! Auth::attempt($credentials, $request->boolean('remember'))) {
            throw ValidationException::withMessages([
                'email' => 'Email atau kata sandi tidak sesuai.',
            ]);
        }

        $request->session()->regenerate();

        return redirect()->intended(route('dashboard'));
    }

    public function destroy(Request $request): RedirectResponse
    {
        Auth::logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('login');
    }
}
