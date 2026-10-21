<?php

use App\Models\Ranking;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

// A ordenação padrão (por nome) mantinha só municipalities.* e perdia as colunas agregadas.
it('lista as prefeituras com reclamações, usuários e eficiência na ordenação padrão', function () {
    seedComplaintStatuses();
    ['city' => $city, 'outros' => $outros] = cityWithMunicipality('Birigui');
    makeComplaint(User::factory()->create(['city_id' => $city->id]), $outros);
    Ranking::create([
        'city_id' => $city->id, 'state_id' => $city->state_id, 'total_complaints' => 3,
        'solved_complaints' => 2, 'resolution' => 66.67, 'month' => 10, 'year' => 2026,
    ]);

    $admin = User::factory()->create(['role' => 'admin']);

    $this->actingAs($admin)
        ->getJson(route('admin.municipalities.all', ['sort' => 'name', 'direction' => 'asc']))
        ->assertOk()
        ->assertJsonPath('data.0.name', 'Prefeitura de Birigui')
        ->assertJsonPath('data.0.complaints_count', 1)
        ->assertJsonPath('data.0.users_count', 1)
        ->assertJsonPath('data.0.efficiency', 66.67);
});
