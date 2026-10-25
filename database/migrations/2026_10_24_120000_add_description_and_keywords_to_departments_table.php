<?php

use App\Support\DepartmentDefaults;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Texto do "?" de cada departamento e palavras-chave usadas para sugerir o departamento
     * na hora de abrir a reclamação. Os departamentos padrão já existentes recebem os textos.
     */
    public function up(): void
    {
        Schema::table('departments', function (Blueprint $table) {
            $table->text('description')->nullable()->after('name');
            $table->text('keywords')->nullable()->after('description');
        });

        foreach (DepartmentDefaults::DEPARTMENTS as $name => $texts) {
            DB::table('departments')
                ->where('is_default', true)
                ->where('name', $name)
                ->update([
                    'description' => $texts['description'],
                    'keywords' => $texts['keywords'],
                ]);
        }
    }

    public function down(): void
    {
        Schema::table('departments', function (Blueprint $table) {
            $table->dropColumn(['description', 'keywords']);
        });
    }
};
