<?php

namespace Database\Factories;

use App\Models\Trip;
use App\Models\TripPhoto;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<TripPhoto>
 */
class TripPhotoFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'trip_id' => Trip::factory(),
            'path' => 'dokumentasi/contoh.jpg',
            'keterangan' => fake()->sentence(4),
            'uploaded_by' => User::factory(),
        ];
    }
}
