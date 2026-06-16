<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('complaint_events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('complaint_id')->constrained()->cascadeOnDelete();

            // Tipos: created, status_change, dispute_opened, dispute_resolved
            $table->string('type', 40);

            // Para status_change
            $table->unsignedInteger('from_status')->nullable();
            $table->unsignedInteger('to_status')->nullable();

            // Quem disparou: user | municipality | admin | system
            $table->string('actor_type', 20);
            $table->unsignedBigInteger('actor_id')->nullable();
            $table->string('actor_name')->nullable();

            // Texto livre (motivo / contexto)
            $table->string('note')->nullable();

            $table->timestamps();

            $table->index(['complaint_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('complaint_events');
    }
};
