<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('neighborhood_suggestions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('city_id')->constrained()->cascadeOnDelete();
            $table->string('name');

            // pending | approved | ignored
            $table->string('status', 20)->default('pending');

            // quantas complaints já apontaram para esse "district" livre
            $table->unsignedInteger('hits')->default(1);

            $table->foreignId('approved_neighborhood_id')->nullable()->constrained('neighborhoods')->nullOnDelete();
            $table->foreignId('resolved_by_municipality_id')->nullable()->constrained('municipalities')->nullOnDelete();
            $table->timestamp('resolved_at')->nullable();

            $table->timestamps();

            $table->unique(['city_id', 'name'], 'neighborhood_suggestion_unique');
            $table->index(['city_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('neighborhood_suggestions');
    }
};
