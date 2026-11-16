<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ComplaintMessage extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'complaint_id',
        'author_type',
        'author_id',
        'author_name',
        'is_admin',
        'body',
    ];

    protected $casts = [
        'is_admin' => 'boolean',
    ];

    public function complaint()
    {
        return $this->belongsTo(Complaint::class);
    }
}
