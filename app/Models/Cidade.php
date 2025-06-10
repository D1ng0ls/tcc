<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Cidade extends Model
{
    protected $table = 'cidades';

    protected $fillable = [
        'nome',
        'estado_id',
    ];

    public function estado()
    {
        return $this->belongsTo(Estado::class);
    }

    public function prefeituras()
    {
        return $this->hasMany(Prefeitura::class);
    }

    public function usuarios()
    {
        return $this->hasMany(User::class);
    }

    public function reclamacoes()
    {
        return $this->hasManyThrough(
            Reclamacao::class,
            Departamento::class,
            'prefeitura_id',
            'departamento_id',
            'prefeitura_id',
            'id'
        );
    }
}
