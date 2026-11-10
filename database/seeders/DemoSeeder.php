<?php

namespace Database\Seeders;

use App\Enums\Role;
use App\Enums\TripStatus;
use App\Models\Trip;
use App\Models\TripPhoto;
use App\Models\TripReport;
use App\Models\Unit;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Storage;

class DemoSeeder extends Seeder
{
    private const PLACEHOLDER_PNG = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

    public function run(): void
    {
        $units = Unit::query()
            ->whereIn('kode', ['SEK', 'BID-A', 'BID-B'])
            ->get()
            ->keyBy('kode');

        $admin = User::query()->where('email', 'admin@sijalan.test')->firstOrFail();
        $pejabat = User::query()->where('email', 'pejabat@sijalan.test')->firstOrFail();

        $this->seedEmployees($units);

        $employees = User::query()
            ->where('role', Role::Pegawai)
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        $kegiatan = [
            ['Rapat Koordinasi Program', 'Jakarta'],
            ['Bimbingan Teknis Anggaran', 'Bandung'],
            ['Sosialisasi Layanan Publik', 'Surabaya'],
            ['Monitoring dan Evaluasi', 'Yogyakarta'],
            ['Studi Tiru Inovasi Daerah', 'Semarang'],
            ['Pendampingan Desa', 'Malang'],
        ];

        $statuses = [
            TripStatus::Selesai, TripStatus::Ditolak, TripStatus::Diajukan,
            TripStatus::Disetujui, TripStatus::Berlangsung, TripStatus::Selesai,
            TripStatus::Draft, TripStatus::Disetujui, TripStatus::Dibatalkan,
            TripStatus::Disetujui, TripStatus::Selesai, TripStatus::Diajukan,
            TripStatus::Berlangsung, TripStatus::Disetujui, TripStatus::Selesai,
            TripStatus::Ditolak, TripStatus::Disetujui, TripStatus::Draft,
            TripStatus::Selesai, TripStatus::Berlangsung, TripStatus::Diajukan,
            TripStatus::Selesai, TripStatus::Disetujui, TripStatus::Dibatalkan,
            TripStatus::Selesai,
        ];

        $sequence = [];
        $completedTrips = [];

        foreach ($statuses as $index => $status) {
            $employee = $employees[$index % $employees->count()];
            $unit = $employee->unit ?? $units->first();
            [$startDate, $endDate] = $this->datesFor($status, $index);
            [$maksud, $tujuan] = $kegiatan[$index % count($kegiatan)];

            $approved = in_array($status, [
                TripStatus::Disetujui,
                TripStatus::Berlangsung,
                TripStatus::Selesai,
            ], true);

            [$nomorSppd, $nomorUrut, $tahun] = $approved
                ? $this->sppdNumber($unit, $startDate, $sequence)
                : [null, null, null];

            $trip = Trip::query()->create([
                'user_id' => $employee->id,
                'unit_id' => $unit->id,
                'maksud' => $maksud,
                'tempat_tujuan' => $tujuan,
                'tanggal_mulai' => $startDate->toDateString(),
                'tanggal_selesai' => $endDate->toDateString(),
                'alat_angkut' => ['Darat', 'Udara', 'Laut'][$index % 3],
                'sumber_dana' => $index % 2 === 0 ? 'APBD 2026' : 'DAK 2026',
                'catatan' => $index % 4 === 0 ? 'Membawa dokumen pendukung kegiatan.' : null,
                'status' => $status,
                'nomor_sppd' => $approved ? $nomorSppd : null,
                'nomor_urut' => $approved ? $nomorUrut : null,
                'tahun' => $approved ? $tahun : null,
                'created_by' => $admin->id,
                'disetujui_oleh' => $approved ? $pejabat->id : null,
                'disetujui_at' => $approved ? $startDate->copy()->subDays(3)->min(now()) : null,
                'alasan_penolakan' => $status === TripStatus::Ditolak
                    ? 'Anggaran perjalanan belum tersedia pada periode ini.'
                    : null,
                'selesai_at' => $status === TripStatus::Selesai ? $endDate->copy()->endOfDay() : null,
                'dibatalkan_at' => $status === TripStatus::Dibatalkan ? $startDate->copy()->subDay() : null,
                'dibatalkan_oleh' => $status === TripStatus::Dibatalkan ? $admin->id : null,
                'alasan_pembatalan' => $status === TripStatus::Dibatalkan
                    ? 'Kegiatan dijadwalkan ulang oleh unit kerja.'
                    : null,
            ]);

            $days = $trip->lamaHari();

            $trip->costs()->createMany([
                [
                    'jenis_biaya' => 'Uang Harian',
                    'keterangan' => null,
                    'jumlah' => $days,
                    'tarif' => 150000,
                ],
                [
                    'jenis_biaya' => 'Transport',
                    'keterangan' => 'Pulang pergi',
                    'jumlah' => 1,
                    'tarif' => 450000 + ($index % 5) * 100000,
                ],
            ]);

            if ($status === TripStatus::Selesai && count($completedTrips) < 2) {
                $completedTrips[] = $trip;
            }
        }

        foreach ($completedTrips as $trip) {
            TripReport::query()->create([
                'trip_id' => $trip->id,
                'hasil' => 'Kegiatan terlaksana sesuai jadwal. Peserta membahas program kerja dan menyepakati langkah tindak lanjut bersama unit terkait.',
                'kendala' => 'Jadwal keberangkatan bergeser satu jam karena kondisi lalu lintas.',
                'rekomendasi' => 'Perlu penjadwalan ulang koordinasi rutin setiap triwulan agar hasil kegiatan terjaga.',
                'disusun_at' => $trip->tanggal_selesai->copy()->endOfDay(),
            ]);

            $this->attachPlaceholderPhotos($trip);
        }

        $this->command?->info('Demo data: '.(count($statuses)).' perjalanan untuk '.$employees->count().' pegawai.');
    }

    /**
     * @param  Collection<string, Unit>  $units
     */
    private function seedEmployees(Collection $units): void
    {
        $extraEmployees = [
            ['Ayu Lestari', 'BID-A', 'Analis Kebijakan', 'III/c'],
            ['Bima Prakoso', 'BID-A', 'Pengelola Program', 'III/b'],
            ['Citra Halimah', 'BID-A', 'Staf Administrasi', 'II/c'],
            ['Dimas Nugroho', 'BID-B', 'Analis Anggaran', 'III/c'],
            ['Eka Puspita', 'BID-B', 'Pengelola Keuangan', 'III/b'],
            ['Fajar Ramadhan', 'BID-B', 'Staf Administrasi', 'II/c'],
            ['Gita Maharani', 'SEK', 'Analis Kepegawaian', 'III/d'],
            ['Hendra Wijaya', 'SEK', 'Pengelola Umum', 'III/b'],
            ['Intan Permata', 'SEK', 'Arsiparis', 'III/a'],
            ['Joko Santoso', 'SEK', 'Staf Umum', 'II/b'],
        ];

        foreach ($extraEmployees as $index => [$name, $unitKode, $jabatan, $golongan]) {
            User::factory()->create([
                'name' => $name,
                'email' => 'pegawai'.($index + 3).'@sijalan.test',
                'role' => Role::Pegawai,
                'jabatan' => $jabatan,
                'golongan' => $golongan,
                'unit_id' => $units[$unitKode]->id,
            ]);
        }
    }

    /**
     * @return array{0: Carbon, 1: Carbon}
     */
    private function datesFor(TripStatus $status, int $index): array
    {
        $start = match ($status) {
            TripStatus::Selesai => now()->subDays(45 - $index)->startOfDay(),
            TripStatus::Berlangsung => now()->subDays(2)->startOfDay(),
            TripStatus::Disetujui => now()->addDays(3 + $index)->startOfDay(),
            TripStatus::Diajukan, TripStatus::Draft => now()->addDays(12 + $index)->startOfDay(),
            default => now()->subDays(20 + $index)->startOfDay(),
        };

        return [$start, $start->copy()->addDays(1 + ($index % 3))];
    }

    /**
     * @param  array<string, int>  $sequence
     * @return array{0: string, 1: int, 2: int}
     */
    private function sppdNumber(Unit $unit, Carbon $startDate, array &$sequence): array
    {
        $year = (int) $startDate->year;
        $key = $unit->id.'-'.$year;

        $sequence[$key] = ($sequence[$key] ?? 0) + 1;
        $urut = $sequence[$key];

        return [
            '090/SPPD/'.str_pad((string) $urut, 3, '0', STR_PAD_LEFT).'/'.$unit->kode.'/'.$year,
            $urut,
            $year,
        ];
    }

    private function attachPlaceholderPhotos(Trip $trip): void
    {
        $contents = base64_decode(self::PLACEHOLDER_PNG);

        for ($index = 1; $index <= 2; $index++) {
            $path = 'dokumentasi/'.$trip->id.'/contoh-'.$index.'.png';

            Storage::disk('public')->put($path, $contents);

            TripPhoto::query()->create([
                'trip_id' => $trip->id,
                'path' => $path,
                'keterangan' => 'Dokumentasi kegiatan '.$index,
                'uploaded_by' => $trip->user_id,
            ]);
        }
    }
}
