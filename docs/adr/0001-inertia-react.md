# Inertia + React untuk antarmuka MVP

Repo dimulai dari skeleton Laravel 13 (PHP 8.4) tanpa starter kit. Kami memilih **Inertia.js + React 19 + TypeScript** di atas Vite dan Tailwind 4 untuk seluruh antarmuka, dengan controller Laravel sebagai satu-satunya backend. Autentikasi dibangun sendiri (controller + halaman Inertia), bukan memakai starter kit.

Alasannya: kalender bulanan, form rincian biaya yang dinamis, dan galeri unggahan adalah bagian paling interaktif dari produk ini; React memberi komponen yang dapat dipakai ulang dan state management yang jelas, sementara Inertia menghindari pembangunan REST API, token auth, dan deploy terpisah. Konsekuensinya, build frontend (`npm run dev`/`build`) menjadi wajib, ada dua bahasa (PHP + TypeScript), dan halaman tidak ber-SSR sehingga render awal bergantung pada JavaScript. Halaman cetak SPPD/laporan tetap mengandalkan CSS print dan dialog cetak browser (lihat ADR-0003).

**Considered options**: Blade + Alpine (paling ringan, ditolak karena interaksi kalender/form dinamis lebih rapi di React), Livewire (dekat ke Blade, tidak dipilih), SPA React + REST API terpisah (ditolak karena menambah auth token, CORS, dan dua proses deploy untuk satu instansi).
