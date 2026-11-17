<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\RequestEnum;

class CityRequest extends Model
{
    protected $table = 'city_requests';

    protected $fillable = [
        'user_id',
        'city_id',
        'email',
        'requester',
        'status',
        'decided_by',
        'decided_at',
    ];

    protected $casts = [
        'status' => RequestEnum::class,
        'decided_at' => 'datetime',
    ];

    protected $attributes = [
        'status' => RequestEnum::PENDING,
    ];

    public function city()
    {
        return $this->belongsTo(City::class);
    }

    public function decider()
    {
        return $this->belongsTo(User::class, 'decided_by');
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
