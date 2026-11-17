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

    protected $casts = [
        'last_activity_at' => 'datetime',
        'municipality_seen_at' => 'datetime',
    ];

    /**
     * Registra uma novidade na reclamação (RF060). Quando quem agiu foi a própria prefeitura,
     * a novidade já conta como vista por ela. Não altera updated_at.
     */
    public function registerActivity(?string $actorType): void
    {
        $now = now();
        $data = ['last_activity_at' => $now];
        if ($actorType === 'municipality') {
            $data['municipality_seen_at'] = $now;
        }

        static::whereKey($this->getKey())->toBase()->update($data);
        $this->forceFill($data)->syncOriginalAttributes(array_keys($data));
    }

    /** A prefeitura abriu a reclamação: o marcador de novidade some para ela. */
    public function markSeenByMunicipality(): void
    {
        $now = now();
        static::whereKey($this->getKey())->toBase()->update(['municipality_seen_at' => $now]);
        $this->forceFill(['municipality_seen_at' => $now])->syncOriginalAttributes(['municipality_seen_at']);
    }

    /** Condição SQL "tem novidade para a prefeitura" (usada para destacar e ordenar a lista). */
    public static function municipalityNoveltySql(): string
    {
        return 'CASE WHEN complaints.last_activity_at IS NOT NULL AND (complaints.municipality_seen_at IS NULL '
            . 'OR complaints.last_activity_at > complaints.municipality_seen_at) THEN 1 ELSE 0 END';
    }

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

    public function messages()
    {
        return $this->hasMany(ComplaintMessage::class)->orderBy('created_at', 'asc');
    }

    public function events()
    {
        return $this->hasMany(ComplaintEvent::class)->orderBy('created_at', 'asc');
    }

    public function notifications()
    {
        return $this->hasMany(UserNotification::class);
    }

    public function disputes()
    {
        return $this->hasMany(ComplaintDispute::class);
    }

    public function latestDispute()
    {
        return $this->hasOne(ComplaintDispute::class)->latestOfMany();
    }
}
