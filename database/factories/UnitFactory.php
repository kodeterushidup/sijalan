<?php

namespace Database\Factories;

use App\Models\Unit;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Unit>
 */
class UnitFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'kode' => mb_strtoupper(fake()->unique()->bothify('UN###')),
            'nama' => 'Unit '.fake()->unique()->word(),
        ];
    }
}
