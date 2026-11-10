<?php

use App\Http\Controllers\AccountController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\EmployeeController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\SettingController;
use App\Http\Controllers\UnitController;
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

    Route::middleware('role:super_admin,admin')->group(function (): void {
        Route::get('/unit', [UnitController::class, 'index'])->name('units.index');
        Route::post('/unit', [UnitController::class, 'store'])->name('units.store');
        Route::get('/unit/{unit}/edit', [UnitController::class, 'edit'])->name('units.edit');
        Route::patch('/unit/{unit}', [UnitController::class, 'update'])->name('units.update');
        Route::delete('/unit/{unit}', [UnitController::class, 'destroy'])->name('units.destroy');

        Route::get('/pegawai', [EmployeeController::class, 'index'])->name('employees.index');
        Route::get('/pegawai/baru', [EmployeeController::class, 'create'])->name('employees.create');
        Route::post('/pegawai', [EmployeeController::class, 'store'])->name('employees.store');
        Route::post('/pegawai/impor', [EmployeeController::class, 'import'])->name('employees.import');
        Route::get('/pegawai/{employee}/edit', [EmployeeController::class, 'edit'])->name('employees.edit');
        Route::patch('/pegawai/{employee}', [EmployeeController::class, 'update'])->name('employees.update');
    });

    Route::middleware('role:super_admin')->group(function (): void {
        Route::get('/pengaturan', [SettingController::class, 'edit'])->name('settings.edit');
        Route::patch('/pengaturan', [SettingController::class, 'update'])->name('settings.update');
    });

    Route::middleware('role:super_admin')->group(function (): void {
        Route::get('/akun', [AccountController::class, 'index'])->name('accounts.index');
        Route::get('/akun/baru', [AccountController::class, 'create'])->name('accounts.create');
        Route::post('/akun', [AccountController::class, 'store'])->name('accounts.store');
        Route::get('/akun/{account}/edit', [AccountController::class, 'edit'])->name('accounts.edit');
        Route::patch('/akun/{account}', [AccountController::class, 'update'])->name('accounts.update');
    });
});
