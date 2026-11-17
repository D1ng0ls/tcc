<?php

use App\Models\CityRequest;
use App\Models\Complaint;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(fn () => seedComplaintStatuses());

it('administrador não acessa as telas exclusivas do cidadão', function () {
    $admin = User::factory()->create(['role' => 'admin']);

    foreach (['dashboard', 'complaints.index', 'complaints.create', 'solicitation-form.index'] as $rota) {
        $this->actingAs($admin)->get(route($rota))->assertRedirect(route('admin.dashboard'));
    }
});

it('administrador não registra reclamação nem solicita perfil de gestor', function () {
    ['outros' => $outros] = cityWithMunicipality('Birigui');
    $admin = User::factory()->create(['role' => 'admin']);

    $this->actingAs($admin)->post(route('complaints.store'), [
        'title' => 'Teste', 'description' => 'Teste', 'department_id' => $outros->id,
        'state_id' => $outros->municipality->city->state_id, 'city_id' => $outros->municipality->city_id,
        'address' => 'Rua A, 1', 'district' => 'Centro',
    ])->assertRedirect(route('admin.dashboard'));

    $this->actingAs($admin)->post(route('solicitation-form.store'), [
        'requester' => 'Admin', 'email' => 'admin@prefeitura.gov.br',
        'state_id' => $outros->municipality->city->state_id, 'city_id' => $outros->municipality->city_id,
    ])->assertRedirect(route('admin.dashboard'));

    expect(Complaint::count())->toBe(0);
    expect(CityRequest::count())->toBe(0);
});

it('cidadão continua acessando as próprias telas', function () {
    $citizen = User::factory()->create();

    foreach (['dashboard', 'complaints.index', 'complaints.create', 'solicitation-form.index'] as $rota) {
        $this->actingAs($citizen)->get(route($rota))->assertOk();
    }
});
