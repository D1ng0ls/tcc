<?php

use App\Models\State;
use App\Models\User;
use Illuminate\Auth\Events\Verified;
use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\URL;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

test('email verification screen can be rendered', function () {
    $user = User::factory()->unverified()->create();

    $response = $this->actingAs($user)->get('/verify-email');

    $response->assertStatus(200);
});

test('email can be verified', function () {
    $user = User::factory()->unverified()->create();

    Event::fake();

    $verificationUrl = URL::temporarySignedRoute(
        'verification.verify',
        now()->addMinutes(60),
        ['id' => $user->id, 'hash' => sha1($user->email)]
    );

    $response = $this->actingAs($user)->get($verificationUrl);

    Event::assertDispatched(Verified::class);
    expect($user->fresh()->hasVerifiedEmail())->toBeTrue();
    $response->assertRedirect(route('dashboard', absolute: false).'?verified=1');
});

test('email is not verified with invalid hash', function () {
    $user = User::factory()->unverified()->create();

    $verificationUrl = URL::temporarySignedRoute(
        'verification.verify',
        now()->addMinutes(60),
        ['id' => $user->id, 'hash' => sha1('wrong-email')]
    );

    $this->actingAs($user)->get($verificationUrl);

    expect($user->fresh()->hasVerifiedEmail())->toBeFalse();
});

// UC009 — só cidadão com e-mail verificado registra e acompanha reclamações
test('usuário com e-mail não verificado é levado à tela de verificação', function () {
    $user = User::factory()->unverified()->create();

    $this->actingAs($user)->get('/dashboard')->assertRedirect(route('verification.notice', absolute: false));
    $this->actingAs($user)->get('/complaints/create')->assertRedirect(route('verification.notice', absolute: false));
    $this->actingAs($user)->post('/complaints/create', [])->assertRedirect(route('verification.notice', absolute: false));
});

test('o link de verificação pode ser reenviado', function () {
    Notification::fake();
    $user = User::factory()->unverified()->create();

    $this->actingAs($user)
        ->post(route('verification.send'))
        ->assertSessionHas('status', 'verification-link-sent');

    Notification::assertSentTo($user, VerifyEmail::class);
});

test('troca de e-mail no perfil envia novo link de verificação', function () {
    Notification::fake();
    $user = User::factory()->create();

    $this->actingAs($user)
        ->patch('/settings/profile', ['name' => $user->name, 'email' => 'novo-endereco@example.com'])
        ->assertSessionHasNoErrors();

    expect($user->fresh()->hasVerifiedEmail())->toBeFalse();
    Notification::assertSentTo($user->fresh(), VerifyEmail::class);
});

// UC008 exige apenas login: a solicitação de gestor funciona antes da verificação
test('cidadão ainda não verificado acessa o formulário de solicitação e a lista de cidades', function () {
    $user = User::factory()->unverified()->create();
    $state = State::create(['name' => 'São Paulo', 'uf' => 'SP']);

    $this->actingAs($user)->get(route('solicitation-form.index'))->assertOk();
    $this->actingAs($user)->getJson(route('cities.index', $state))->assertOk();
});

test('comando app:verify-email marca o e-mail como verificado', function () {
    $user = User::factory()->unverified()->create(['email' => 'cidadao@example.com']);

    $this->artisan('app:verify-email', ['email' => 'cidadao@example.com'])->assertSuccessful();

    expect($user->fresh()->hasVerifiedEmail())->toBeTrue();
});
