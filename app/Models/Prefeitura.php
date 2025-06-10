<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Prefeitura extends Model
{
    protected $table = 'prefeituras';

    protected $fillable = [
        'nome',
        'email',
        'senha',
        'cnpj',
        'foto_url',
        'banner_url',
        'cidade_id',
    ];

    public function cidade()
    {
        return $this->belongsTo(Cidade::class);
    }

    public function departamentos()
    {
        return $this->hasMany(Departamento::class);
    }
}
