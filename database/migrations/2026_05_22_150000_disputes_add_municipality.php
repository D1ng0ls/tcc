<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('complaint_disputes', function (Blueprint $table) {
            // Permite que a contestação seja aberta pela Municipality em vez do User.
            // Mantemos user_id nullable pra compatibilidade histórica.
            $table->foreignId('municipality_id')->nullable()->after('user_id')->constrained()->cascadeOnDelete();
        });

        // Torna user_id nullable também (uma contestação pode ser aberta apenas pela municipality)
        Schema::table('complaint_disputes', function (Blueprint $table) {
            $table->foreignId('user_id')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('complaint_disputes', function (Blueprint $table) {
            $table->dropForeign(['municipality_id']);
            $table->dropColumn('municipality_id');
            $table->foreignId('user_id')->nullable(false)->change();
        });
    }
};
