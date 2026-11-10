# Blade + Alpine, tanpa SPA atau starter kit

Repo dimulai dari skeleton Laravel 13 (PHP 8.4) tanpa starter kit. Kami memilih tetap memakai Blade + Tailwind 4 + Alpine.js untuk seluruh antarmuka MVP, tanpa Livewire, Inertia, React, atau starter kit autentikasi.

Alasannya: aplikasi ini didominasi halaman CRUD, tabel, dan satu kalender bulanan yang bisa dibangun dengan grid Blade + Alpine; SPA menambah build, state, dan permukaan bug tanpa manfaat yang sepadan untuk demo MVP. Konsekuensinya, interaksi real-time (mis. unggah progres, notifikasi) harus ditunda atau dibangun manual.

**Considered options**: Livewire (reaktif, tapi menambah dependency dan pola baru), Inertia + React (paling berat, tidak sepadan untuk satu instansi).
