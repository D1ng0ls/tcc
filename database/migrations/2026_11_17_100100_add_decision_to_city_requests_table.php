<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Quem decidiu a solicitação de acesso e quando (UC019; "data da decisão" no modelo de domínio).
     */
    public function up(): void
    {
        Schema::table('city_requests', function (Blueprint $table) {
            $table->foreignId('decided_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('decided_at')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('city_requests', function (Blueprint $table) {
            $table->dropForeign(['decided_by']);
            $table->dropColumn(['decided_by', 'decided_at']);
        });
    }
};
