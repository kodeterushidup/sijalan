## Problem Statement

Pegawai tidak bisa masuk aplikasi tanpa lebih dulu didaftarkan oleh Admin Kepegawaian yang membuatkan email dan kata sandi. Artinya setiap pegawai baru harus menunggu admin, dan setiap pegawai harus mengingat satu kata sandi tambahan yang tidak mereka pilih sendiri. Ketika kata sandi lupa, satu-satunya jalan adalah meminta admin menetapkannya ulang. Di sisi admin, pekerjaan pendaftaran akun menumpuk dan tidak ada cara bagi pegawai baru untuk mengidentifikasi dirinya sendiri.

## Solution

Tambahkan tombol **Masuk dengan Google** di halaman masuk sebagai cara masuk kedua, di samping email dan kata sandi.

- Pegawai baru dapat masuk dengan akun Google tanpa didaftarkan lebih dulu. Aplikasi membuat Pengguna baru berperan Pegawai dengan status **belum aktif**; akses terbuka setelah Admin Kepegawaian mengisi NIP dan Unit Kerja lalu melakukan Aktivasi Pegawai.
- Pegawai yang akunnya sudah dibuat admin dan emailnya sama dengan email Google akan tertaut otomatis pada login pertama, lalu langsung dapat masuk.
- Tidak ada pembatasan domain email. Penjaga terhadap orang luar adalah status belum aktif, bukan domain.
- Super Admin tidak dapat masuk dengan Google; peran tertinggi tetap memakai kata sandi.
- Kata sandi tetap tersedia untuk semua peran. Akun yang hanya memakai Google tidak memiliki kata sandi.

## User Stories

1. Sebagai calon pegawai baru, saya ingin masuk memakai akun Google tanpa didaftarkan lebih dulu, agar saya tidak perlu menunggu admin membuatkan kata sandi.
2. Sebagai calon pegawai baru, saya ingin langsung diberi tahu bahwa akun saya sudah dibuat dan sedang menunggu aktivasi, agar saya tahu langkah berikutnya.
3. Sebagai pegawai, saya ingin bisa masuk dengan Google setelah akun saya diaktifkan, agar tidak ada langkah tambahan setelah aktivasi.
4. Sebagai pegawai lama yang akunnya dibuat admin, saya ingin masuk dengan Google memakai email yang sama, agar akun saya langsung tertaut tanpa mendaftar ulang.
5. Sebagai pegawai, saya ingin tetap bisa masuk dengan email dan kata sandi, agar saya punya pilihan ketika akun Google tidak tersedia.
6. Sebagai pegawai yang akunnya hanya memakai Google, saya ingin diberi tahu untuk memakai tombol Google saat mencoba kata sandi, agar saya tidak bingung mengapa kata sandi saya tidak diterima.
7. Sebagai pegawai yang dinonaktifkan, saya ingin ditolak dengan pesan yang jelas, agar saya tahu harus menghubungi Admin Kepegawaian.
8. Sebagai pengguna, saya ingin kembali ke halaman masuk dengan pesan ketika saya membatalkan izin di Google, agar saya bisa mencoba lagi tanpa merasa aplikasi rusak.
9. Sebagai pengguna, saya ingin mendapat pesan gagal yang umum ketika terjadi masalah lain, agar tidak ada informasi tentang akun yang bocor.
10. Sebagai pengguna, saya ingin tetap masuk setelah memakai Google, agar saya tidak mengulang proses masuk di perangkat yang sama.
11. Sebagai pengguna ponsel, saya ingin tombol Google mudah dijangkau dan tidak berdesakan dengan form, agar halaman masuk tetap nyaman dipakai.
12. Sebagai pengguna, saya ingin tombol Google hanya muncul ketika kredensial sudah dipasang, agar saya tidak melihat tombol yang pasti gagal.
13. Sebagai pengguna, saya ingin tidak dibuatkan akun ganda saat masuk berulang kali dengan Google, agar tidak ada dua Pengguna untuk satu orang.
14. Sebagai pengguna, saya ingin tetap bisa masuk walau email Google saya berubah, agar saya tidak terkunci dari akun saya sendiri.
15. Sebagai pengguna, saya ingin sesi diperbarui setelah masuk, agar sesi lama tidak bisa dipakai ulang.
16. Sebagai Super Admin, saya ingin akun Super Admin tidak bisa masuk dengan Google, agar peran tertinggi tetap memakai kata sandi.
17. Sebagai Admin Kepegawaian, saya ingin melihat akun baru hasil Google di daftar Pegawai dengan tanda belum aktif, agar saya tahu ada akun yang perlu dilengkapi.
18. Sebagai Admin Kepegawaian, saya ingin mengisi NIP dan Unit Kerja lalu mengaktifkan akun, agar orang itu benar-benar menjadi Pegawai.
19. Sebagai Admin Kepegawaian, saya ingin aktivasi ditolak kalau NIP atau Unit Kerja masih kosong, agar data kepegawaian tidak tersimpan setengah jadi.
20. Sebagai Admin Kepegawaian, saya ingin menghapus akun asing yang tidak pernah aktif dan tidak punya perjalanan, agar daftar Pegawai tidak dipenuhi akun sampah.
21. Sebagai Admin Kepegawaian, saya ingin penghapusan ditolak untuk Pegawai yang punya perjalanan, agar riwayat perjalanan dan SPPD tidak rusak.
22. Sebagai Admin Kepegawaian, saya ingin akun yang saya buat manual tetap berfungsi seperti sebelumnya, agar alur lama tidak berubah.
23. Sebagai Admin Kepegawaian, saya ingin Akun Google yang sudah tertaut ke Pengguna lain ditolak, agar satu identitas Google tidak terpecah ke dua akun.
24. Sebagai Admin Kepegawaian, saya ingin email Google yang belum terverifikasi tidak menautkan akun, agar penautan tidak bisa dipalsukan.
25. Sebagai orang luar yang menemukan halaman masuk, saya ingin hanya bisa membuat akun yang tidak aktif, agar saya tidak dapat melihat data instansi.
26. Sebagai maintainer, saya ingin rute Google tidak tersedia saat kredensial kosong, agar fitur setengah jadi tidak diekspos.
27. Sebagai maintainer, saya ingin kredensial hanya dibaca dari environment, agar tidak ada rahasia yang masuk ke repo.
28. Sebagai maintainer, saya ingin percobaan masuk dibatasi lajunya, agar tidak mudah disalahgunakan.
29. Sebagai maintainer, saya ingin alur ini punya tes fitur dengan Google tiruan, agar perubahan berikutnya tidak merusak aktivasi.
30. Sebagai maintainer, saya ingin glosarium dan ADR memakai istilah Pengguna, Pegawai, dan Aktivasi Pegawai, agar bahasa domain tetap konsisten.

## Implementation Decisions

**Ruang lingkup dan peran**
- Masuk dengan Google adalah cara masuk tambahan. Kata sandi tetap berlaku untuk semua peran.
- Super Admin ditolak pada alur Google. Penolakan terjadi di server, bukan hanya dengan menyembunyikan tombol.
- Tidak ada pembatasan domain email pada versi ini. Penjaga terhadap akun asing adalah status belum aktif.
- Cakupan Google hanya untuk identitas: `openid`, `email`, `profile`. Tidak ada akses API Google lain dan tidak ada offline access.

**Pembuatan dan penautan akun**
- Email Google dicocokkan tanpa membedakan huruf besar-kecil.
- Pencarian selalu dimulai dari identitas Google (`google_id`), baru kemudian dari email.
- Akun yang sudah tertaut lewat `google_id` tetap bisa masuk walau email Google-nya berubah atau belum terverifikasi, karena identitasnya sudah dikenali dari `google_id`.
- Email Google yang belum terverifikasi tidak boleh membuat akun baru atau menautkan ke Pengguna lama.
- Bila email sudah punya Pengguna: tautkan identitas Google hanya jika akun aktif, peran bukan Super Admin, dan akun belum punya identitas Google lain. Bila identitas Google sudah tertaut ke Pengguna lain, tolak.
- Bila email belum punya Pengguna: buat Pengguna baru dengan nama dari Google, email, `role = pegawai`, `is_active = false`, `password = null`, dan `email_verified_at` diisi. Pengguna baru tidak langsung masuk.
- Email pada Pengguna tidak pernah ditimpa dari Google. Identitas instansi tetap dipegang admin.

**Perubahan skema**
- Tambah kolom `google_id` pada `users`: string, nullable, unique.
- Ubah kolom `password` pada `users` menjadi nullable, karena akun yang hanya memakai Google tidak punya kata sandi.
- Tidak ada tabel baru.

**Alur masuk**
- Rute redirect dan callback berada di grup `guest`, dibatasi lajunya seperti rute masuk yang ada.
- Bila kredensial Google kosong, kedua rute membalas 404 dan halaman masuk menyembunyikan tombol.
- Setelah berhasil, sesi diperbarui dan pengguna diarahkan ke halaman tujuan awal atau dashboard, dengan remember me aktif.
- Pesan kegagalan dikirim kembali ke halaman masuk, satu pesan per kasus:
  - akun baru dibuat tetapi belum aktif: "Akun dibuat. Tunggu aktivasi Admin Kepegawaian."
  - akun dinonaktifkan: "Akun tidak aktif. Hubungi Admin Kepegawaian."
  - peran Super Admin: "Akun ini harus masuk dengan kata sandi."
  - identitas Google sudah tertaut ke Pengguna lain: "Akun Google ini sudah tertaut ke pengguna lain."
  - pengguna membatalkan di Google: "Masuk dengan Google dibatalkan."
  - kasus lain: "Gagal masuk dengan Google. Coba lagi."
- Bila kata sandi akun null dan Google aktif, form kata sandi menampilkan pesan agar memakai tombol Google, bukan "Email atau kata sandi tidak sesuai." Bila Google tidak aktif, pesan umum yang dipakai agar pengguna tidak diarahkan ke tombol yang tidak ada.

**Halaman masuk**
- Properti baru berisi status aktif-tidaknya Google, dipakai untuk menampilkan atau menyembunyikan tombol.
- Tombol ditempatkan setelah form kata sandi dengan pemisah "atau", dan pesan kegagalan tampil di atas form.
- Teks "Akses hanya untuk pegawai yang terdaftar" tidak lagi benar dan diganti dengan keterangan bahwa akun baru menunggu aktivasi Admin Kepegawaian.
- Tidak ada aset gambar baru; mengikuti aturan antislop mode DURING.

**Pengelolaan Pegawai**
- Daftar Pegawai menampilkan penanda "Belum aktif" untuk akun hasil Google yang belum diaktifkan, dan "Nonaktif" untuk akun yang sudah pernah aktif lalu dinonaktifkan.
- Aktivasi ditolak di server bila NIP atau Unit Kerja kosong. Jabatan dan golongan tetap opsional.
- Aksi hapus disediakan untuk Pengguna berperan Pegawai yang belum pernah aktif, belum punya NIP, dan tidak punya perjalanan. Penghapusan ditolak untuk akun lain, agar riwayat tidak ikut hilang.
- Aturan boleh-hapus dipakai bersama oleh daftar dan aksi hapus, sehingga keduanya tidak bisa berbeda.
- Tidak ada logika baru untuk akun yang dibuat manual atau lewat impor; alur lama tidak berubah.

**Penempatan logika**
- Alur cari-taut-buat-akun berada di satu controller autentikasi baru; tidak menambah lapisan service baru, mengikuti gaya controller-heavy yang sudah dipakai aplikasi.
- Perilaku yang dapat diamati (status balasan, sesi, baris basis data, halaman Inertia) adalah yang diuji; helper internal tidak diekspos sebagai kontrak.

## Testing Decisions

**Seam**
- Satu seam: permintaan HTTP ke rute aplikasi, dengan Google diganti `Socialite::fake('google')`. Ini seam yang sudah dipakai tes autentikasi dan tes pengelolaan pegawai, sehingga tidak ada modul internal baru yang perlu di-mock.
- Tes yang baik di sini hanya memeriksa perilaku yang terlihat dari luar: status redirect atau 404, isi session error, status autentikasi, dan baris `users` yang terbentuk atau berubah. Tes tidak memanggil method privat controller dan tidak memeriksa susunan query.

**Modul yang diuji**
- Halaman masuk: tombol tampil atau tidak sesuai konfigurasi.
- Rute redirect dan callback Google: seluruh cabang pembuatan, penautan, dan penolakan.
- Form kata sandi: pesan khusus untuk akun tanpa kata sandi.
- Daftar Pegawai: penanda belum aktif, aturan aktivasi, dan aturan hapus.

**Skenario**
1. Email tak dikenal membuat Pengguna `pegawai` yang belum aktif, tidak masuk, dan menampilkan pesan aktivasi.
2. Akun aktif dengan email sama dan email Google terverifikasi mendapat `google_id` lalu masuk.
3. Akun nonaktif ditolak dan tidak masuk.
4. Akun Super Admin ditolak.
5. Identitas Google yang sudah tertaut ke Pengguna lain ditolak.
6. Email Google yang belum terverifikasi tidak menautkan akun lama dan tidak membuat akun baru.
7. Kata sandi untuk akun tanpa kata sandi menampilkan pesan "gunakan Google".
8. Kedua rute membalas 404 saat kredensial kosong, dan halaman masuk menyembunyikan tombol.
9. Aktivasi Pegawai tanpa NIP atau Unit Kerja ditolak.
10. Hapus diizinkan untuk akun belum aktif tanpa perjalanan, ditolak untuk Pegawai yang punya perjalanan.

**Prior art**
- `AuthenticationTest` untuk alur masuk berbasis session dan pesan error.
- `EmployeeManagementTest` untuk aturan validasi dan otorisasi peran pada data Pegawai.

## Out of Scope

- Penyedia identitas selain Google.
- Pembatasan domain email dan allowlist domain.
- Penyimpanan foto profil Google; UI tetap memakai inisial.
- Integrasi Google Calendar, Drive, atau akses API Google lain.
- Halaman pelengkapan profil oleh pegawai sendiri; NIP dan Unit Kerja tetap diisi Admin Kepegawaian.
- Alur lupa kata sandi dan pembuatan kata sandi oleh akun Google.
- Sinkronisasi perubahan email Google ke email Pengguna.
- Penghapusan Pegawai yang sudah punya perjalanan atau pernah aktif.
- Perubahan pada impor pegawai atau pembuatan akun manual.
- Notifikasi ke admin saat ada akun baru menunggu aktivasi.

## Further Notes

- Membutuhkan OAuth client Google Cloud (client ID, secret, redirect URI) dari sisi operator. Selama kredensial kosong, fitur tetap tersembunyi dan rute tidak tersedia.
- Keputusan pembuatan akun otomatis beserta konsekuensinya dicatat di `docs/adr/0006-login-google-membuat-akun-belum-aktif.md`.
- Glosarium `CONTEXT.md` sudah memuat Pengguna, Pegawai yang diperbarui, dan Aktivasi Pegawai.
- Risiko yang disadari: tanpa aturan domain, siapa pun dapat membuat baris Pengguna yang tidak aktif. Aksi hapus untuk akun belum aktif tanpa perjalanan adalah satu-satunya jalur pembersihan, sehingga admin perlu tahu akun seperti itu bisa muncul.
