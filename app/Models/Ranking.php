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

    public function city()
    {
        return $this->belongsTo(City::class);
    }

    public function state()
    {
        return $this->belongsTo(State::class);
    }
}
