<?php

namespace Database\Factories;

use App\Enums\Role;
use App\Models\Unit;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends Factory<User>
 */
class UserFactory extends Factory
{
    protected static ?string $password;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'email_verified_at' => now(),
            'password' => static::$password ??= Hash::make('password'),
            'remember_token' => Str::random(10),
            'role' => Role::Pegawai,
            'nip' => fake()->unique()->numerify('##################'),
            'jabatan' => fake()->randomElement(['Analis Kebijakan', 'Pengelola Kepegawaian', 'Staf Administrasi']),
            'golongan' => fake()->randomElement(['III/a', 'III/b', 'III/c', 'IV/a']),
            'no_hp' => fake()->numerify('08##########'),
            'is_active' => true,
        ];
    }

    public function admin(): static
    {
        return $this->state(fn (): array => [
            'role' => Role::Admin,
            'nip' => null,
            'jabatan' => 'Pengelola Kepegawaian',
            'golongan' => null,
        ]);
    }

    public function superAdmin(): static
    {
        return $this->state(fn (): array => [
            'role' => Role::SuperAdmin,
            'nip' => null,
            'jabatan' => 'Administrator Sistem',
            'golongan' => null,
        ]);
    }

    public function pejabat(): static
    {
        return $this->state(fn (): array => [
            'role' => Role::Pejabat,
            'nip' => fake()->numerify('##################'),
            'jabatan' => 'Kepala Dinas',
            'golongan' => 'IV/b',
        ]);
    }

    public function inactive(): static
    {
        return $this->state(fn (): array => ['is_active' => false]);
    }

    public function withUnit(?Unit $unit = null): static
    {
        return $this->state(fn (): array => [
            'unit_id' => $unit?->id ?? Unit::factory(),
        ]);
    }
}
