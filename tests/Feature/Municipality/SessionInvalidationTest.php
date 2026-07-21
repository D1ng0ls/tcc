<?php

use App\Http\Middleware\AuthenticateMunicipalitySession;
use App\Models\City;
use App\Models\Municipality;
use App\Models\State;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

uses(RefreshDatabase::class);

function makeActiveMunicipality(): Municipality
{
    $state = State::create(['name' => 'São Paulo', 'uf' => 'SP']);
    $city = City::create(['name' => 'Birigui', 'state_id' => $state->id]);

    return Municipality::create([
        'name' => 'Prefeitura de Birigui', 'email' => 'pref@bir.gov',
        'password' => Hash::make('SenhaAntiga@1'), 'photo_url' => 'a.png',
        'active' => true, 'city_id' => $city->id,
    ]);
}

function requestWithSession(): Request
{
    $request = Request::create('/painel');
    $request->setLaravelSession(app('session.store'));

    return $request;
}

it('mantém a sessão da prefeitura enquanto o hash da senha bate', function () {
    $muni = makeActiveMunicipality();
    Auth::guard('municipality')->login($muni);

    $request = requestWithSession();
    $request->session()->put(AuthenticateMunicipalitySession::SESSION_KEY, $muni->getAuthPassword());

    $passed = false;
    (new AuthenticateMunicipalitySession())->handle($request, function () use (&$passed) {
        $passed = true;
        return response('ok');
    });

    expect($passed)->toBeTrue();
    expect(Auth::guard('municipality')->check())->toBeTrue();
});

it('encerra a sessão da prefeitura quando a senha muda (RF012/RF020)', function () {
    $muni = makeActiveMunicipality();
    Auth::guard('municipality')->login($muni);

    // Sessão de "outro dispositivo": guarda o hash ANTIGO.
    $request = requestWithSession();
    $request->session()->put(AuthenticateMunicipalitySession::SESSION_KEY, 'hash-antigo-diferente');

    // Simula a troca de senha (pela prefeitura ou pelo admin) — o hash atual muda.
    $muni->update(['password' => Hash::make('SenhaNova@2')]);

    $throwed = false;
    try {
        (new AuthenticateMunicipalitySession())->handle($request, fn () => response('ok'));
    } catch (HttpResponseException $e) {
        $throwed = true;
    }

    expect($throwed)->toBeTrue();                              // redirecionado para o login
    expect(Auth::guard('municipality')->check())->toBeFalse(); // sessão encerrada
});
