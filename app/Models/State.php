<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class State extends Model
{
    protected $table = 'states';

    protected $fillable = [
        'name',
        'uf',
    ];

    public function cities()
    {
        return $this->hasMany(City::class);
    }

    public function ranking()
    {
        return $this->hasOne(Ranking::class);
    }
}
