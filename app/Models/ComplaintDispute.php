<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ComplaintDispute extends Model
{
    protected $fillable = [
        'complaint_id',
        'user_id',
        'municipality_id',
        'reason',
        'status',
        'resolved_by',
        'resolved_at',
    ];

    protected $casts = [
        'resolved_at' => 'datetime',
    ];

    public function complaint()
    {
        return $this->belongsTo(Complaint::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function municipality()
    {
        return $this->belongsTo(Municipality::class);
    }

    public function resolvedBy()
    {
        return $this->belongsTo(User::class, 'resolved_by');
    }
}
