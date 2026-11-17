<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * O status "Fechado" nunca foi usado por nenhuma transição e não faz parte do ciclo de vida
     * documentado (cinco situações). Só é removido se nenhuma reclamação o referenciar.
     */
    public function up(): void
    {
        $closed = DB::table('statuses')->where('name', 'Fechado')->value('id');

        if ($closed && ! DB::table('complaints')->where('status_id', $closed)->exists()) {
            DB::table('statuses')->where('id', $closed)->delete();
        }
    }

    public function down(): void
    {
        DB::table('statuses')->insertOrIgnore(['name' => 'Fechado', 'type' => 'system', 'created_at' => now(), 'updated_at' => now()]);
    }
};
