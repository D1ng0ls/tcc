<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('complaint_messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('complaint_id')->constrained()->cascadeOnDelete();

            // author polimórfico: 'user' (citizen/admin) ou 'municipality'
            $table->string('author_type', 32);
            $table->unsignedBigInteger('author_id');
            // snapshot do nome para sobreviver à exclusão da conta
            $table->string('author_name');
            // flag pra renderizar diferenciado no front
            $table->boolean('is_admin')->default(false);

            $table->text('body');

            $table->timestamps();
            $table->softDeletes();

            $table->index(['complaint_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('complaint_messages');
    }
};
