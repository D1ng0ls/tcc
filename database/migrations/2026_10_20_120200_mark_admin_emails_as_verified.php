<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Com a verificação de e-mail ativa, o painel /admin passa a exigir e-mail
     * verificado. As contas de administrador não passam pelo cadastro (vêm do
     * seeder), então são marcadas como verificadas para não ficarem bloqueadas.
     * Contas de cidadão não são tocadas: elas confirmam pelo link enviado.
     */
    public function up(): void
    {
        DB::table('users')
            ->where('role', 'admin')
            ->whereNull('email_verified_at')
            ->update(['email_verified_at' => now()]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
    }
};
