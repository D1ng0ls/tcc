<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class Municipality extends Authenticatable
{
    use HasFactory, Notifiable;

    protected $table = 'municipalities';

    protected $fillable = [
        'name',
        'email',
        'password',
        'cnpj',
        'photo_url',
        'active',
        'city_id',
    ];

    protected $hidden = [
        'password',
    ];

    public function city()
    {
        return $this->belongsTo(City::class);
    }

    public function departments()
    {
        return $this->hasMany(Department::class);
    }
}
