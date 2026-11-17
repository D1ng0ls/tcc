<?php

use App\Models\ComplaintMessage;
use App\Models\User;
use App\RequestEnum;
use App\Support\Documents;
use App\Support\NeighborhoodName;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

beforeEach(fn () => seedComplaintStatuses());

it('troca de senha do cidadão invalida o "Lembrar-me" dos outros aparelhos', function () {
    $user = User::factory()->create(['password' => Hash::make('Senha@Antiga1'), 'remember_token' => 'token-antigo']);

    $this->actingAs($user, 'web')
        ->put(route('password.update'), [
            'current_password' => 'Senha@Antiga1',
            'password' => 'Senha@Nova2026',
            'password_confirmation' => 'Senha@Nova2026',
        ])
        ->assertSessionHasNoErrors();

    expect($user->fresh()->remember_token)->not->toBe('token-antigo');
});

it('limita as tentativas de login do cidadão por IP, mesmo trocando o e-mail', function () {
    config(['auth.login_throttle.max_attempts' => 3]);

    foreach (range(1, 3) as $i) {
        $this->post(route('login'), ['email' => "x{$i}@exemplo.com", 'password' => 'errada']);
    }

    $this->post(route('login'), ['email' => 'outro@exemplo.com', 'password' => 'errada']);
    expect(session('errors')->first('email'))->toContain('Muitas tentativas');
});

it('recusa CPF inválido no cadastro', function () {
    $city = cityWithMunicipality('Birigui')['city'];

    $this->post(route('register'), [
        'name' => 'Teste', 'email' => 'teste@exemplo.com', 'password' => 'Senha@2026', 'password_confirmation' => 'Senha@2026',
        'cpf' => '123.456.789-01', 'birth_date' => '2000-01-01', 'city_id' => $city->id, 'address' => 'Rua A, 1', 'consent' => '1',
    ])->assertSessionHasErrors('cpf');
});

it('anonimiza os dados pessoais quando o admin exclui a conta', function () {
    ['outros' => $outros] = cityWithMunicipality('Birigui');
    $admin = User::factory()->create(['role' => 'admin']);
    $citizen = User::factory()->create(['name' => 'Maria Teste', 'email' => 'maria@exemplo.com', 'address' => 'Rua A, 1']);
    $complaint = makeComplaint($citizen, $outros);
    ComplaintMessage::create([
        'complaint_id' => $complaint->id, 'author_type' => 'user', 'author_id' => $citizen->id,
        'author_name' => 'Maria Teste', 'is_admin' => false, 'body' => 'Olá',
    ]);

    $this->actingAs($admin, 'web')->delete(route('admin.users.destroy', $citizen))->assertRedirect();

    $gone = User::withTrashed()->find($citizen->id);
    expect($gone->trashed())->toBeTrue();
    expect($gone->name)->toBe('Usuário removido');
    expect($gone->email)->not->toContain('maria');
    expect($gone->cpf)->toStartWith('ANON-');
    expect($gone->address)->toBeNull();
    expect(ComplaintMessage::where('author_id', $citizen->id)->value('author_name'))->toBe('Usuário removido');
    expect($complaint->fresh())->not->toBeNull();
});

it('não aprova solicitação quando a cidade já tem prefeitura ativa e registra quem decidiu', function () {
    ['city' => $city] = cityWithMunicipality('Birigui');
    $admin = User::factory()->create(['role' => 'admin']);
    $citizen = User::factory()->create();
    $request = \App\Models\CityRequest::create(['user_id' => $citizen->id, 'city_id' => $city->id, 'requester' => 'Ana', 'email' => 'ana@birigui.sp.gov.br']);

    $this->actingAs($admin, 'web')->patch(route('admin.solicitations.approve', $request))->assertSessionHasErrors('general');
    expect($request->fresh()->status)->toBe(RequestEnum::PENDING);

    $this->actingAs($admin, 'web')->patch(route('admin.solicitations.reject', $request))->assertSessionHas('success');
    $fresh = $request->fresh();
    expect($fresh->status)->toBe(RequestEnum::REJECTED);
    expect($fresh->decided_by)->toBe($admin->id);
    expect($fresh->decided_at)->not->toBeNull();

    // Já analisada: não pode ser decidida de novo.
    $this->actingAs($admin, 'web')->patch(route('admin.solicitations.reject', $request))->assertSessionHasErrors('general');
});

it('admin filtra reclamações por nome de departamento e cidadão por cidade', function () {
    ['outros' => $outrosBirigui, 'city' => $birigui] = cityWithMunicipality('Birigui');
    ['outros' => $outrosAracatuba, 'municipality' => $aracatubaMuni] = cityWithMunicipality('Araçatuba');
    $saude = \App\Models\Department::create(['name' => 'Saúde', 'municipality_id' => $aracatubaMuni->id]);
    $admin = User::factory()->create(['role' => 'admin']);
    $citizen = User::factory()->create();
    $a = makeComplaint($citizen, $outrosBirigui);
    $b = makeComplaint($citizen, $saude);

    $this->actingAs($admin, 'web')
        ->get(route('admin.complaints.index', ['department_name' => 'Saúde']))
        ->assertInertia(fn (Assert $page) => $page->has('complaints.data', 1)->where('complaints.data.0.id', $b->id));

    $this->actingAs($citizen, 'web')
        ->get(route('complaints.index', ['city_id' => $birigui->id]))
        ->assertInertia(fn (Assert $page) => $page->has('complaints.data', 1)->where('complaints.data.0.id', $a->id)->has('cities', 2));
});

it('recusa bairro oficial de outra cidade no registro da reclamação', function () {
    ['city' => $birigui, 'outros' => $outros] = cityWithMunicipality('Birigui');
    ['city' => $aracatuba] = cityWithMunicipality('Araçatuba');
    $bairroAlheio = \App\Models\Neighborhood::create(['name' => 'Centro', 'city_id' => $aracatuba->id]);
    $citizen = User::factory()->create();

    $this->actingAs($citizen, 'web')->post(route('complaints.store'), [
        'title' => 'Poste apagado', 'description' => 'Sem luz', 'department_id' => $outros->id,
        'state_id' => $birigui->state_id, 'city_id' => $birigui->id, 'address' => 'Rua A, 1',
        'neighborhood_id' => $bairroAlheio->id,
    ])->assertSessionHasErrors('neighborhood_id');
});

it('normaliza nomes de bairro e valida CPF e CNPJ', function () {
    expect(NeighborhoodName::normalize('  JARDIM   das   flores '))->toBe('Jardim das Flores');
    expect(NeighborhoodName::normalize('vila são joão ii'))->toBe('Vila São João II');
    expect(Documents::isValidCpf('529.982.247-25'))->toBeTrue();
    expect(Documents::isValidCpf('111.111.111-11'))->toBeFalse();
    expect(Documents::isValidCnpj('11.222.333/0001-81'))->toBeTrue();
    expect(Documents::isValidCnpj('11.222.333/0001-82'))->toBeFalse();
    expect(Documents::formatCpf('52998224725'))->toBe('529.982.247-25');
});
