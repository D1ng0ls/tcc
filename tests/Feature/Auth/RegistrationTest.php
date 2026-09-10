<?php

use App\Models\City;
use App\Models\State;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

test('registration screen can be rendered', function () {
    $response = $this->get('/register');

    $response->assertStatus(200);
});

test('new users can register', function () {
    $state = State::create(['name' => 'São Paulo', 'uf' => 'SP']);
    $city = City::create(['name' => 'Birigui', 'state_id' => $state->id]);

    $response = $this->post('/register', [
        'name' => 'Test User',
        'email' => 'test@example.com',
        'password' => 'Senha@1234',
        'password_confirmation' => 'Senha@1234',
        'cpf' => '123.456.789-01',
        'birth_date' => '2000-01-01',
        'city_id' => $city->id,
        'address' => 'Rua Teste, 100',
        'consent' => true,
    ]);

    $this->assertAuthenticated();
    $response->assertRedirect(route('dashboard', absolute: false));
});
