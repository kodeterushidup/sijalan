<?php

use App\Http\Controllers\AccountController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;

Route::middleware('guest')->group(function (): void {
    Route::get('/login', [LoginController::class, 'create'])->name('login');
    Route::post('/login', [LoginController::class, 'store'])
        ->middleware('throttle:6,1')
        ->name('login.store');
});

Route::middleware('auth')->group(function (): void {
    Route::get('/', DashboardController::class)->name('dashboard');
    Route::post('/logout', [LoginController::class, 'destroy'])->name('logout');

    Route::get('/profil', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profil', [ProfileController::class, 'update'])->name('profile.update');
    Route::post('/profil/ttd', [ProfileController::class, 'uploadTtd'])->name('profile.ttd.upload');
    Route::delete('/profil/ttd', [ProfileController::class, 'destroyTtd'])->name('profile.ttd.destroy');
    Route::get('/ttd/{user}', [ProfileController::class, 'showTtd'])->name('ttd.show');

    Route::middleware('role:super_admin')->group(function (): void {
        Route::get('/akun', [AccountController::class, 'index'])->name('accounts.index');
        Route::get('/akun/baru', [AccountController::class, 'create'])->name('accounts.create');
        Route::post('/akun', [AccountController::class, 'store'])->name('accounts.store');
        Route::get('/akun/{account}/edit', [AccountController::class, 'edit'])->name('accounts.edit');
        Route::patch('/akun/{account}', [AccountController::class, 'update'])->name('accounts.update');
    });
});
