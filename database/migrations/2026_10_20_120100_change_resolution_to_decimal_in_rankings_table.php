<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * O índice de resolução é calculado com duas casas (CalcResolutionHelper),
     * mas a coluna inteira arredondava 66,67 para 67 — gerando empates artificiais
     * no ranking e médias estaduais sobre valores já arredondados.
     */
    public function up(): void
    {
        Schema::table('rankings', function (Blueprint $table) {
            $table->decimal('resolution', 5, 2)->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('rankings', function (Blueprint $table) {
            $table->integer('resolution')->nullable()->change();
        });
    }
};
