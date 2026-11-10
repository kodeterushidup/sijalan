<?php

namespace App\Models;

use Database\Factories\TripCostFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['trip_id', 'jenis_biaya', 'keterangan', 'jumlah', 'tarif', 'subtotal'])]
class TripCost extends Model
{
    /** @use HasFactory<TripCostFactory> */
    use HasFactory;

    protected static function booted(): void
    {
        static::saving(function (TripCost $cost): void {
            $cost->subtotal = (int) $cost->jumlah * (float) $cost->tarif;
        });
    }

    /** @return array<string, string> */
    protected function casts(): array
    {
        return [
            'jumlah' => 'integer',
            'tarif' => 'decimal:2',
            'subtotal' => 'decimal:2',
        ];
    }

    /** @return BelongsTo<Trip, $this> */
    public function trip(): BelongsTo
    {
        return $this->belongsTo(Trip::class);
    }
}
