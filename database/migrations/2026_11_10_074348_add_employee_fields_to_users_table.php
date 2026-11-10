<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('role', 20)->default('pegawai')->index()->after('password');
            $table->string('nip', 18)->nullable()->unique()->after('role');
            $table->string('jabatan', 120)->nullable()->after('nip');
            $table->string('golongan', 20)->nullable()->after('jabatan');
            $table->foreignId('unit_id')->nullable()->constrained()->nullOnDelete()->after('golongan');
            $table->string('no_hp', 20)->nullable()->after('unit_id');
            $table->string('ttd_path')->nullable()->after('no_hp');
            $table->boolean('is_active')->default(true)->after('ttd_path');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['unit_id']);
            $table->dropColumn(['role', 'nip', 'jabatan', 'golongan', 'unit_id', 'no_hp', 'ttd_path', 'is_active']);
        });
    }
};
