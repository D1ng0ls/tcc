<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Status extends Model
{
    protected $table = 'statuses';

    protected $fillable = [
        'name',
        'type',
    ];

    public function complaints()
    {
        return $this->hasMany(Complaint::class);
    }

    /**
     * Quem pode aplicar esta situação (Figuras 2 e 4: "tipo (quem pode aplicá-lo)"):
     * 'municipality' para as situações do atendimento e 'user' para a avaliação do cidadão.
     */
    public function podeSerAplicadoPor(string $papel): bool
    {
        return $this->type === $papel;
    }

    /** Atalho usado pela política de acesso: a situação $statusId pode ser aplicada por $papel? */
    public static function aplicavelPor(int $statusId, string $papel): bool
    {
        return (bool) static::find($statusId)?->podeSerAplicadoPor($papel);
    }
}
