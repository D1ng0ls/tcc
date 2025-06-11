<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class City extends Model
{
    protected $table = 'cities';

    protected $fillable = [
        'nome',
        'estado_id',
    ];

    public function state()
    {
        return $this->belongsTo(State::class);
    }

    public function neighborhoods()
    {
        return $this->hasMany(Neighborhood::class);
    }

    public function municipalities()
    {
        return $this->hasMany(Municipality::class);
    }

    public function users()
    {
        return $this->hasMany(User::class);
    }

    public function complaints()
    {
        return $this->hasManyThrough(
            Complaint::class,
            Department::class,
            'prefeitura_id',
            'departamento_id',
            'prefeitura_id',
            'id'
        );
    }
}
