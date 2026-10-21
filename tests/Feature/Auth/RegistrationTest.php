<?php

use App\Models\City;
use App\Models\State;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Notification;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

function newCitizenPayload(int $cityId): array
{
    return [
        'name' => 'Test User',
        'email' => 'test@example.com',
        'password' => 'Senha@1234',
        'password_confirmation' => 'Senha@1234',
        'cpf' => '123.456.789-01',
        'birth_date' => '2000-01-01',
        'city_id' => $cityId,
        'address' => 'Rua Teste, 100',
        'consent' => true,
    ];
}

test('registration screen can be rendered', function () {
    $response = $this->get('/register');

    $response->assertStatus(200);
});

// Cap. 5 (TESTE): salva o usuário, envia o link de verificação e leva à tela "Verifique seu e-mail"
test('new users can register', function () {
    Notification::fake();
    $state = State::create(['name' => 'São Paulo', 'uf' => 'SP']);
    $city = City::create(['name' => 'Birigui', 'state_id' => $state->id]);

    $response = $this->post('/register', newCitizenPayload($city->id));

    $this->assertAuthenticated();
    $response->assertRedirect(route('verification.notice', absolute: false));

    $user = User::where('email', 'test@example.com')->sole();
    expect($user->hasVerifiedEmail())->toBeFalse();
    Notification::assertSentTo($user, VerifyEmail::class);
});

test('falha no envio do e-mail não impede o cadastro', function () {
    $state = State::create(['name' => 'São Paulo', 'uf' => 'SP']);
    $city = City::create(['name' => 'Birigui', 'state_id' => $state->id]);
    Event::listen(Registered::class, fn () => throw new RuntimeException('SMTP indisponível'));

    $response = $this->post('/register', newCitizenPayload($city->id));

    $this->assertAuthenticated();
    $response->assertRedirect(route('verification.notice', absolute: false))->assertSessionHas('error');
    expect(User::where('email', 'test@example.com')->exists())->toBeTrue();
});
