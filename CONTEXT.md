# Perjalanan Dinas

Glosarium istilah domain untuk aplikasi manajemen perjalanan dinas pegawai. Dokumen ini hanya berisi bahasa domain, bukan keputusan implementasi.

## Language

**Perjalanan Dinas**:
Satu penugasan resmi seorang pegawai ke luar tempat kerja untuk jangka waktu tertentu, dengan maksud, tempat tujuan, dan sumber dana yang tercatat.
_Avoid_: Trip, travel, dinas luar, pengajuan cuti

**SPPD (Surat Perintah Perjalanan Dinas)**:
Dokumen resmi yang memerintahkan dan membiayai satu Perjalanan Dinas, memuat nomor surat, pegawai yang ditugaskan, tujuan, tanggal, dan rincian biaya.
_Avoid_: Surat tugas, surat jalan, travel permit

**Surat Tugas**:
Dokumen penugasan yang mendahului SPPD. Di luar cakupan MVP; disebut hanya untuk membedakannya dari SPPD.

**Laporan Perjalanan Dinas**:
Uraian hasil pelaksanaan satu Perjalanan Dinas yang disusun pegawai setelah perjalanan selesai.
_Avoid_: LPJ, laporan kegiatan, trip report

**Dokumentasi Perjalanan**:
Kumpulan foto kegiatan yang membuktikan pelaksanaan satu Perjalanan Dinas.
_Avoid_: Galeri, lampiran, bukti foto

**Rincian Biaya**:
Daftar komponen biaya (jenis, jumlah, tarif, subtotal) yang melekat pada satu Perjalanan Dinas dan tercetak di SPPD.
_Avoid_: Anggaran, budget, SPJ

**Sumber Dana**:
Kode atau nama pos anggaran yang membiayai satu Perjalanan Dinas.
_Avoid_: Mata anggaran, akun belanja

**Pengguna**:
Akun yang dapat masuk ke aplikasi, dikenali dari alamat email dan memiliki satu peran.
_Avoid_: User, akun login, member

**Pegawai**:
Pengguna berperan Pegawai yang data kepegawaiannya (NIP, jabatan, golongan, dan Unit Kerja) sudah lengkap serta sudah diaktifkan.
_Avoid_: Karyawan, user, staf, personel

**Aktivasi Pegawai**:
Tindakan Admin Kepegawaian yang mengaktifkan Pengguna berperan Pegawai setelah NIP dan Unit Kerja terisi.
_Avoid_: Verifikasi akun, approval user, aktivasi user

**Unit Kerja**:
Satuan organisasi tempat Pegawai bertugas (mis. Sekretariat, Bidang A), dipakai untuk memfilter kalender dan laporan.
_Avoid_: Divisi, departemen, bagian, OPD

**Admin Kepegawaian**:
Pengguna yang mengelola data Pegawai dan Unit Kerja, memverifikasi kelengkapan berkas, serta menerbitkan SPPD.
_Avoid_: Operator, admin sistem, staf TU

**Pejabat Penyetuju**:
Pengguna berwenang menyetujui atau menolak Perjalanan Dinas dan menandatangani SPPD.
_Avoid_: Approver, atasan, PPK, Kepala Dinas

**Verifikasi Pemberkasan**:
Pemeriksaan Admin Kepegawaian atas kelengkapan Laporan Perjalanan Dinas dan Dokumentasi Perjalanan sebelum Perjalanan Dinas dinyatakan selesai.
_Avoid_: Approval, validasi berkas, review

**Rombongan**:
Beberapa Pegawai yang melaksanakan satu penugasan perjalanan bersama. Di MVP dicatat sebagai beberapa Perjalanan Dinas terpisah, bukan satu SPPD kolektif.
_Avoid_: Grup, tim, batch

**Kalender Perjalanan**:
Tampilan bulanan berisi Perjalanan Dinas berdasarkan tanggal mulai dan tanggal selesai, tersedia dalam cakupan pribadi dan cakupan Unit Kerja.
_Avoid_: Jadwal, agenda, planner
