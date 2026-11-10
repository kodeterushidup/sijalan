# Task Tracker — Implementasi MVP SIJALAN

Tracker ini adalah daftar kerja tunggal saat implementasi. Sumber kebenaran kebutuhan tetap [`docs/PRD.md`](PRD.md); file ini hanya memecahnya menjadi task yang bisa dicentang.

| | |
|---|---|
| **Versi** | 1.0 |
| **Tanggal** | 10 November 2026 |
| **Cakupan** | MVP (Epic E0–E7) |
| **Referensi** | PRD §5 (FR), §9 (kriteria demo), §10 (urutan epic) |

## Cara pakai

1. Kerjakan berurutan per epic; task bertanda **prasyarat** harus selesai lebih dulu.
2. Centang `[x]` **hanya jika** kode, feature test, dan `vendor/bin/pint --dirty` untuk file terkait sudah beres.
3. Jika terhalang, ubah baris menjadi `- [ ] **E3-04** ... — 🚫 _blocked: alasan_`.
4. Jangan mengubah cakupan di sini; perubahan kebutuhan harus masuk PRD dulu.
5. Setiap akhir epic: jalankan seluruh test, `npm run build`, lalu demo singkat alur terkait.

**Definition of Done (berlaku untuk semua task)**

- Feature test mencakup happy path + minimal satu kasus izin/validasi.
- Tidak ada query N+1 pada halaman daftar/kalender.
- UI Bahasa Indonesia, responsif 360 px, dan memakai komponen layout yang sama.
- Perubahan frontend dibuktikan dengan `npm run build` sukses.
- Form memakai validasi server-side (bukan hanya HTML).

---

## E0 — Fondasi teknis

- [x] **E0-01** Pasang dependency: `@inertiajs/react`, `react`, `react-dom`, `@vitejs/plugin-react`, `typescript`, tipe React.
- [x] **E0-02** Konfigurasi `vite.config.js` (plugin React + alias `@`), `tsconfig.json`, dan `resources/js/app.tsx`.
- [x] **E0-03** Middleware Inertia (`HandleInertiaRequests`), root view `app.blade.php`, dan shared props `auth.user`, `flash`.
- [x] **E0-04** Layout aplikasi: sidebar navigasi per peran, topbar (nama, peran, logout), halaman error 403/404.
- [x] **E0-05** Set timezone `Asia/Jakarta`, locale `id`, format tanggal `d F Y`, dan helper rupiah.
- [x] **E0-06** Enum `Role` (`SuperAdmin`, `Admin`, `Pejabat`, `Pegawai`) dan `TripStatus` (`Draft`, `Diajukan`, `Disetujui`, `Ditolak`, `Berlangsung`, `Selesai`, `Dibatalkan`) + label Bahasa Indonesia.
- [x] **E0-07** Seeder akun demo: 1 super admin, 1 admin, 1 pejabat, 3 pegawai (kredensial dicatat di README).
- [x] **E0-08** Test dasar: halaman login tampil, tamu dialihkan ke login.

**Gate E0**: `npm run build` sukses, login demo berhasil, layout tampil di 360 px.

## E1 — Autentikasi, peran, profil

- [x] **E1-01** Halaman login Inertia + `LoginController` (email/password, remember me, rate limit).
- [x] **E1-02** Logout dan regenerasi session.
- [x] **E1-03** Tolak akun nonaktif (`is_active = false`) dengan pesan jelas.
- [x] **E1-04** Middleware/policy per peran (`role:admin`, `role:pejabat`, dst.) dan redirect 403.
- [x] **E1-05** CRUD akun oleh Super Admin: buat, ubah peran, nonaktifkan; tanpa registrasi publik.
- [x] **E1-06** Profil: ubah nama/no. HP, unggah TTD (PNG/JPG maks 1 MB), hapus TTD.
- [x] **E1-07** Simpan TTD di disk privat + route penyajian terautentikasi.
- [x] **E1-08** Test: login sukses/gagal, akun nonaktif, akses lintas peran ditolak, unggah TTD divalidasi.

**Gate E1**: setiap peran hanya melihat menu yang diizinkan PRD §3.

## E2 — Master data & pengaturan

- [ ] **E2-01** Migrasi + model + factory `units` (kode unik, nama).
- [ ] **E2-02** CRUD Unit Kerja (index, form, hapus dengan proteksi relasi).
- [ ] **E2-03** Migrasi kolom kepegawaian pada `users` (nip, jabatan, golongan, unit_id, no_hp, ttd_path, is_active).
- [ ] **E2-04** CRUD Pegawai: NIP 18 digit unik, email unik, password awal, unit wajib.
- [ ] **E2-05** Daftar pegawai: pencarian nama/NIP, filter unit, pagination 15.
- [ ] **E2-06** Import CSV pegawai + laporan baris gagal (nip, nama, jabatan, golongan, kode_unit, email).
- [ ] **E2-07** Migrasi + halaman Pengaturan instansi (nama, alamat, logo, format nomor, pejabat default).
- [ ] **E2-08** Test: validasi NIP/email unik, import sukses & gagal sebagian, akses pengaturan hanya Super Admin.

**Gate E2**: Admin dapat menyiapkan 1 unit + 3 pegawai dari UI tanpa seed tambahan.

## E3 — Perjalanan Dinas

- [ ] **E3-01** Migrasi `trips` (field PRD §7) + index `(user_id, tanggal_mulai)`, `(status)`.
- [ ] **E3-02** Migrasi `trip_costs` + model, relasi, dan perhitungan subtotal/total.
- [ ] **E3-03** Model `Trip` + factory dengan state status (`draft`, `diajukan`, `disetujui`, `berlangsung`, `selesai`, `ditolak`, `dibatalkan`).
- [ ] **E3-04** Halaman daftar perjalanan: filter status/unit/pegawai/rentang tanggal, kolom status berwarna.
- [ ] **E3-05** Form create/edit (React): data perjalanan + editor rincian biaya dinamis (tambah/hapus baris, total live).
- [ ] **E3-06** Validasi server: tanggal selesai ≥ mulai, field wajib, pegawai aktif, pegawai dalam unit yang benar.
- [ ] **E3-07** Validasi bentrok jadwal pegawai yang sama (status aktif: Draft–Berlangsung), pesan menyebut perjalanan yang bentrok.
- [ ] **E3-08** Simpan `Draft` dan aksi `Ajukan` (Draft → Diajukan) dengan guard transisi.
- [ ] **E3-09** Kunci edit setelah `Disetujui` (hanya `catatan`), hapus hanya untuk `Draft`.
- [ ] **E3-10** Aksi `Batalkan` dengan alasan (Draft/Diajukan/Disetujui/Berlangsung).
- [ ] **E3-11** Halaman detail perjalanan: data, rincian biaya, riwayat status, aksi sesuai peran.
- [ ] **E3-12** Test: validasi tanggal, bentrok, izin Admin vs Pegawai, guard transisi, total biaya.

**Gate E3**: Admin membuat perjalanan 3 hari + 2 rincian biaya dan mengajukannya; Pegawai tidak bisa membuka form.

## E4 — Persetujuan, penomoran, SPPD

- [ ] **E4-01** Halaman antrean persetujuan (Diajukan, terlama dulu) + detail singkat.
- [ ] **E4-02** Aksi setujui: transaksi DB, status `Disetujui`, isi `disetujui_oleh`/`disetujui_at`.
- [ ] **E4-03** Service penomoran SPPD: format placeholder, urut 3 digit per unit per tahun, unik `(tahun, unit_id, nomor_urut)`.
- [ ] **E4-04** Aksi tolak wajib alasan (maks 500), status `Ditolak`, ajukan ulang setelah diperbaiki.
- [ ] **E4-05** Halaman cetak SPPD (A4, CSS print): kop, nomor, data pegawai, tujuan, tanggal, angkut, sumber dana, rincian biaya + total, TTD pejabat.
- [ ] **E4-06** Tombol "Cetak / Simpan PDF" memanggil `window.print()`; nomor tidak bisa diedit.
- [ ] **E4-07** Guard: halaman SPPD hanya untuk status `Disetujui` ke atas; akses per peran/pemilik.
- [ ] **E4-08** Test: nomor terbit sekali & tidak dipakai ulang saat batal, penolakan tanpa alasan gagal, pegawai tidak bisa menyetujui.

**Gate E4**: Approve → nomor `090/SPPD/001/.../2026` tampil dan cetak SPPD rapi di Chrome (1 halaman).

## E5 — Kalender

- [ ] **E5-01** Props kalender per bulan: perjalanan aktif + status, dikelompokkan per tanggal.
- [ ] **E5-02** Komponen grid bulanan React: 7×6, nama hari Indonesia, navigasi bulan, tombol hari ini.
- [ ] **E5-03** Entri multi-hari tampil di setiap tanggal; warna per status + legenda.
- [ ] **E5-04** Filter unit dan pegawai (Admin/Pejabat); Pegawai hanya melihat miliknya.
- [ ] **E5-05** Klik tanggal membuka form create dengan tanggal terisi (Admin/Super Admin); klik entri membuka detail.
- [ ] **E5-06** Daftar perjalanan bulan berjalan di bawah kalender untuk mobile.
- [ ] **E5-07** Test: cakupan data per peran, filter unit, navigasi bulan, tanggal terisi otomatis.

**Gate E5**: Kalender menampilkan perjalanan demo pada tanggal yang benar dan tidak membocorkan data pegawai lain.

## E6 — Laporan & dokumentasi

- [ ] **E6-01** Migrasi `trip_reports` (unik per trip) + model + relasi.
- [ ] **E6-02** Halaman isi laporan (Pegawai pemilik, status `Berlangsung`): hasil, kendala, rekomendasi (wajib, maks 5.000).
- [ ] **E6-03** Simpan/ubah laporan selama belum `Selesai` (isi `disusun_at`).
- [ ] **E6-04** Migrasi `trip_photos` + unggah multi-file (JPG/PNG/PDF, maks 5 MB, maks 10/trip).
- [ ] **E6-05** Galeri: thumbnail gambar, ikon PDF, keterangan opsional (maks 150), hapus oleh pemilik sebelum `Selesai`.
- [ ] **E6-06** Guard unggah/hapus: hanya status `Berlangsung` dan hanya pemilik.
- [ ] **E6-07** Aksi Admin `Selesai`: tolak jika laporan kosong, foto < 1, atau `tanggal_selesai` belum lewat.
- [ ] **E6-08** Halaman cetak Laporan Perjalanan (kop, nomor SPPD, data, uraian, kendala, rekomendasi, daftar lampiran, TTD pegawai).
- [ ] **E6-09** Test: gate `Selesai`, validasi file, hapus setelah selesai ditolak, akses non-pemilik.

**Gate E6**: Alur demo §9 langkah 6–7 lulus tanpa error.

## E7 — Dashboard, data demo, QA

- [ ] **E7-01** Dashboard: kartu jumlah perjalanan bulan ini, menunggu persetujuan, berlangsung, berkas belum lengkap.
- [ ] **E7-02** Grafik batang perjalanan per unit (6 bulan) tanpa dependency chart baru.
- [ ] **E7-03** Seeder demo: 3 unit, 12 pegawai, ~25 perjalanan tersebar 3 bulan dengan variasi status.
- [ ] **E7-04** Seeder melampirkan contoh laporan + foto placeholder untuk 2 perjalanan selesai.
- [ ] **E7-05** Jalankan skenario demo PRD §9 dari database segar (`migrate:fresh --seed`).
- [ ] **E7-06** Cek responsif 360 px, 768 px, 1440 px pada kalender, form, tabel, dan halaman cetak.
- [ ] **E7-07** Cek performa: halaman daftar/kalender < 300 ms dengan data seed (Laravel Debugbar/`DB::listen` sementara, tidak di-commit).
- [ ] **E7-08** Jalankan `vendor/bin/pint --dirty --format agent` dan seluruh test suite.
- [ ] **E7-09** Perbarui README: cara install, akun demo, `npm run dev`, `schedule:work`, dan langkah demo.

**Gate E7**: Semua kriteria PRD §9 lulus dan test suite hijau.

---

## Checklist rilis MVP

- [ ] `composer install && npm install && npm run build` dari repo bersih.
- [ ] `php artisan migrate:fresh --seed` sukses.
- [ ] `php artisan test --compact` hijau.
- [ ] `php artisan schedule:work` mengubah `Disetujui` → `Berlangsung` saat tanggal tiba.
- [ ] 4 akun demo bisa login sesuai peran.
- [ ] SPPD dan laporan tercetak 1 halaman A4 tanpa terpotong.
- [ ] Dokumentasi foto tampil setelah diunggah.
- [ ] Tidak ada data sensitif di halaman publik; TTD tidak dapat diakses tanpa login.

## Backlog pasca-MVP (jangan dikerjakan sekarang)

- Rombongan / SPPD kolektif, Surat Tugas.
- Notifikasi in-app/email, drag-and-drop kalender, export Excel.
- Approval berlapis, modul SPJ/pembayaran, multi-tenant.
- Integrasi SIMPEG, e-sign tersertifikasi, audit log lengkap.

## Log progres

| Tanggal | Task | Catatan |
|---|---|---|
| 10 Nov 2026 | E0-01..E0-08 | Fondasi Inertia + React + TS, layout, enum, auth dasar, seeder akun. Lulus build, tsc, 9 test. |
| 10 Nov 2026 | E1-01..E1-08 | Peran via middleware, profil + TTD privat, CRUD akun Super Admin. 19 test hijau. |
