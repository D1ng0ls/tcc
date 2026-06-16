<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ComplaintEvent extends Model
{
    protected $fillable = [
        'complaint_id',
        'type',
        'from_status',
        'to_status',
        'actor_type',
        'actor_id',
        'actor_name',
        'note',
    ];

    public function complaint()
    {
        return $this->belongsTo(Complaint::class);
    }
}
