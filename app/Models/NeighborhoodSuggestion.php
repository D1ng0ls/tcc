<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class NeighborhoodSuggestion extends Model
{
    protected $fillable = [
        'city_id',
        'name',
        'status',
        'hits',
        'approved_neighborhood_id',
        'resolved_by_municipality_id',
        'resolved_at',
    ];

    protected $casts = [
        'resolved_at' => 'datetime',
    ];

    public function city()
    {
        return $this->belongsTo(City::class);
    }
}
