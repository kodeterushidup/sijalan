# PRD — Aplikasi Manajemen Perjalanan Dinas

| | |
|---|---|
| **Nama produk** | SIJALAN — Sistem Informasi Perjalanan Dinas |
| **Versi dokumen** | 1.0 (MVP) |
| **Tanggal** | 10 November 2026 |
| **Status** | Disetujui untuk implementasi MVP |
| **Glosarium** | [`CONTEXT.md`](../CONTEXT.md) |
| **Keputusan arsitektur** | [`docs/adr/`](adr/) |
| **Task tracker** | [`docs/TASKS.md`](TASKS.md) |

---

## 1. Ringkasan

SIJALAN adalah aplikasi web internal satu instansi pemerintah untuk mengelola **Perjalanan Dinas pegawai**, mulai dari pencatatan perjalanan, persetujuan, penerbitan **SPPD**, hingga **pemberkasan** pasca-perjalanan berupa **Laporan Perjalanan Dinas** dan **Dokumentasi Perjalanan**.

Masalah yang diselesaikan: pencatatan perjalanan dinas saat ini tersebar di spreadsheet dan dokumen Word, sehingga jadwal pegawai sulit dipantau, penomoran SPPD tidak konsisten, dan kelengkapan laporan/dokumentasi sering terlambat atau hilang.

MVP berfokus pada satu alur utuh yang bisa didemokan: **Admin membuat perjalanan → Pejabat menyetujui → SPPD bernomor terbit dan bisa dicetak → Pegawai mengisi laporan dan mengunggah foto → Admin memverifikasi dan menutup perjalanan**, semuanya terlihat di kalender.

## 2. Tujuan

1. Menyediakan **kalender perjalanan** per pegawai dan per unit kerja sebagai sumber kebenaran jadwal.
2. Menstandarkan **penomoran dan format SPPD** yang dicetak dari data, bukan diketik ulang.
3. Memastikan setiap perjalanan yang selesai memiliki **laporan** dan **dokumentasi** yang lengkap.
4. Menyediakan jejak persetujuan (siapa menyetujui/menolak, kapan, alasannya).

### Non-tujuan (MVP)

- Modul pembayaran, SPJ, dan pencairan biaya.
- Surat Tugas (ST), SPPD kolektif/rombongan.
- Integrasi SIMPEG / sinkronisasi kepegawaian.
- Multi-instansi (SaaS), approval berlapis, notifikasi email/WhatsApp, export Excel, drag-and-drop kalender.
- Tanda tangan elektronik tersertifikasi; TTD berupa gambar yang diunggah.

## 3. Pengguna dan Peran

| Peran | Deskripsi | Kebutuhan utama |
|---|---|---|
| **Super Admin** | Pengelola aplikasi | Kelola akun & peran, pengaturan instansi |
| **Admin Kepegawaian** | Operator perjalanan dinas | Kelola pegawai/unit, buat & sunting perjalanan, cetak SPPD, verifikasi laporan & foto |
| **Pejabat Penyetuju** | Kepala/pejabat berwenang | Menyetujui/menolak perjalanan, TTD pada SPPD |
| **Pegawai** | Pelaksana perjalanan | Lihat kalender & riwayat, isi laporan, unggah dokumentasi, cetak berkas |

Akun dibuat oleh Super Admin; **tidak ada registrasi mandiri**. Satu orang = satu akun dengan tepat satu peran.

### Matriks izin

| Aksi | Super Admin | Admin | Pejabat | Pegawai |
|---|:--:|:--:|:--:|:--:|
| Kelola akun & peran | ✅ | — | — | — |
| Pengaturan instansi (kop, logo, format nomor) | ✅ | — | — | — |
| CRUD Unit Kerja & data Pegawai | ✅ | ✅ | — | — |
| Buat / sunting Perjalanan Dinas | ✅ | ✅ | — | — |
| Ajukan perjalanan ke Pejabat | ✅ | ✅ | — | — |
| Setujui / tolak perjalanan | — | — | ✅ | — |
| Batalkan perjalanan | ✅ | ✅ | — | — |
| Cetak SPPD | ✅ | ✅ | ✅ | ✅ (miliknya) |
| Lihat kalender semua unit | ✅ | ✅ | ✅ | — |
| Lihat kalender pribadi | ✅ | ✅ | ✅ | ✅ |
| Isi Laporan Perjalanan | — | — | — | ✅ (miliknya) |
| Unggah Dokumentasi | — | — | — | ✅ (miliknya) |
| Tandai perjalanan `Selesai` | ✅ | ✅ | — | — |
| Unduh laporan & dokumentasi | ✅ | ✅ | ✅ | ✅ (miliknya) |

## 4. Alur Bisnis

### 4.1 Status Perjalanan Dinas

```
                 ┌─────────┐
       (buat)    │  Draft  │
                 └────┬────┘
                      │ diajukan Admin
                      ▼
                 ┌─────────┐   tolak (wajib alasan)   ┌─────────┐
                 │ Diajukan│ ────────────────────────► │ Ditolak │
                 └────┬────┘                            └────┬────┘
                      │ disetujui (nomor SPPD terbit)       │ diperbaiki Admin
                      ▼                                     │
                 ┌─────────┐ ◄──────────────────────────────┘ (kembali ke Diajukan)
                 │Disetujui│
                 └────┬────┘
                      │ otomatis saat tanggal_mulai tiba
                      ▼
                 ┌────────────┐
                 │ Berlangsung│
                 └─────┬──────┘
                       │ Admin verifikasi: laporan terisi + ≥ 1 foto
                       ▼
                 ┌─────────┐
                 │ Selesai │
                 └─────────┘

  Dibatalkan: dapat dilakukan Admin/Super Admin dari status Draft, Diajukan,
  Disetujui, atau Berlangsung (dengan alasan).
```

Aturan status:

- Status hanya bergerak maju; tidak ada transisi mundur selain `Ditolak → Diajukan` setelah diperbaiki.
- `Berlangsung` diubah otomatis oleh penjadwal harian (00:05, zona Asia/Jakarta) untuk perjalanan `Disetujui` yang `tanggal_mulai <= hari ini`.
- `Selesai` hanya boleh jika laporan terisi **dan** minimal 1 foto ada **dan** `tanggal_selesai <= hari ini`.
- Perubahan status dicatat pelakunya dan waktunya (`disetujui_oleh`, `disetujui_at`, `selesai_at`, `dibatalkan_at`).

### 4.2 Penomoran SPPD

- Nomor dibuat **sekali** saat status menjadi `Disetujui`, di dalam transaksi database.
- Format bawaan: `090/SPPD/{urut}/{kode_unit}/{tahun}` — dapat diubah di Pengaturan dengan placeholder `{urut}`, `{kode_unit}`, `{tahun}`.
- `{urut}` = urutan 3 digit per Unit Kerja per tahun (contoh `001`), tidak pernah dipakai ulang meskipun perjalanan kemudian dibatalkan.
- Kombinasi (`tahun`, `unit_kerja`, `urut`) unik.
- Nomor tampil pada halaman cetak SPPD dan tidak dapat diedit manual.

### 4.3 Kalender

- Tampilan **bulanan** (grid 7×6) dengan navigasi bulan sebelumnya/berikutnya dan tombol "Hari ini".
- Cakupan: Admin/Pejabat/Super Admin melihat semua unit dan dapat memfilter per unit atau per pegawai; Pegawai hanya melihat miliknya.
- Klik tanggal (khusus Admin/Super Admin) membuka form perjalanan baru dengan tanggal terisi.
- Klik entri perjalanan membuka detail.
- Warna entri mengikuti status; legenda ditampilkan.
- Perjalanan multi-hari tampil pada setiap tanggal dalam rentang.
- Bentrok jadwal pegawai yang sama **ditolak** saat menyimpan (validasi, bukan sekadar peringatan). Status `Ditolak` dan `Dibatalkan` tidak dihitung sebagai bentrok.

### 4.4 Pemberkasan

**SPPD (cetak)**

Memuat: kop instansi (nama, alamat, logo), nomor SPPD, data pegawai (NIP, nama, jabatan, golongan, unit), maksud, tempat tujuan, tanggal mulai/selesai, lama hari, alat angkut, sumber dana, tabel Rincian Biaya + total, blok tanda tangan Pejabat (nama, NIP, TTD gambar), dan tempat/tanggal cetak.

**Laporan Perjalanan Dinas (cetak)**

Memuat: kop instansi, nomor & tanggal SPPD, data pegawai, tujuan, tanggal pelaksanaan, uraian hasil, kendala, rekomendasi/tindak lanjut, daftar lampiran foto, blok tanda tangan Pegawai.

**Dokumentasi Perjalanan**

Galeri foto per perjalanan. Setiap file punya keterangan opsional. Hanya dapat diunggah saat status `Berlangsung`; dapat dihapus oleh Pegawai pemilik selama belum `Selesai`.

## 5. Kebutuhan Fungsional

### Epic A — Autentikasi & Akun

- **FR-A1** Login dengan email + password; logout; tidak ada halaman registrasi.
- **FR-A2** Super Admin dapat membuat, menonaktifkan, dan mengubah peran akun.
- **FR-A3** Setiap pengguna dapat mengubah nama, no. HP, dan mengunggah gambar TTD (PNG/JPG, maks 1 MB, latar transparan/putih).
- **FR-A4** Akun nonaktif tidak dapat login.

### Epic B — Master Data

- **FR-B1** CRUD Unit Kerja: kode (unik, huruf kapital), nama.
- **FR-B2** CRUD Pegawai (akun role `pegawai`): NIP (unik, 18 digit angka), nama, jabatan, golongan, unit kerja, email (unik), no. HP; Admin menetapkan password awal saat membuat akun.
- **FR-B3** Pencarian & filter daftar pegawai berdasarkan nama/NIP/unit; pagination 15 baris.
- **FR-B4** Import pegawai dari CSV (kolom: nip, nama, jabatan, golongan, kode_unit, email) dengan laporan baris gagal.

### Epic C — Perjalanan Dinas

- **FR-C1** Admin membuat perjalanan: pegawai, unit (otomatis dari pegawai), maksud, tempat tujuan, tanggal mulai, tanggal selesai, alat angkut, sumber dana, catatan.
- **FR-C2** Rincian biaya: baris bebas (`jenis_biaya`, keterangan, jumlah, tarif); subtotal dan total dihitung sistem, tidak dapat diisi manual.
- **FR-C3** Validasi: tanggal selesai ≥ tanggal mulai; maksud dan tempat wajib; pegawai harus aktif; tidak boleh bentrok dengan perjalanan lain milik pegawai yang sama pada status aktif (`Draft` s.d. `Berlangsung`).
- **FR-C4** Simpan sebagai `Draft` atau langsung `Diajukan`.
- **FR-C5** Admin dapat menyunting perjalanan pada status `Draft`, `Diajukan`, dan `Ditolak`; setelah `Disetujui` hanya `catatan` yang dapat diubah.
- **FR-C6** Perjalanan berstatus `Draft` dapat dihapus permanen; status lain hanya dapat dibatalkan.
- **FR-C7** Daftar perjalanan dengan filter status, unit, pegawai, dan rentang tanggal.

### Epic D — Persetujuan

- **FR-D1** Pejabat melihat antrean `Diajukan` (terlama lebih dulu).
- **FR-D2** Setujui → status `Disetujui` + nomor SPPD + pelaku/waktu.
- **FR-D3** Tolak → wajib alasan (maks 500 karakter); status `Ditolak`; Admin dapat memperbaiki lalu mengajukan ulang.
- **FR-D4** Aksi setujui/tolak hanya untuk Pejabat; Admin tidak dapat menyetujui perjalanannya sendiri.

### Epic E — SPPD & Cetak

- **FR-E1** Halaman SPPD hanya dapat diakses setelah `Disetujui`.
- **FR-E2** Nomor SPPD terisi otomatis sesuai format Pengaturan.
- **FR-E3** Halaman cetak memakai CSS khusus cetak (A4, margin 2 cm) dan tombol "Cetak / Simpan PDF" memanggil dialog cetak browser.
- **FR-E4** Kop instansi dan TTD Pejabat tampil bila tersedia.

### Epic F — Kalender

- **FR-F1** Tampilan bulanan, filter unit/pegawai untuk Admin dan Pejabat.
- **FR-F2** Navigasi bulan, tombol hari ini, legenda status.
- **FR-F3** Klik tanggal membuat perjalanan (Admin/Super Admin); klik entri membuka detail.
- **FR-F4** Daftar perjalanan pada bulan berjalan ditampilkan di bawah kalender (tampilan mobile).

### Epic G — Laporan Perjalanan

- **FR-G1** Pegawai mengisi laporan untuk perjalanan miliknya yang berstatus `Berlangsung`: uraian hasil, kendala, rekomendasi/tindak lanjut (masing-masing wajib, maks 5.000 karakter).
- **FR-G2** Laporan dapat disunting selama status belum `Selesai`.
- **FR-G3** Halaman cetak laporan mengikuti format bagian 4.4, termasuk daftar lampiran foto.

### Epic H — Dokumentasi

- **FR-H1** Unggah banyak foto sekaligus (JPG/PNG/PDF, maks 5 MB/file, maks 10 file per perjalanan).
- **FR-H2** Setiap file memiliki keterangan opsional (maks 150 karakter).
- **FR-H3** Hapus file oleh pemilik selama status belum `Selesai`.
- **FR-H4** Galeri menampilkan thumbnail untuk gambar dan ikon untuk PDF.

### Epic I — Dashboard & Pengaturan

- **FR-I1** Dashboard: jumlah perjalanan bulan ini, menunggu persetujuan, sedang berlangsung, belum lengkap berkasnya, dan grafik batang perjalanan per unit (6 bulan terakhir).
- **FR-I2** Pengaturan instansi (Super Admin): nama instansi, alamat, logo (maks 2 MB), format nomor SPPD, nama & NIP Pejabat penanda tangan default.
- **FR-I3** Zona waktu aplikasi Asia/Jakarta; tanggal disimpan sebagai `date`, bukan datetime.

## 6. Halaman Aplikasi

| Halaman | Rute (rencana) | Akses |
|---|---|---|
| Login | `/login` | Publik |
| Dashboard | `/dashboard` | Semua |
| Kalender | `/kalender` | Semua (terfilter per peran) |
| Daftar perjalanan | `/perjalanan` | Admin, Pejabat, Super Admin |
| Detail perjalanan | `/perjalanan/{id}` | Pemilik & peran terkait |
| Form perjalanan | `/perjalanan/create`, `/perjalanan/{id}/edit` | Admin, Super Admin |
| Antrean persetujuan | `/persetujuan` | Pejabat |
| Cetak SPPD | `/perjalanan/{id}/sppd` | Semua peran terkait |
| Laporan (isi & cetak) | `/perjalanan/{id}/laporan` | Pegawai pemilik (isi), terkait (cetak) |
| Dokumentasi | `/perjalanan/{id}/dokumentasi` | Pegawai pemilik (ubah), terkait (lihat) |
| Pegawai & Unit | `/pegawai`, `/unit` | Admin, Super Admin |
| Akun & Peran | `/akun` | Super Admin |
| Pengaturan | `/pengaturan` | Super Admin |

## 7. Model Data Konseptual

| Entitas | Field penting | Relasi |
|---|---|---|
| `users` | name, email, password, role (`super_admin`\|`admin`\|`pejabat`\|`pegawai`), nip, jabatan, golongan, unit_id, no_hp, ttd_path, is_active | belongsTo `units` |
| `units` | kode, nama | hasMany `users`, `trips` |
| `trips` | user_id, unit_id, maksud, tempat_tujuan, tanggal_mulai, tanggal_selesai, alat_angkut, sumber_dana, catatan, status, nomor_sppd, nomor_urut, tahun, created_by, disetujui_oleh, disetujui_at, alasan_penolakan, selesai_at, dibatalkan_at | belongsTo `users` (pegawai, pembuat, penyetuju), hasMany `trip_costs`, hasOne `trip_report`, hasMany `trip_photos` |
| `trip_costs` | trip_id, jenis_biaya, keterangan, jumlah, tarif, subtotal | belongsTo `trips` |
| `trip_reports` | trip_id (unik), hasil, kendala, rekomendasi, disusun_at | belongsTo `trips` |
| `trip_photos` | trip_id, path, keterangan, uploaded_by | belongsTo `trips` |
| `settings` | nama_instansi, alamat, logo_path, format_nomor | singleton |

Catatan: data pegawai disimpan pada `users` (bukan tabel `employees` terpisah) agar MVP hanya punya satu identitas per orang. Kolom kepegawaian nullable untuk akun non-pegawai.

## 8. Aturan Non-Fungsional

- **Stack**: Laravel 13 (PHP 8.4) + Inertia.js 2 + React 19 + TypeScript + Vite + Tailwind 4. Tidak ada REST API terpisah dan tidak memakai starter kit autentikasi; autentikasi dibangun sendiri dengan controller + halaman Inertia. `npm run build` wajib dijalankan setelah perubahan frontend.
- **Rendering**: SPA shell Inertia tanpa SSR; halaman cetak SPPD/laporan tetap HTML + CSS print.
- **Bahasa**: seluruh antarmuka Bahasa Indonesia; label tanggal `d F Y` (contoh: 10 November 2026).
- **Responsif**: nyaman dipakai pada 360 px hingga desktop; kalender dapat digeser horizontal di ponsel.
- **Kinerja**: halaman biasa < 300 ms pada data 300 pegawai / 2.000 perjalanan; index pada `trips(user_id, tanggal_mulai)`, `trips(status)`, `trip_photos(trip_id)`.
- **Keamanan**: middleware peran + policy per record; validasi unggahan (MIME + ekstensi + ukuran); TTD disimpan di disk privat dan disajikan lewat route terautentikasi; dokumentasi di disk `public`.
- **Audit minimal**: kolom pelaku & waktu untuk setiap transisi status.
- **Backup**: SQLite/MySQL mengikuti konfigurasi server; tidak ada fitur backup di aplikasi.
- **Aksesibilitas**: kontras teks memadai, tombol punya label, navigasi kalender dapat dioperasikan keyboard.

## 9. Kriteria Penerimaan Demo

Demo dianggap berhasil bila skenario berikut berjalan tanpa intervensi database manual:

1. Login sebagai **Admin** → buat Unit Kerja & 3 Pegawai.
2. Buat Perjalanan Dinas 3 hari untuk salah satu pegawai, isi 2 baris rincian biaya, lalu **Ajukan**.
3. Login sebagai **Pejabat** → setujui. Nomor SPPD muncul dengan format `090/SPPD/001/{KODE}/{TAHUN}`.
4. Buka **Cetak SPPD** → kop, data, rincian biaya, dan TTD tampil; dialog cetak browser terbuka.
5. Kalender menampilkan perjalanan tersebut pada ketiga tanggalnya.
6. Login sebagai **Pegawai** → isi laporan (hasil, kendala, rekomendasi) dan unggah 2 foto.
7. Login sebagai **Admin** → coba tandai `Selesai` sebelum laporan lengkap (harus ditolak), lalu setelah lengkap (harus berhasil).
8. Dashboard menampilkan angka yang sesuai dan kalender menandai perjalanan sebagai selesai.

## 10. Rencana Implementasi MVP

| Epic | Isi | Prasyarat |
|---|---|---|
| E1 | Fondasi: auth, peran, layout, seeder akun | — |
| E2 | Master data: unit, pegawai, pengaturan | E1 |
| E3 | Perjalanan: CRUD, rincian biaya, validasi bentrok | E2 |
| E4 | Persetujuan + penomoran SPPD + halaman cetak | E3 |
| E5 | Kalender bulanan + filter | E3 |
| E6 | Laporan + dokumentasi + verifikasi selesai | E4 |
| E7 | Dashboard, seed data demo, pengujian | E1–E6 |

Urutan pengerjaan mengikuti tabel di atas; setiap epic disertai feature test (status transition, izin, validasi, unggahan, penomoran).

## 11. Risiko & Asumsi

| Risiko / Asumsi | Mitigasi |
|---|---|
| Format SPPD berbeda tiap instansi | Kop & format nomor dapat diubah di Pengaturan; template halaman cetak (React/TSX) mudah disesuaikan |
| Cetak PDF bergantung browser | CSS print A4 diuji di Chrome/Edge; pengguna diarahkan "Simpan sebagai PDF" |
| Scheduler tidak berjalan di lokal | Dokumentasi menjalankan `php artisan schedule:work`; status tetap dapat diverifikasi manual lewat tanggal |
| SPPD rombongan belum didukung | Dicatat sebagai future work; sementara dibuat satu perjalanan per pegawai |
| TTD gambar mudah dipalsukan | Disepakati sebagai batas MVP; e-sign tersertifikasi masuk future work |

## 12. Future Work

Rombongan/SPPD kolektif, Surat Tugas, notifikasi email/in-app, drag-and-drop kalender, export Excel, approval berlapis, modul SPJ & pembayaran, multi-instansi, integrasi SIMPEG, e-sign tersertifikasi, dan audit log lengkap.
