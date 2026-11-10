<?php

namespace Database\Factories;

use App\Enums\TripStatus;
use App\Models\Trip;
use App\Models\Unit;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Trip>
 */
class TripFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $start = fake()->dateTimeBetween('-2 months', '+2 months');
        $end = (clone $start)->modify('+'.fake()->numberBetween(1, 4).' days');

        return [
            'user_id' => User::factory()->withUnit(),
            'unit_id' => Unit::factory(),
            'maksud' => 'Menghadiri '.fake()->randomElement(['Rapat Koordinasi', 'Bimbingan Teknis', 'Sosialisasi Program']),
            'tempat_tujuan' => fake()->randomElement(['Jakarta', 'Bandung', 'Surabaya', 'Yogyakarta', 'Medan']),
            'tanggal_mulai' => $start->format('Y-m-d'),
            'tanggal_selesai' => $end->format('Y-m-d'),
            'alat_angkut' => fake()->randomElement(['Darat', 'Udara', 'Laut']),
            'sumber_dana' => 'APBD',
            'status' => TripStatus::Draft,
        ];
    }

    public function status(TripStatus $status): static
    {
        return $this->state(fn (): array => ['status' => $status]);
    }
}
