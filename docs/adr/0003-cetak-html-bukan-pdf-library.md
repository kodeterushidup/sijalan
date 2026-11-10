# Dokumen dicetak dari HTML, bukan PDF library

SPPD dan Laporan Perjalanan Dinas dirender sebagai halaman aplikasi (Inertia/React) dengan CSS khusus cetak (A4, margin 2 cm), lalu pengguna menekan "Cetak / Simpan PDF" dan memakai dialog cetak browser.

Kami menolak menambah package PDF server-side (mis. dompdf) untuk MVP karena: template resmi masih akan sering berubah, hasil cetak browser lebih setia pada CSS modern, dan tidak ada dependency baru yang perlu disetujui. Konsekuensinya, aplikasi tidak bisa mengirim PDF otomatis lewat email atau menyimpan arsip PDF di server; bila itu dibutuhkan, langkah berikutnya adalah menambah renderer headless (Browsershot) atau dompdf.
