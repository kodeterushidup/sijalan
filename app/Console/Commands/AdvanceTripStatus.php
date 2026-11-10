<?php

namespace App\Console\Commands;

use App\Enums\TripStatus;
use App\Models\Trip;
use Illuminate\Console\Command;

class AdvanceTripStatus extends Command
{
    protected $signature = 'trips:advance-status';

    protected $description = 'Ubah perjalanan Disetujui menjadi Berlangsung saat tanggal mulai tiba';

    public function handle(): int
    {
        $count = Trip::query()
            ->where('status', TripStatus::Disetujui)
            ->whereDate('tanggal_mulai', '<=', today())
            ->update(['status' => TripStatus::Berlangsung]);

        $this->info("{$count} perjalanan diubah menjadi berlangsung.");

        return self::SUCCESS;
    }
}
