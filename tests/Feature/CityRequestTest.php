<?php

use App\Models\City;
use App\Models\CityRequest;
use App\Models\Municipality;
use App\Models\State;
use App\Models\User;
use App\RequestEnum;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;

uses(RefreshDatabase::class);

/**
 * Cidade com prefeitura pré-cadastrada (inativa, como vem do seeder) ou já ativa.
 */
function cityForSolicitation(string $name, bool $municipalityActive = false): City
{
    $state = State::firstOrCreate(['uf' => 'SP'], ['name' => 'São Paulo']);
    $city = City::create(['name' => $name, 'state_id' => $state->id]);
    Municipality::create([
        'name' => $name, 'email' => strtolower($name).'-sp@mail.com', 'password' => Hash::make('x'),
        'photo_url' => 'a.png', 'active' => $municipalityActive, 'city_id' => $city->id,
    ]);

    return $city;
}

function solicitationPayload(City $city, array $override = []): array
{
    return array_merge([
        'city_id' => $city->id,
        'requester' => 'Fulano de Tal',
        'email' => 'gestor@prefeitura.sp.gov.br',
    ], $override);
}

// RF015 — a solicitação de gestor sempre entra na fila como pendente
it('grava só os campos validados: a solicitação nasce pendente mesmo se o POST trouxer status', function () {
    $city = cityForSolicitation('Birigui');
    $cidadao = User::factory()->create();

    $this->actingAs($cidadao)->post(route('solicitation-form.store'), solicitationPayload($city, [
        'status' => 'approved',
        'user_id' => 999,
    ]))->assertRedirect();

    $solicitacao = CityRequest::sole();
    expect($solicitacao->status)->toBe(RequestEnum::PENDING);
    expect($solicitacao->user_id)->toBe($cidadao->id);
});

// UC008 — fluxo alternativo 1: já existe solicitação pendente para o mesmo par (cidadão, prefeitura)
it('não aceita segunda solicitação pendente do mesmo cidadão para a mesma cidade', function () {
    $city = cityForSolicitation('Birigui');
    $cidadao = User::factory()->create();

    $this->actingAs($cidadao)->post(route('solicitation-form.store'), solicitationPayload($city))->assertSessionHasNoErrors();
    $this->actingAs($cidadao)->post(route('solicitation-form.store'), solicitationPayload($city))->assertSessionHasErrors('city_id');

    expect(CityRequest::count())->toBe(1);
});

it('aceita nova solicitação depois que a anterior foi decidida pelo admin', function () {
    $city = cityForSolicitation('Birigui');
    $cidadao = User::factory()->create();
    CityRequest::create(solicitationPayload($city, ['user_id' => $cidadao->id, 'status' => RequestEnum::REJECTED]));

    $this->actingAs($cidadao)->post(route('solicitation-form.store'), solicitationPayload($city))->assertSessionHasNoErrors();

    expect(CityRequest::where('status', RequestEnum::PENDING->value)->count())->toBe(1);
});

// A prefeitura já ativa tem conta institucional gerida pelo administrador
it('não aceita solicitação para cidade cuja prefeitura já está ativa', function () {
    $city = cityForSolicitation('Birigui', municipalityActive: true);

    $this->actingAs(User::factory()->create())
        ->post(route('solicitation-form.store'), solicitationPayload($city))
        ->assertSessionHasErrors('city_id');

    expect(CityRequest::count())->toBe(0);
});
