<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Links de redefinição de senha da prefeitura (RF010/UC004). Tabela própria para não
     * misturar com os tokens dos cidadãos: o mesmo e-mail pode existir nas duas contas.
     */
    public function up(): void
    {
        Schema::create('municipality_password_reset_tokens', function (Blueprint $table) {
            $table->string('email')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('municipality_password_reset_tokens');
    }
};
