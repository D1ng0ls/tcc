<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Departamento extends Model
{
    protected $table = 'departamentos';

    protected $fillable = [
        'nome',
        'prefeitura_id',
    ];

    public function prefeitura()
    {
        return $this->belongsTo(Prefeitura::class);
    }

    public function reclamacoes()
    {
        return $this->belongsToMany(Reclamacao::class);
    }
}
