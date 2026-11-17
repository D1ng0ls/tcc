<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

/**
 * MustVerifyEmail: o cadastro envia um link de confirmação e as rotas com o
 * middleware 'verified' (dashboard, reclamações, admin) só liberam o acesso
 * depois que users.email_verified_at for preenchido.
 */
class User extends Authenticatable implements MustVerifyEmail
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $table = 'users';

    protected $fillable = [
        'name',
        'email',
        'password',
        'cpf',
        'birth_date',
        'address',
        'consent_at',
        'photo_url',
        'role',
        'city_id',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'consent_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function city()
    {
        return $this->belongsTo(City::class);
    }

    public function complaints()
    {
        return $this->hasMany(Complaint::class);
    }

    public function userNotifications()
    {
        return $this->hasMany(UserNotification::class)->orderByDesc('id');
    }

    /**
     * Exclusão de conta com anonimização (RNF006/LGPD): os dados pessoais são trocados por
     * valores que não identificam ninguém, a foto é apagada e a conta é removida (exclusão
     * lógica). As reclamações continuam públicas, sem autor identificável; o nome copiado
     * em mensagens e no histórico também é substituído.
     */
    public function anonymizeAndDelete(): void
    {
        $label = 'Usuário removido';

        \Illuminate\Support\Facades\DB::transaction(function () use ($label) {
            if ($this->photo_url && \Illuminate\Support\Str::startsWith($this->photo_url, '/storage/')) {
                \Illuminate\Support\Facades\Storage::disk('public')->delete(\Illuminate\Support\Str::after($this->photo_url, '/storage/'));
            }

            ComplaintMessage::where('author_type', 'user')->where('author_id', $this->id)->update(['author_name' => $label]);
            ComplaintEvent::where('actor_type', 'user')->where('actor_id', $this->id)->update(['actor_name' => $label]);
            $this->userNotifications()->delete();
            \Illuminate\Support\Facades\DB::table('sessions')->where('user_id', $this->id)->delete();

            $this->forceFill([
                'name' => $label,
                'email' => "removido-{$this->id}@anonimo.invalid",
                'cpf' => "ANON-{$this->id}",
                'birth_date' => '1900-01-01',
                'address' => null,
                'city_id' => null,
                'photo_url' => null,
                'email_verified_at' => null,
                'password' => \Illuminate\Support\Facades\Hash::make(\Illuminate\Support\Str::random(40)),
                'remember_token' => null,
            ])->save();

            $this->delete();
        });
    }
}
