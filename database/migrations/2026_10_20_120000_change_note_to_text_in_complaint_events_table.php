<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * A justificativa da contestação aceita até 2000 caracteres e vira a nota do
     * evento na linha do tempo. Como varchar(255), o MySQL em modo strict recusava
     * o INSERT e a contestação falhava.
     */
    public function up(): void
    {
        Schema::table('complaint_events', function (Blueprint $table) {
            $table->text('note')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('complaint_events', function (Blueprint $table) {
            $table->string('note')->nullable()->change();
        });
    }
};
