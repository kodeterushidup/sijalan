<?php

namespace App\Enums;

enum Role: string
{
    case SuperAdmin = 'super_admin';
    case Admin = 'admin';
    case Pejabat = 'pejabat';
    case Pegawai = 'pegawai';

    public function label(): string
    {
        return match ($this) {
            self::SuperAdmin => 'Super Admin',
            self::Admin => 'Admin Kepegawaian',
            self::Pejabat => 'Pejabat Penyetuju',
            self::Pegawai => 'Pegawai',
        };
    }

    public function canManageData(): bool
    {
        return in_array($this, [self::SuperAdmin, self::Admin], true);
    }

    public function isApprover(): bool
    {
        return $this === self::Pejabat;
    }
}
