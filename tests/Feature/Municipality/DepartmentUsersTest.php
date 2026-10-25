<?php

use App\ComplaintStatus;
use App\Models\ComplaintEvent;
use App\Models\Department;
use App\Models\DepartmentUser;
use App\Models\PanelNotification;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

beforeEach(fn () => seedComplaintStatuses());

/**
 * Troca quem está logado como se fosse outro navegador: sem isso a sessão guarda o hash da
 * senha de quem estava antes e o painel desloga (municipality.session).
 */
function asPanel($test, $actor, string $guard)
{
    $test->flushSession();
    app('auth')->forgetGuards();

    return $test->actingAs($actor, $guard);
}

/** Prefeitura com Infraestrutura e Saúde, e uma pessoa em cada um. */
function cityWithTeams(): array
{
    $setup = cityWithMunicipality('Birigui');
    $muni = $setup['municipality'];
    $infra = Department::create(['name' => 'Infraestrutura', 'municipality_id' => $muni->id, 'is_default' => true]);
    $saude = Department::create(['name' => 'Saúde', 'municipality_id' => $muni->id, 'is_default' => true]);

    $ana = DepartmentUser::create(['municipality_id' => $muni->id, 'department_id' => $infra->id, 'name' => 'Ana Infra', 'email' => 'ana@birigui.sp.gov.br', 'password' => 'Senha@1234']);
    $bia = DepartmentUser::create(['municipality_id' => $muni->id, 'department_id' => $saude->id, 'name' => 'Bia Saúde', 'email' => 'bia@birigui.sp.gov.br', 'password' => 'Senha@1234']);

    return [...$setup, 'infra' => $infra, 'saude' => $saude, 'ana' => $ana, 'bia' => $bia];
}

it('a pessoa do departamento entra pelo mesmo login da prefeitura', function () {
    ['ana' => $ana] = cityWithTeams();

    $this->post(route('municipality.login.post'), ['email' => $ana->email, 'password' => 'Senha@1234'])
        ->assertRedirect(route('municipality.dashboard'));

    $this->assertAuthenticatedAs($ana, 'department');
    $this->assertGuest('municipality');
});

it('não deixa entrar se a prefeitura estiver desativada', function () {
    ['ana' => $ana, 'municipality' => $muni] = cityWithTeams();
    $muni->update(['active' => false]);

    $this->post(route('municipality.login.post'), ['email' => $ana->email, 'password' => 'Senha@1234']);

    $this->assertGuest('department');
});

it('a pessoa de Infraestrutura vê só as reclamações de Infraestrutura', function () {
    ['ana' => $ana, 'infra' => $infra, 'saude' => $saude] = cityWithTeams();
    $author = User::factory()->create();
    $deInfra = makeComplaint($author, $infra, ['title' => 'Buraco']);
    $deSaude = makeComplaint($author, $saude, ['title' => 'Falta remédio']);

    $this->actingAs($ana, 'department')
        ->get(route('municipality.complaints.index'))
        ->assertInertia(fn (Assert $page) => $page
            ->has('complaints.data', 1)
            ->where('complaints.data.0.id', $deInfra->id)
            ->has('departments', 1));

    $this->actingAs($ana, 'department')->get(route('municipality.complaints.show', $deInfra))->assertOk();
    $this->actingAs($ana, 'department')->get(route('municipality.complaints.show', $deSaude))->assertForbidden();
    $this->actingAs($ana, 'department')->patch(route('municipality.complaints.start', $deSaude))->assertForbidden();

    expect($deSaude->fresh()->status_id)->toBe(ComplaintStatus::OPEN);
});

it('o master continua vendo as reclamações de todos os departamentos', function () {
    ['municipality' => $muni, 'infra' => $infra, 'saude' => $saude] = cityWithTeams();
    $author = User::factory()->create();
    makeComplaint($author, $infra);
    makeComplaint($author, $saude);

    $this->actingAs($muni, 'municipality')
        ->get(route('municipality.complaints.index'))
        ->assertInertia(fn (Assert $page) => $page->has('complaints.data', 2));
});

it('a pessoa do departamento atende e encaminha; a reclamação sai da lista dela', function () {
    ['ana' => $ana, 'bia' => $bia, 'infra' => $infra, 'saude' => $saude] = cityWithTeams();
    $complaint = makeComplaint(User::factory()->create(), $infra);

    $this->actingAs($ana, 'department')->patch(route('municipality.complaints.start', $complaint))->assertRedirect();
    expect($complaint->fresh()->status_id)->toBe(ComplaintStatus::IN_PROGRESS);

    $this->actingAs($ana, 'department')
        ->patch(route('municipality.complaints.department', $complaint), ['department_id' => $saude->id])
        ->assertRedirect(route('municipality.complaints.index'));

    expect($complaint->fresh()->department_id)->toBe($saude->id);
    $this->actingAs($ana, 'department')->get(route('municipality.complaints.show', $complaint))->assertForbidden();

    // Quem recebeu é avisado no dashboard.
    expect(PanelNotification::where('department_user_id', $bia->id)->where('type', 'complaint_forwarded')->exists())->toBeTrue();

    $event = ComplaintEvent::where('complaint_id', $complaint->id)->where('type', 'department_changed')->first();
    expect($event->member_name)->toBe('Ana Infra');
    expect($event->member_department_name)->toBe('Infraestrutura');
});

it('a pessoa do departamento não acessa bairros, departamentos, usuários nem os dados da prefeitura', function () {
    ['ana' => $ana] = cityWithTeams();

    foreach (['municipality.neighborhoods.index', 'municipality.departments.index', 'municipality.users.index', 'municipality.settings.edit'] as $route) {
        $this->actingAs($ana, 'department')->get(route($route))->assertForbidden();
    }
});

it('o master cadastra, edita e remove pessoas dos departamentos', function () {
    ['municipality' => $muni, 'infra' => $infra, 'saude' => $saude] = cityWithTeams();

    $this->actingAs($muni, 'municipality')
        ->post(route('municipality.users.store'), [
            'name' => 'Caio', 'email' => 'caio@birigui.sp.gov.br', 'department_id' => $infra->id, 'password' => 'Inicial@123',
        ])
        ->assertSessionHasNoErrors();

    $caio = DepartmentUser::where('email', 'caio@birigui.sp.gov.br')->first();
    expect($caio->department_id)->toBe($infra->id);
    expect(\Illuminate\Support\Facades\Hash::check('Inicial@123', $caio->password))->toBeTrue();

    $this->actingAs($muni, 'municipality')
        ->patch(route('municipality.users.update', $caio), ['name' => 'Caio Lima', 'email' => $caio->email, 'department_id' => $saude->id, 'password' => ''])
        ->assertSessionHasNoErrors();
    expect($caio->fresh()->department_id)->toBe($saude->id);
    expect(\Illuminate\Support\Facades\Hash::check('Inicial@123', $caio->fresh()->password))->toBeTrue();

    $this->actingAs($muni, 'municipality')->delete(route('municipality.users.destroy', $caio))->assertRedirect();
    expect(DepartmentUser::find($caio->id))->toBeNull();
});

it('não cadastra pessoa em departamento de outra prefeitura nem mexe em pessoa de outra prefeitura', function () {
    ['municipality' => $birigui, 'ana' => $ana] = cityWithTeams();
    ['municipality' => $aracatuba, 'outros' => $outrosAlheio] = cityWithMunicipality('Araçatuba');

    $this->actingAs($birigui, 'municipality')
        ->post(route('municipality.users.store'), ['name' => 'X', 'email' => 'x@x.com', 'department_id' => $outrosAlheio->id, 'password' => 'Inicial@123'])
        ->assertSessionHasErrors('department_id');

    asPanel($this, $aracatuba, 'municipality')->delete(route('municipality.users.destroy', $ana))->assertForbidden();
    expect(DepartmentUser::find($ana->id))->not->toBeNull();
});

it('não exclui departamento que tem pessoas cadastradas', function () {
    ['municipality' => $muni] = cityWithTeams();
    $zeladoria = Department::create(['name' => 'Zeladoria', 'municipality_id' => $muni->id, 'is_default' => false]);
    DepartmentUser::create(['municipality_id' => $muni->id, 'department_id' => $zeladoria->id, 'name' => 'Zé', 'email' => 'ze@birigui.sp.gov.br', 'password' => 'Senha@1234']);

    $this->actingAs($muni, 'municipality')->delete(route('municipality.departments.destroy', $zeladoria))->assertSessionHasErrors();
    expect(Department::find($zeladoria->id))->not->toBeNull();
});

it('nova reclamação avisa as pessoas do departamento; sem ninguém, avisa o master', function () {
    ['city' => $city, 'infra' => $infra, 'ana' => $ana, 'outros' => $outros] = cityWithTeams();
    $user = User::factory()->create();
    $payload = ['title' => 'Buraco', 'description' => 'Buraco na rua', 'state_id' => $city->state_id, 'city_id' => $city->id, 'address' => 'Rua A, 1', 'district' => 'Centro'];

    $this->actingAs($user)->post(route('complaints.store'), [...$payload, 'department_id' => $infra->id])->assertSessionHasNoErrors();
    expect(PanelNotification::where('department_user_id', $ana->id)->where('type', 'complaint_created')->count())->toBe(1);

    $this->actingAs($user)->post(route('complaints.store'), [...$payload, 'department_id' => $outros->id])->assertSessionHasNoErrors();
    expect(PanelNotification::whereNull('department_user_id')->where('type', 'complaint_created')->count())->toBe(1);
});

it('o nome de quem agiu aparece para o master, o mesmo departamento e o admin; para os outros só o departamento', function () {
    ['municipality' => $muni, 'infra' => $infra, 'ana' => $ana, 'bia' => $bia] = cityWithTeams();
    $author = User::factory()->create();
    $complaint = makeComplaint($author, $infra);
    $colega = DepartmentUser::create(['municipality_id' => $muni->id, 'department_id' => $infra->id, 'name' => 'Colega', 'email' => 'colega@birigui.sp.gov.br', 'password' => 'Senha@1234']);

    $this->actingAs($ana, 'department')->patch(route('municipality.complaints.start', $complaint));
    $this->actingAs($ana, 'department')->post(route('municipality.complaints.messages.store', $complaint), ['body' => 'Equipe a caminho.']);

    $seesName = fn ($response) => str_contains($response->getContent(), 'Ana Infra');

    // Painel: master e colega do mesmo departamento veem.
    expect($seesName(asPanel($this, $muni, 'municipality')->get(route('municipality.complaints.show', $complaint))))->toBeTrue();
    expect($seesName(asPanel($this, $colega, 'department')->get(route('municipality.complaints.show', $complaint))))->toBeTrue();

    // Página pública: o cidadão vê só "Infraestrutura".
    $citizenPage = asPanel($this, $author, 'web')->get(route('complaints.show', $complaint));
    expect($seesName($citizenPage))->toBeFalse();
    expect(str_contains($citizenPage->getContent(), 'Infraestrutura'))->toBeTrue();

    $admin = User::factory()->create(['role' => 'admin']);
    expect($seesName(asPanel($this, $admin, 'web')->get(route('complaints.show', $complaint))))->toBeTrue();
});

it('outro departamento não vê o nome de quem agiu', function () {
    ['infra' => $infra, 'ana' => $ana, 'bia' => $bia] = cityWithTeams();
    $complaint = makeComplaint(User::factory()->create(), $infra);
    $this->actingAs($ana, 'department')->patch(route('municipality.complaints.start', $complaint));

    // Bia (Saúde) só abre a página pública da reclamação.
    $event = ComplaintEvent::where('complaint_id', $complaint->id)->where('type', 'status_change')->first();
    asPanel($this, $bia, 'department');
    $loaded = $complaint->fresh()->load('department', 'events');
    \App\Support\ComplaintPrivacy::hideMemberNames($loaded);

    expect($loaded->events->firstWhere('id', $event->id)->toArray())->not->toHaveKey('member_name');
    expect($loaded->events->firstWhere('id', $event->id)->toArray()['member_department_name'])->toBe('Infraestrutura');
});

it('qualquer pessoa do departamento pode contestar', function () {
    ['infra' => $infra, 'ana' => $ana] = cityWithTeams();
    $complaint = makeComplaint(User::factory()->create(), $infra, ['status_id' => ComplaintStatus::REJECTED]);

    $this->actingAs($ana, 'department')
        ->post(route('municipality.complaints.disputes.store', $complaint), ['reason' => 'O serviço foi feito.'])
        ->assertSessionHas('success');

    expect($complaint->disputes()->where('status', 'pending')->exists())->toBeTrue();
});

it('a pessoa troca a própria senha em Minha conta', function () {
    ['ana' => $ana] = cityWithTeams();

    $this->actingAs($ana, 'department')
        ->put(route('municipality.account.password'), ['current_password' => 'Senha@1234', 'password' => 'NovaSenha@99', 'password_confirmation' => 'NovaSenha@99'])
        ->assertSessionHasNoErrors();

    expect(\Illuminate\Support\Facades\Hash::check('NovaSenha@99', $ana->fresh()->password))->toBeTrue();
});
