<?php

use App\Models\Municipality;
use App\Support\Notifications\MunicipalityResetPasswordNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Password;

uses(RefreshDatabase::class);

beforeEach(fn () => seedComplaintStatuses());

// Acesso ao painel da prefeitura: senha esquecida, desativação, troca de credenciais e login.

it('envia o link de redefinição de senha da prefeitura apontando para o painel', function () {
    Notification::fake();
    ['municipality' => $muni] = cityWithMunicipality('Birigui');

    $this->post(route('municipality.password.email'), ['email' => $muni->email])->assertSessionHas('status');

    Notification::assertSentTo($muni, MunicipalityResetPasswordNotification::class, function ($notification) use ($muni) {
        $url = $notification->toMail($muni)->actionUrl;

        return str_contains($url, 'cid.') && str_contains($url, '/reset-password/');
    });
});

it('redefine a senha da prefeitura pelo link', function () {
    ['municipality' => $muni] = cityWithMunicipality('Birigui');
    $token = Password::broker('municipalities')->createToken($muni);

    $this->post(route('municipality.password.store'), [
        'token' => $token,
        'email' => $muni->email,
        'password' => 'NovaSenha@2026',
        'password_confirmation' => 'NovaSenha@2026',
    ])->assertRedirect(route('municipality.login'));

    expect(Hash::check('NovaSenha@2026', $muni->fresh()->password))->toBeTrue();
});

it('desconecta a prefeitura desativada no próximo acesso', function () {
    ['municipality' => $muni] = cityWithMunicipality('Birigui');

    $this->actingAs($muni, 'municipality')->get(route('municipality.dashboard'))->assertOk();

    $muni->update(['active' => false]);

    $this->get(route('municipality.dashboard'))
        ->assertRedirect(route('municipality.login'))
        ->assertSessionHasErrors('email');
    $this->assertGuest('municipality');
});

it('trocar só o e-mail não encerra a sessão; trocar a senha encerra', function () {
    ['municipality' => $muni] = cityWithMunicipality('Birigui');
    $admin = \App\Models\User::factory()->create(['role' => 'admin']);

    $key = \App\Http\Middleware\AuthenticateMunicipalitySession::SESSION_KEY;
    $oldHash = $muni->password;
    $token = $muni->fresh()->remember_token;

    $this->actingAs($admin, 'web')
        ->patch(route('admin.municipalities.update', $muni), ['email' => 'novo@birigui.sp.gov.br'])
        ->assertSessionHas('success', 'E-mail da prefeitura atualizado.');
    expect($muni->fresh()->remember_token)->toBe($token);
    // Sessão aberta antes da troca (com o hash da senha guardado) continua válida.
    $this->actingAs($muni->fresh(), 'municipality')->withSession([$key => $oldHash])
        ->get(route('municipality.dashboard'))->assertOk();

    $this->actingAs($admin, 'web')
        ->patch(route('admin.municipalities.update', $muni), ['email' => 'novo@birigui.sp.gov.br', 'password' => 'Outra@Senha2026'])
        ->assertSessionHas('success');
    expect($muni->fresh()->remember_token)->not->toBe($token);
    // Agora a sessão antiga (hash anterior) cai.
    $this->actingAs($muni->fresh(), 'municipality')->withSession([$key => $oldHash])
        ->get(route('municipality.dashboard'))->assertRedirect(route('municipality.login'));
});

it('login da prefeitura usa mensagem genérica e só avisa da desativação com a senha certa', function () {
    ['municipality' => $muni] = cityWithMunicipality('Birigui');

    $this->post(route('municipality.login.post'), ['email' => 'nao-existe@x.gov.br', 'password' => 'qualquer'])
        ->assertSessionHasErrors(['email' => 'E-mail ou senha incorretos.']);
    $this->post(route('municipality.login.post'), ['email' => $muni->email, 'password' => 'errada'])
        ->assertSessionHasErrors(['email' => 'E-mail ou senha incorretos.']);

    $muni->update(['active' => false]);
    $this->post(route('municipality.login.post'), ['email' => $muni->email, 'password' => 'errada'])
        ->assertSessionHasErrors(['email' => 'E-mail ou senha incorretos.']);
    $this->post(route('municipality.login.post'), ['email' => $muni->email, 'password' => 'Senha@1234'])
        ->assertSessionHasErrors(['email' => 'Essa conta está desativada.']);
});

it('limita as tentativas de login da prefeitura por IP, mesmo trocando o e-mail', function () {
    config(['auth.login_throttle.max_attempts' => 3]);

    foreach (range(1, 3) as $i) {
        $this->post(route('municipality.login.post'), ['email' => "x{$i}@x.gov.br", 'password' => 'errada']);
    }

    $response = $this->post(route('municipality.login.post'), ['email' => 'outro@x.gov.br', 'password' => 'errada']);
    expect(session('errors')->first('email'))->toContain('Muitas tentativas');
});

it('logout da prefeitura volta para o login do painel', function () {
    ['municipality' => $muni] = cityWithMunicipality('Birigui');

    $this->actingAs($muni, 'municipality')
        ->post(route('municipality.logout'))
        ->assertRedirect(route('municipality.login'));
});

it('valida o CNPJ da prefeitura no servidor', function () {
    ['municipality' => $muni] = cityWithMunicipality('Birigui');

    $this->actingAs($muni, 'municipality')
        ->put(route('municipality.settings.update'), ['name' => $muni->name, 'email' => $muni->email, 'cnpj' => '11.111.111/1111-11'])
        ->assertSessionHasErrors('cnpj');

    $this->actingAs($muni, 'municipality')
        ->put(route('municipality.settings.update'), ['name' => $muni->name, 'email' => $muni->email, 'cnpj' => '11222333000181'])
        ->assertSessionHasNoErrors();
    expect($muni->fresh()->cnpj)->toBe('11.222.333/0001-81');
});
