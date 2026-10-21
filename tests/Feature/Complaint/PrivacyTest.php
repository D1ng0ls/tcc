<?php

use App\Models\ComplaintEvent;
use App\Models\ComplaintMessage;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

/**
 * Reclamação de "Maria Autora" com evento de criação e uma mensagem dela.
 */
function privacyScenario(): array
{
    seedComplaintStatuses();
    ['city' => $city, 'municipality' => $muni, 'outros' => $outros] = cityWithMunicipality('Birigui');

    $autor = User::factory()->create([
        'name' => 'Maria Autora', 'cpf' => '98765432100', 'address' => 'Rua Secreta, 42', 'city_id' => $city->id,
    ]);
    $complaint = makeComplaint($autor, $outros);

    ComplaintEvent::create([
        'complaint_id' => $complaint->id, 'type' => 'created', 'to_status' => 1,
        'actor_type' => 'user', 'actor_id' => $autor->id, 'actor_name' => $autor->name,
    ]);
    ComplaintMessage::create([
        'complaint_id' => $complaint->id, 'author_type' => 'user', 'author_id' => $autor->id,
        'author_name' => $autor->name, 'is_admin' => false, 'body' => 'Alguma novidade?',
    ]);
    ComplaintMessage::create([
        'complaint_id' => $complaint->id, 'author_type' => 'municipality', 'author_id' => $muni->id,
        'author_name' => $muni->name, 'is_admin' => false, 'body' => 'Equipe a caminho.',
    ]);

    return compact('city', 'muni', 'autor', 'complaint');
}

function assertAuthorHidden(Assert $page): Assert
{
    return $page
        ->missing('complaint.user')
        ->missing('complaint.user_id')
        ->where('complaint.events.0.actor_type', 'user')
        ->missing('complaint.events.0.actor_name')
        ->missing('complaint.events.0.actor_id')
        ->where('complaint.messages.0.author_type', 'user')
        ->missing('complaint.messages.0.author_name')
        ->missing('complaint.messages.0.author_id')
        // a prefeitura continua identificada (é conta institucional)
        ->where('complaint.messages.1.author_name', 'Prefeitura de Birigui');
}

// RNF006/RT006 — página pública da cidade não carrega nada do autor
it('não expõe dados do autor na página pública da cidade', function () {
    privacyScenario();

    $this->get(route('cities.show', ['stateUf' => 'sp', 'citySlug' => 'birigui']))
        ->assertOk()
        ->assertDontSee('Maria Autora')
        ->assertDontSee('98765432100')
        ->assertDontSee('Rua Secreta')
        ->assertInertia(fn (Assert $page) => $page
            ->component('complaints')
            ->has('complaints.data', 1)
            ->missing('complaints.data.0.user')
            ->missing('complaints.data.0.user_id'));
});

it('mostra o autor como "Cidadão" para visitantes na página da reclamação', function () {
    ['complaint' => $complaint] = privacyScenario();

    $this->get(route('complaints.show', $complaint))
        ->assertOk()
        ->assertDontSee('Maria Autora')
        ->assertDontSee('98765432100')
        ->assertInertia(fn (Assert $page) => assertAuthorHidden($page->component('complaints/show')));
});

it('oculta o autor de outros cidadãos', function () {
    ['complaint' => $complaint] = privacyScenario();

    $this->actingAs(User::factory()->create())
        ->get(route('complaints.show', $complaint))
        ->assertOk()
        ->assertDontSee('Maria Autora')
        ->assertInertia(fn (Assert $page) => assertAuthorHidden($page));
});

it('oculta o autor da prefeitura responsável', function () {
    ['muni' => $muni, 'complaint' => $complaint] = privacyScenario();

    $this->actingAs($muni, 'municipality')
        ->get(route('municipality.complaints.show', $complaint))
        ->assertOk()
        ->assertDontSee('Maria Autora')
        ->assertDontSee('98765432100')
        ->assertInertia(fn (Assert $page) => assertAuthorHidden($page));

    $this->actingAs($muni, 'municipality')
        ->get(route('municipality.complaints.index'))
        ->assertOk()
        ->assertDontSee('Maria Autora')
        ->assertInertia(fn (Assert $page) => $page
            ->has('complaints.data', 1)
            ->missing('complaints.data.0.user')
            ->missing('complaints.data.0.user_id'));
});

it('mostra o próprio nome ao autor da reclamação', function () {
    ['autor' => $autor, 'complaint' => $complaint] = privacyScenario();

    $this->actingAs($autor)
        ->get(route('complaints.show', $complaint))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('complaint.user_id', $autor->id)
            ->where('complaint.user.name', 'Maria Autora')
            ->where('complaint.messages.0.author_name', 'Maria Autora'));
});

it('mostra o autor ao administrador, sem CPF nem endereço', function () {
    ['complaint' => $complaint] = privacyScenario();
    $admin = User::factory()->create(['role' => 'admin']);

    $this->actingAs($admin)
        ->get(route('complaints.show', $complaint))
        ->assertOk()
        ->assertDontSee('98765432100')
        ->assertInertia(fn (Assert $page) => $page
            ->where('complaint.user.name', 'Maria Autora')
            ->missing('complaint.user.cpf')
            ->missing('complaint.user.address')
            ->where('complaint.events.0.actor_name', 'Maria Autora'));

    $this->actingAs($admin)
        ->get(route('admin.complaints.index'))
        ->assertOk()
        ->assertDontSee('98765432100')
        ->assertInertia(fn (Assert $page) => $page
            ->where('complaints.data.0.user.name', 'Maria Autora')
            ->missing('complaints.data.0.user.cpf'));
});

it('não expõe o remember_token da prefeitura nas páginas públicas', function () {
    ['muni' => $muni, 'complaint' => $complaint] = privacyScenario();
    $muni->forceFill(['remember_token' => 'token-secreto-da-prefeitura'])->save();

    $this->get(route('complaints.show', $complaint))
        ->assertOk()
        ->assertDontSee('token-secreto-da-prefeitura')
        ->assertDontSee($muni->email);
});
