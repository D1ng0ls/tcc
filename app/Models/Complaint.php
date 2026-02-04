<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Complaint extends Model
{
    protected $table = 'complaints';

    protected $fillable = [
        'title',
        'description',
        'address',
        'user_id',
        'department_id',
        'municipality_id',
        'neighborhood_id',
        'status_id',
        'district',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function neighborhood()
    {
        return $this->belongsTo(Neighborhood::class);
    }

    public function department()
    {
        return $this->belongsTo(Department::class);
    }

    public function status()
    {
        return $this->belongsTo(Status::class);
    }

    public function municipality()
    {
        return $this->belongsTo(Municipality::class);
    }

    public function archives()
    {
        return $this->hasMany(Archive::class);
    }
}
