<?php

use App\Models\Department;
use App\Models\Neighborhood;
use App\Models\NeighborhoodSuggestion;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(fn () => seedComplaintStatuses());

// IDOR: trocar o id na URL não pode alcançar bairros/departamentos de outra cidade (RF048)
it('impede que uma prefeitura edite ou exclua bairro de outra cidade', function () {
    ['municipality' => $birigui] = cityWithMunicipality('Birigui');
    ['city' => $aracatuba] = cityWithMunicipality('Araçatuba');
    $bairroAlheio = Neighborhood::create(['name' => 'Centro', 'city_id' => $aracatuba->id]);

    $this->actingAs($birigui, 'municipality');

    $this->patch(route('municipality.neighborhoods.update', $bairroAlheio), ['name' => 'Invadido'])->assertForbidden();
    $this->delete(route('municipality.neighborhoods.destroy', $bairroAlheio))->assertForbidden();

    expect($bairroAlheio->fresh()->name)->toBe('Centro');
});

it('impede que uma prefeitura edite ou exclua departamento de outra prefeitura', function () {
    ['municipality' => $birigui] = cityWithMunicipality('Birigui');
    ['municipality' => $aracatuba] = cityWithMunicipality('Araçatuba');
    $deptAlheio = Department::create(['name' => 'Zeladoria', 'municipality_id' => $aracatuba->id, 'is_default' => false]);

    $this->actingAs($birigui, 'municipality');

    $this->patch(route('municipality.departments.update', $deptAlheio), ['name' => 'Invadido'])->assertForbidden();
    $this->delete(route('municipality.departments.destroy', $deptAlheio))->assertForbidden();

    expect($deptAlheio->fresh())->not->toBeNull();
    expect($deptAlheio->fresh()->name)->toBe('Zeladoria');
});

it('permite à prefeitura editar e excluir os próprios bairros', function () {
    ['city' => $city, 'municipality' => $muni] = cityWithMunicipality('Birigui');
    $bairro = Neighborhood::create(['name' => 'Jardim', 'city_id' => $city->id]);

    $this->actingAs($muni, 'municipality');

    $this->patch(route('municipality.neighborhoods.update', $bairro), ['name' => 'Jardim Novo'])->assertRedirect();
    expect($bairro->fresh()->name)->toBe('Jardim Novo');

    $this->delete(route('municipality.neighborhoods.destroy', $bairro))->assertRedirect();
    expect(Neighborhood::find($bairro->id))->toBeNull();
});

it('recusa bairro com nome repetido na mesma cidade', function () {
    ['city' => $city, 'municipality' => $muni] = cityWithMunicipality('Birigui');
    Neighborhood::create(['name' => 'Centro', 'city_id' => $city->id]);

    $this->actingAs($muni, 'municipality')
        ->post(route('municipality.neighborhoods.store'), ['name' => 'Centro'])
        ->assertSessionHasErrors('name');

    expect(Neighborhood::where('city_id', $city->id)->where('name', 'Centro')->count())->toBe(1);
});

// RF005 — excluir departamento realoca as reclamações para "Outros"
it('exclui departamento personalizado realocando as reclamações para Outros', function () {
    ['municipality' => $muni, 'outros' => $outros] = cityWithMunicipality('Birigui');
    $dept = Department::create(['name' => 'Zeladoria', 'municipality_id' => $muni->id, 'is_default' => false]);
    $complaint = makeComplaint(User::factory()->create(), $dept);

    $this->actingAs($muni, 'municipality')
        ->delete(route('municipality.departments.destroy', $dept))
        ->assertRedirect()
        ->assertSessionHas('success');

    expect(Department::find($dept->id))->toBeNull();
    expect($complaint->fresh()->department_id)->toBe($outros->id);
});

it('não exclui departamento padrão', function () {
    ['municipality' => $muni, 'outros' => $outros] = cityWithMunicipality('Birigui');

    $this->actingAs($muni, 'municipality')
        ->delete(route('municipality.departments.destroy', $outros))
        ->assertSessionHasErrors();

    expect(Department::find($outros->id))->not->toBeNull();
});

// Aprovar sugestão de bairro só vincula as reclamações da própria prefeitura
it('aprova sugestão de bairro sem capturar reclamações de outra cidade', function () {
    ['city' => $birigui, 'municipality' => $muniBirigui, 'outros' => $outrosBirigui] = cityWithMunicipality('Birigui');
    ['outros' => $outrosAracatuba] = cityWithMunicipality('Araçatuba');
    $autor = User::factory()->create();

    $daqui = makeComplaint($autor, $outrosBirigui, ['district' => 'Centro']);
    $dali = makeComplaint($autor, $outrosAracatuba, ['district' => 'Centro']);
    $suggestion = NeighborhoodSuggestion::create([
        'city_id' => $birigui->id, 'name' => 'Centro', 'status' => 'pending', 'hits' => 1,
    ]);

    $this->actingAs($muniBirigui, 'municipality')
        ->patch(route('municipality.neighborhoods.suggestions.approve', $suggestion))
        ->assertRedirect();

    $bairro = Neighborhood::where('city_id', $birigui->id)->where('name', 'Centro')->firstOrFail();
    expect($daqui->fresh()->neighborhood_id)->toBe($bairro->id);
    expect($dali->fresh()->neighborhood_id)->toBeNull();
    expect($dali->fresh()->district)->toBe('Centro');
});
