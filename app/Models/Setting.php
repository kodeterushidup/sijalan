<?php

namespace App\Models;

use Database\Factories\SettingFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

#[Fillable([
    'nama_instansi', 'alamat', 'logo_path', 'format_nomor',
    'nama_pejabat', 'nip_pejabat',
])]
class Setting extends Model
{
    /** @use HasFactory<SettingFactory> */
    use HasFactory;

    public static function current(): self
    {
        return static::query()->firstOrCreate([], [
            'nama_instansi' => 'Instansi Pemerintah',
            'format_nomor' => '090/SPPD/{urut}/{kode_unit}/{tahun}',
        ]);
    }

    public function logoUrl(): ?string
    {
        return $this->logo_path ? Storage::disk('public')->url($this->logo_path) : null;
    }
}
