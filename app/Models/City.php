<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class City extends Model
{
    protected $table = 'cities';

    protected $fillable = [
        'name',
        'state_id',
        'slug',
    ];

    public function state()
    {
        return $this->belongsTo(State::class);
    }

    public function neighborhoods()
    {
        return $this->hasMany(Neighborhood::class);
    }

    public function municipality()
    {
        return $this->hasOne(Municipality::class);
    }

    public function users()
    {
        return $this->hasMany(User::class);
    }

    public function complaints()
    {
        return $this->hasManyThrough(Complaint::class, Neighborhood::class, 'city_id', 'neighborhood_id', 'id', 'id');
    }

    public function ranking()
    {
        return $this->hasMany(Ranking::class);
    }
}
