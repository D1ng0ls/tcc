<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::table('complaints', function (Blueprint $table) {
            $table->index(['department_id', 'status_id'], 'idx_dept_status');
        });

        Schema::table('rankings', function (Blueprint $table) {
            $table->unique(['city_id', 'month', 'year'], 'unq_city_month_year');
            $table->index(['month', 'year', 'state_id', 'resolution'], 'idx_ranking_order');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('complaints', function (Blueprint $table) {
            $table->dropIndex('idx_dept_status');
        });

        Schema::table('rankings', function (Blueprint $table) {
            $table->dropUnique('unq_city_month_year');
            $table->dropIndex('idx_ranking_order');
        });
    }
};
