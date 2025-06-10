<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Reclamacao extends Model
{
    protected $table = 'reclamacaos';

    protected $fillable = [
        'titulo',
        'texto',
        'foto_url',
        'status',
        'usuario_id',
        'departamento_id',
    ];

    public function usuario()
    {
        return $this->belongsTo(User::class);
    }

    public function departamento()
    {
        return $this->belongsTo(Departamento::class);
    }
}
