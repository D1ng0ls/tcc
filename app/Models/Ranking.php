<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Ranking extends Model
{
    protected $table = 'rankings';

    protected $fillable = [
        'city_id',
        'state_id',
        'resolution',
        'month',
        'total_complaints',
        'solved_complaints',
        'year',
        'rank',
        'rank_state',
    ];

    // decimal(5,2) chega do PDO como string; o front espera número (ex.: 66.67).
    protected $casts = [
        'resolution' => 'float',
    ];

    public function city()
    {
        return $this->belongsTo(City::class);
    }

    public function state()
    {
        return $this->belongsTo(State::class);
    }
}
