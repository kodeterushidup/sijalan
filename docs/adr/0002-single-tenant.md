# Single-tenant untuk MVP

Aplikasi melayani tepat satu instansi pemerintah. Tidak ada kolom `tenant_id`, tidak ada onboarding instansi, dan tidak ada isolasi data antar-organisasi.

Keputusan ini diambil karena kebutuhan awal hanya satu dinas/kantor dan multi-tenant menambah kompleksitas di setiap query, policy, unggahan, dan penomoran surat. Jika kelak dijual ke banyak instansi, migrasi ke multi-tenant akan menyentuh hampir seluruh model — karena itu keputusan ini dicatat. Pemisahan data di dalam instansi tetap dilakukan lewat Unit Kerja dan policy per peran/record.
