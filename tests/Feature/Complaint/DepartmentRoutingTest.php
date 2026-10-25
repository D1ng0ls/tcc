<?php

use App\ComplaintStatus;
use App\Models\ComplaintEvent;
use App\Models\Department;
use App\Models\User;
use App\Models\UserNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(fn () => seedComplaintStatuses());

it('encaminha a reclamação para outro departamento da mesma prefeitura', function () {
    ['municipality' => $muni, 'outros' => $outros] = cityWithMunicipality('Birigui');
    $infra = Department::create(['name' => 'Infraestrutura', 'municipality_id' => $muni->id, 'is_default' => true]);
    $author = User::factory()->create();
    $complaint = makeComplaint($author, $outros);

    $this->actingAs($muni, 'municipality')
        ->patch(route('municipality.complaints.department', $complaint), ['department_id' => $infra->id])
        ->assertRedirect()
        ->assertSessionHas('success');

    expect($complaint->fresh()->department_id)->toBe($infra->id);

    $event = ComplaintEvent::where('complaint_id', $complaint->id)->where('type', 'department_changed')->first();
    expect($event)->not->toBeNull();
    expect($event->note)->toBe('De "Outros" para "Infraestrutura".');

    expect(UserNotification::where('user_id', $author->id)->where('type', 'department_changed')->exists())->toBeTrue();
});

it('não encaminha para departamento de outra prefeitura', function () {
    ['municipality' => $birigui, 'outros' => $outros] = cityWithMunicipality('Birigui');
    ['outros' => $outrosAlheio] = cityWithMunicipality('Araçatuba');
    $complaint = makeComplaint(User::factory()->create(), $outros);

    $this->actingAs($birigui, 'municipality')
        ->patch(route('municipality.complaints.department', $complaint), ['department_id' => $outrosAlheio->id])
        ->assertSessionHasErrors('department_id');

    expect($complaint->fresh()->department_id)->toBe($outros->id);
});

it('não deixa outra prefeitura mexer no departamento da reclamação', function () {
    ['outros' => $outros, 'municipality' => $birigui] = cityWithMunicipality('Birigui');
    ['municipality' => $aracatuba] = cityWithMunicipality('Araçatuba');
    $infra = Department::create(['name' => 'Infraestrutura', 'municipality_id' => $birigui->id]);
    $complaint = makeComplaint(User::factory()->create(), $outros);

    $this->actingAs($aracatuba, 'municipality')
        ->patch(route('municipality.complaints.department', $complaint), ['department_id' => $infra->id])
        ->assertForbidden();

    expect($complaint->fresh()->department_id)->toBe($outros->id);
});

it('não encaminha reclamação já encerrada', function () {
    ['municipality' => $muni, 'outros' => $outros] = cityWithMunicipality('Birigui');
    $infra = Department::create(['name' => 'Infraestrutura', 'municipality_id' => $muni->id]);
    $complaint = makeComplaint(User::factory()->create(), $outros, ['status_id' => ComplaintStatus::ENDED]);

    $this->actingAs($muni, 'municipality')
        ->patch(route('municipality.complaints.department', $complaint), ['department_id' => $infra->id])
        ->assertForbidden();

    expect($complaint->fresh()->department_id)->toBe($outros->id);
});

it('recusa reclamação com departamento de outra cidade', function () {
    ['city' => $birigui] = cityWithMunicipality('Birigui');
    ['outros' => $outrosAlheio] = cityWithMunicipality('Araçatuba');
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post(route('complaints.store'), [
            'title' => 'Buraco',
            'description' => 'Buraco na rua',
            'department_id' => $outrosAlheio->id,
            'state_id' => $birigui->state_id,
            'city_id' => $birigui->id,
            'address' => 'Rua A, 1',
            'district' => 'Centro',
        ])
        ->assertSessionHasErrors('department_id');
});

it('a prefeitura ajusta descrição e palavras-chave de um departamento padrão, mas não o nome', function () {
    ['municipality' => $muni, 'outros' => $outros] = cityWithMunicipality('Birigui');

    $this->actingAs($muni, 'municipality')
        ->patch(route('municipality.departments.update', $outros), [
            'name' => 'Trocado',
            'description' => 'Tudo que não tem outro lugar.',
            'keywords' => ' geral ,  diversos,geral ,, ',
        ])
        ->assertRedirect()
        ->assertSessionHas('success');

    $outros->refresh();
    expect($outros->name)->toBe('Outros');
    expect($outros->description)->toBe('Tudo que não tem outro lugar.');
    expect($outros->keywords)->toBe('geral, diversos');
});

it('a prefeitura cria departamento com descrição e palavras-chave', function () {
    ['municipality' => $muni] = cityWithMunicipality('Birigui');

    $this->actingAs($muni, 'municipality')
        ->post(route('municipality.departments.store'), [
            'name' => 'Iluminação Pública',
            'description' => 'Postes e lâmpadas.',
            'keywords' => 'poste, lâmpada, escur*',
        ])
        ->assertRedirect();

    $dept = Department::where('municipality_id', $muni->id)->where('name', 'Iluminação Pública')->first();
    expect($dept->description)->toBe('Postes e lâmpadas.');
    expect($dept->keywords)->toBe('poste, lâmpada, escur*');
});
