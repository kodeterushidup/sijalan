<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('settings', function (Blueprint $table) {
            $table->id();
            $table->string('nama_instansi', 160)->default('Instansi Pemerintah');
            $table->text('alamat')->nullable();
            $table->string('logo_path')->nullable();
            $table->string('format_nomor', 160)->default('090/SPPD/{urut}/{kode_unit}/{tahun}');
            $table->string('nama_pejabat', 120)->nullable();
            $table->string('nip_pejabat', 18)->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('settings');
    }
};
