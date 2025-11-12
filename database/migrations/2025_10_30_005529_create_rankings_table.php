<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('rankings', function (Blueprint $table) {
            $table->id();
            $table->integer('city_id');
            $table->integer('state_id');
            $table->integer('rank')->nullable();
            $table->integer('rank_state')->nullable();
            $table->integer('total_complaints');
            $table->integer('solved_complaints');
            $table->integer('resolution')->nullable();
            $table->integer('month');
            $table->integer('year');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('rankings');
    }
};
