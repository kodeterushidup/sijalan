# SIJALAN

Aplikasi web internal untuk mengelola perjalanan dinas pegawai: kalender, persetujuan, SPPD, laporan perjalanan, dan dokumentasi.

## Teknologi

- Laravel 13, PHP 8.4, SQLite (bawaan)
- Inertia v3, React 19, TypeScript, Vite
- Tailwind CSS 4

## Instalasi

```bash
composer install
npm install
cp .env.example .env
php artisan key:generate
php artisan migrate:fresh --seed
php artisan storage:link
npm run build
```

Untuk pengembangan:

```bash
npm run dev
php artisan serve
```

Atau jalankan semuanya sekaligus dengan `composer run dev`.

## Akun demo

Semua akun memakai kata sandi `password`.

| Peran | Email |
|---|---|
| Super Admin | `superadmin@sijalan.test` |
| Admin Kepegawaian | `admin@sijalan.test` |
| Pejabat Penyetuju | `pejabat@sijalan.test` |
| Pegawai | `pegawai@sijalan.test` |
| Pegawai | `pegawai2@sijalan.test` |

Seeder demo juga membuat 12 pegawai dan 25 perjalanan dalam tiga bulan terakhir, termasuk dua perjalanan selesai yang sudah memiliki laporan dan dokumentasi.

## Penjadwal status

Perjalanan `Disetujui` berubah menjadi `Berlangsung` setiap pukul 00:05 Asia/Jakarta. Jalankan penjadwal saat pengembangan:

```bash
php artisan schedule:work
```

Perintah manualnya:

```bash
php artisan trips:advance-status
```

## Alur demo

1. Login sebagai **Admin Kepegawaian**, buka **Perjalanan**, buat perjalanan baru beserta rincian biaya, lalu ajukan ke Pejabat.
2. Login sebagai **Pejabat Penyetuju**, buka **Persetujuan**, periksa perjalanan, lalu setujui. Nomor SPPD terbit.
3. Buka **Cetak SPPD** dari halaman detail. Kop, rincian biaya, dan tanda tangan tampil. Gunakan tombol **Cetak / Simpan PDF**.
4. Buka **Kalender** untuk melihat jadwal per pegawai dan per unit. Klik tanggal untuk membuat perjalanan baru.
5. Login sebagai **Pegawai**, buka perjalanan berstatus `Berlangsung`, isi laporan, dan unggah dokumentasi.
6. Login kembali sebagai **Admin Kepegawaian**, periksa syarat verifikasi, lalu tandai perjalanan **Selesai**.
7. Cetak laporan perjalanan dari halaman detail.
8. Buka **Ringkasan** untuk melihat angka bulan ini, antrean persetujuan, dan grafik per unit.

## Pengujian

```bash
php artisan test --compact
vendor/bin/pint --format agent
npx tsc --noEmit
npm run build
```

## Dokumen

- [`docs/PRD.md`](docs/PRD.md) untuk kebutuhan produk dan kriteria demo.
- [`docs/TASKS.md`](docs/TASKS.md) untuk status implementasi per epic.
- [`CONTEXT.md`](CONTEXT.md) untuk glosarium istilah domain.
- [`docs/adr/`](docs/adr/) untuk keputusan arsitektur.

## Catatan penyimpanan

Tanda tangan disimpan di disk privat dan disajikan lewat route terautentikasi. Dokumentasi perjalanan disimpan di disk `public`, sehingga `php artisan storage:link` wajib dijalankan sekali setelah instalasi.
