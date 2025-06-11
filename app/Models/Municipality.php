<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Municipality extends Model
{
    protected $table = 'municipalities';

    protected $fillable = [
        'name',
        'email',
        'senha',
        'cnpj',
        'photo_url',
        'banner_url',
        'city_id',
    ];

    public function city()
    {
        return $this->belongsTo(City::class);
    }

    public function departaments()
    {
        return $this->hasMany(Department::class);
    }
}
