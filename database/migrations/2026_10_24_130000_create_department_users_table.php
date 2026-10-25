<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Usuários de departamento: pessoas da prefeitura que entram no painel e atendem só as
     * reclamações do próprio departamento. O login da prefeitura continua sendo o usuário master.
     */
    public function up(): void
    {
        Schema::create('department_users', function (Blueprint $table) {
            $table->id();
            $table->foreignId('municipality_id')->constrained('municipalities')->cascadeOnDelete();
            $table->foreignId('department_id')->constrained('departments')->restrictOnDelete();
            $table->string('name');
            $table->string('email')->unique();
            $table->string('password');
            $table->rememberToken();
            $table->timestamps();
        });

        // Quem, dentro da prefeitura, fez a ação. O departamento é público; o nome da pessoa
        // só aparece para o master, para o mesmo departamento e para o admin (ComplaintPrivacy).
        foreach (['complaint_events', 'complaint_messages'] as $tableName) {
            Schema::table($tableName, function (Blueprint $table) {
                $table->unsignedBigInteger('member_id')->nullable();
                $table->string('member_name')->nullable();
                $table->unsignedBigInteger('member_department_id')->nullable();
                $table->string('member_department_name')->nullable();
            });
        }

        // Avisos do painel da prefeitura (dashboard): para um usuário de departamento ou,
        // com department_user_id nulo, para o master.
        Schema::create('panel_notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('municipality_id')->constrained('municipalities')->cascadeOnDelete();
            $table->foreignId('department_user_id')->nullable()->constrained('department_users')->cascadeOnDelete();
            $table->string('type');
            $table->string('title');
            $table->string('body')->nullable();
            $table->string('link')->nullable();
            $table->timestamp('read_at')->nullable();
            $table->timestamps();

            $table->index(['municipality_id', 'department_user_id', 'read_at'], 'panel_notifications_owner_read_index');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('panel_notifications');

        foreach (['complaint_events', 'complaint_messages'] as $tableName) {
            Schema::table($tableName, function (Blueprint $table) {
                $table->dropColumn(['member_id', 'member_name', 'member_department_id', 'member_department_name']);
            });
        }

        Schema::dropIfExists('department_users');
    }
};
