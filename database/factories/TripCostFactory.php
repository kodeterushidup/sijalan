<?php

namespace Database\Factories;

use App\Models\Trip;
use App\Models\TripCost;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<TripCost>
 */
class TripCostFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $jumlah = fake()->numberBetween(1, 4);
        $tarif = fake()->randomElement([150000, 250000, 350000, 500000]);

        return [
            'trip_id' => Trip::factory(),
            'jenis_biaya' => fake()->randomElement(['Uang Harian', 'Transport', 'Penginapan']),
            'keterangan' => null,
            'jumlah' => $jumlah,
            'tarif' => $tarif,
            'subtotal' => $jumlah * $tarif,
        ];
    }
}
