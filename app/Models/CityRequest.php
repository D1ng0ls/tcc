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
    ];

    protected $casts = [
        'status' => RequestEnum::class,
    ];

    protected $attributes = [
        'status' => RequestEnum::PENDING,
    ];

    public function city()
    {
        return $this->belongsTo(City::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
