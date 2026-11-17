<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Marcador de novidade (RF060): a reclamação guarda quando houve a última novidade
     * (mudança de situação, mensagem, encaminhamento, contestação) e quando a prefeitura
     * a abriu pela última vez. Para o cidadão, a novidade vem das notificações não lidas
     * da própria reclamação (user_notifications.complaint_id).
     */
    public function up(): void
    {
        Schema::table('complaints', function (Blueprint $table) {
            $table->timestamp('last_activity_at')->nullable();
            $table->timestamp('municipality_seen_at')->nullable();
        });

        // Reclamações já existentes começam sem novidade pendente.
        DB::table('complaints')->update([
            'last_activity_at' => DB::raw('updated_at'),
            'municipality_seen_at' => now(),
        ]);

        Schema::table('user_notifications', function (Blueprint $table) {
            $table->foreignId('complaint_id')->nullable()->after('user_id')->constrained('complaints')->cascadeOnDelete();
            $table->index(['user_id', 'complaint_id', 'read_at']);
        });

        // Notificações antigas apontavam para a reclamação só pelo link (/complaints/show/{id}).
        DB::table('user_notifications')->whereNotNull('link')->orderBy('id')->each(function ($row) {
            if (preg_match('#/complaints/show/(\d+)#', $row->link, $m) && DB::table('complaints')->where('id', $m[1])->exists()) {
                DB::table('user_notifications')->where('id', $row->id)->update(['complaint_id' => (int) $m[1]]);
            }
        });
    }

    public function down(): void
    {
        Schema::table('user_notifications', function (Blueprint $table) {
            $table->dropForeign(['complaint_id']);
            $table->dropIndex(['user_id', 'complaint_id', 'read_at']);
            $table->dropColumn('complaint_id');
        });

        Schema::table('complaints', function (Blueprint $table) {
            $table->dropColumn(['last_activity_at', 'municipality_seen_at']);
        });
    }
};
