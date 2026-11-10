<?php

namespace Database\Factories;

use App\Models\Trip;
use App\Models\TripReport;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<TripReport>
 */
class TripReportFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'trip_id' => Trip::factory(),
            'hasil' => fake()->paragraph(),
            'kendala' => fake()->sentence(),
            'rekomendasi' => fake()->sentence(),
            'disusun_at' => now(),
        ];
    }
}
