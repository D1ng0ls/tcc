<?php

use App\Models\City;
use App\Models\State;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

function registrationPayload(array $override = []): array
{
    return array_merge([
        'name' => 'Fulano de Tal',
        'email' => 'fulano@example.com',
        'password' => 'Senha@1234',
        'password_confirmation' => 'Senha@1234',
        'cpf' => '123.456.789-01',
        'birth_date' => '2000-01-01',
        'address' => 'Rua A, 100',
        'consent' => true,
    ], $override);
}

// RF007 — consentimento LGPD é obrigatório e é registrado
it('exige o consentimento LGPD no cadastro', function () {
    $state = State::create(['name' => 'São Paulo', 'uf' => 'SP']);
    $city = City::create(['name' => 'Birigui', 'state_id' => $state->id]);

    $this->post('/register', registrationPayload(['city_id' => $city->id, 'consent' => false]))
        ->assertSessionHasErrors('consent');

    expect(User::where('email', 'fulano@example.com')->exists())->toBeFalse();
});

it('registra o timestamp de consentimento quando aceito', function () {
    $state = State::create(['name' => 'São Paulo', 'uf' => 'SP']);
    $city = City::create(['name' => 'Birigui', 'state_id' => $state->id]);

    $this->post('/register', registrationPayload(['city_id' => $city->id]))->assertRedirect();

    $user = User::where('email', 'fulano@example.com')->first();
    expect($user)->not->toBeNull();
    expect($user->consent_at)->not->toBeNull();
});

// RF021 — admin exclui cidadão; não pode excluir admin
it('permite ao administrador excluir a conta de um cidadão', function () {
    $admin = User::factory()->create(['cpf' => '00000000000', 'birth_date' => '1990-01-01', 'role' => 'admin']);
    $citizen = User::factory()->create(['cpf' => '11111111111', 'birth_date' => '1995-05-05', 'role' => 'user']);

    $this->actingAs($admin)->delete(route('admin.users.destroy', $citizen))->assertRedirect();

    expect(User::find($citizen->id))->toBeNull();          // soft-deleted → fora das queries padrão
    expect(User::withTrashed()->find($citizen->id))->not->toBeNull();
});

it('não permite excluir a conta de um administrador', function () {
    $admin = User::factory()->create(['cpf' => '00000000000', 'birth_date' => '1990-01-01', 'role' => 'admin']);
    $other = User::factory()->create(['cpf' => '22222222222', 'birth_date' => '1990-02-02', 'role' => 'admin']);

    $this->actingAs($admin)->delete(route('admin.users.destroy', $other))->assertForbidden();

    expect(User::find($other->id))->not->toBeNull();
});
