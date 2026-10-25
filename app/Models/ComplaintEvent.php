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
        'member_id',
        'member_name',
        'member_department_id',
        'member_department_name',
    ];

    public function complaint()
    {
        return $this->belongsTo(Complaint::class);
    }
}
