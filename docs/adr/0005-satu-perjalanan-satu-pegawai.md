# Satu Perjalanan Dinas = satu Pegawai

Model MVP memetakan satu Perjalanan Dinas ke tepat satu Pegawai; tidak ada SPPD kolektif/rombongan. Perjalanan bersama dicatat sebagai beberapa perjalanan terpisah dengan maksud, tujuan, dan tanggal yang sama.

Keputusan ini menjaga model data, penomoran, laporan, dan dokumentasi tetap sederhana (relasi satu-ke-banyak biasa, satu laporan per perjalanan). Konsekuensinya, SPPD rombongan yang lazim di instansi pemerintah belum bisa dicetak sebagai satu dokumen; perubahan ke arah itu akan mengubah skema (`trip_employees`) dan template SPPD.
