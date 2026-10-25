<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;

/**
 * Pessoa de um departamento da prefeitura. Entra pelo mesmo login do painel (guard
 * "department") e atende só as reclamações do próprio departamento.
 */
class DepartmentUser extends Authenticatable
{
    protected $table = 'department_users';

    protected $fillable = [
        'municipality_id',
        'department_id',
        'name',
        'email',
        'password',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'password' => 'hashed',
        ];
    }

    public function municipality()
    {
        return $this->belongsTo(Municipality::class);
    }

    public function department()
    {
        return $this->belongsTo(Department::class);
    }
}
