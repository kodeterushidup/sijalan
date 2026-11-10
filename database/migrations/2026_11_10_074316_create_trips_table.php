<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('trips', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('unit_id')->constrained()->restrictOnDelete();
            $table->string('maksud', 255);
            $table->string('tempat_tujuan', 255);
            $table->date('tanggal_mulai');
            $table->date('tanggal_selesai');
            $table->string('alat_angkut', 80)->default('Darat');
            $table->string('sumber_dana', 120);
            $table->text('catatan')->nullable();
            $table->string('status', 20)->default('draft')->index();
            $table->string('nomor_sppd', 120)->nullable()->unique();
            $table->unsignedInteger('nomor_urut')->nullable();
            $table->unsignedSmallInteger('tahun')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('disetujui_oleh')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('disetujui_at')->nullable();
            $table->text('alasan_penolakan')->nullable();
            $table->timestamp('selesai_at')->nullable();
            $table->timestamp('dibatalkan_at')->nullable();
            $table->foreignId('dibatalkan_oleh')->nullable()->constrained('users')->nullOnDelete();
            $table->text('alasan_pembatalan')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'tanggal_mulai']);
            $table->unique(['tahun', 'unit_id', 'nomor_urut']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('trips');
    }
};
