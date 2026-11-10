<?php

namespace App\Enums;

enum TripStatus: string
{
    case Draft = 'draft';
    case Diajukan = 'diajukan';
    case Disetujui = 'disetujui';
    case Ditolak = 'ditolak';
    case Berlangsung = 'berlangsung';
    case Selesai = 'selesai';
    case Dibatalkan = 'dibatalkan';

    public function label(): string
    {
        return match ($this) {
            self::Draft => 'Draft',
            self::Diajukan => 'Menunggu Persetujuan',
            self::Disetujui => 'Disetujui',
            self::Ditolak => 'Ditolak',
            self::Berlangsung => 'Berlangsung',
            self::Selesai => 'Selesai',
            self::Dibatalkan => 'Dibatalkan',
        };
    }

    public function isActive(): bool
    {
        return in_array($this, [self::Draft, self::Diajukan, self::Disetujui, self::Berlangsung], true);
    }

    public function canBeEdited(): bool
    {
        return in_array($this, [self::Draft, self::Diajukan, self::Ditolak], true);
    }

    public function canTransitionTo(self $next): bool
    {
        return match ($this) {
            self::Draft => in_array($next, [self::Diajukan, self::Dibatalkan], true),
            self::Diajukan => in_array($next, [self::Disetujui, self::Ditolak, self::Dibatalkan], true),
            self::Ditolak => $next === self::Diajukan,
            self::Disetujui => in_array($next, [self::Berlangsung, self::Dibatalkan], true),
            self::Berlangsung => in_array($next, [self::Selesai, self::Dibatalkan], true),
            default => false,
        };
    }
}
