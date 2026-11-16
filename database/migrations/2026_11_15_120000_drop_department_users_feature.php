<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Remove os usuários de departamento (acesso segmentado por departamento ficou como requisito
     * adiado, RA011). Em bancos onde a migration antiga chegou a rodar, apaga as tabelas e colunas
     * que ela criou; em instalações novas não há nada para remover.
     */
    public function up(): void
    {
        Schema::dropIfExists('panel_notifications');

        foreach (['complaint_events', 'complaint_messages'] as $tableName) {
            $columns = array_values(array_filter(
                ['member_id', 'member_name', 'member_department_id', 'member_department_name'],
                fn ($column) => Schema::hasColumn($tableName, $column)
            ));

            if ($columns) {
                Schema::table($tableName, fn (Blueprint $table) => $table->dropColumn($columns));
            }
        }

        Schema::dropIfExists('department_users');
    }

    public function down(): void
    {
        // Funcionalidade removida: não há o que recriar.
    }
};
