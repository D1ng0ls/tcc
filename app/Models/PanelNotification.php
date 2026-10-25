<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/** Aviso no dashboard do painel da prefeitura (master ou usuário de departamento). */
class PanelNotification extends Model
{
    protected $fillable = ['municipality_id', 'department_user_id', 'type', 'title', 'body', 'link', 'read_at'];

    protected $casts = [
        'read_at' => 'datetime',
    ];
}
