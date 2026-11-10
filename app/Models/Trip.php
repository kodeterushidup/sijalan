<?php

namespace App\Models;

use App\Enums\TripStatus;
use Database\Factories\TripFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

#[Fillable([
    'user_id', 'unit_id', 'maksud', 'tempat_tujuan', 'tanggal_mulai',
    'tanggal_selesai', 'alat_angkut', 'sumber_dana', 'catatan', 'status',
    'nomor_sppd', 'nomor_urut', 'tahun', 'created_by', 'disetujui_oleh',
    'disetujui_at', 'alasan_penolakan', 'selesai_at', 'dibatalkan_at',
    'dibatalkan_oleh', 'alasan_pembatalan',
])]
class Trip extends Model
{
    /** @use HasFactory<TripFactory> */
    use HasFactory;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'tanggal_mulai' => 'date',
            'tanggal_selesai' => 'date',
            'status' => TripStatus::class,
            'disetujui_at' => 'datetime',
            'selesai_at' => 'datetime',
            'dibatalkan_at' => 'datetime',
        ];
    }

    /** @return BelongsTo<User, $this> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /** @return BelongsTo<Unit, $this> */
    public function unit(): BelongsTo
    {
        return $this->belongsTo(Unit::class);
    }

    /** @return BelongsTo<User, $this> */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /** @return BelongsTo<User, $this> */
    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'disetujui_oleh');
    }

    /** @return HasMany<TripCost, $this> */
    public function costs(): HasMany
    {
        return $this->hasMany(TripCost::class);
    }

    /** @return HasOne<TripReport, $this> */
    public function report(): HasOne
    {
        return $this->hasOne(TripReport::class);
    }

    /** @return HasMany<TripPhoto, $this> */
    public function photos(): HasMany
    {
        return $this->hasMany(TripPhoto::class);
    }

    public function lamaHari(): int
    {
        return $this->tanggal_mulai->diffInDays($this->tanggal_selesai) + 1;
    }

    public function totalBiaya(): float
    {
        return (float) $this->costs->sum('subtotal');
    }

    /** @param Builder<Trip> $query */
    public function scopeAktif(Builder $query): void
    {
        $query->whereIn('status', [
            TripStatus::Draft,
            TripStatus::Diajukan,
            TripStatus::Disetujui,
            TripStatus::Berlangsung,
        ]);
    }
}
