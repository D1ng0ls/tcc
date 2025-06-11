<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Department extends Model
{
    protected $table = 'departments';

    protected $fillable = [
        'name',
        'prefeitura_id',
    ];

    public function municipality()
    {
        return $this->belongsTo(Municipality::class);
    }

    public function complaints()
    {
        return $this->belongsToMany(Complaint::class);
    }
}
