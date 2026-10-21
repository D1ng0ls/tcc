<?php

use App\ComplaintStatus;
use App\Models\CityRequest;
use App\Models\ComplaintEvent;
use App\Models\ComplaintMessage;
use App\Models\Ranking;
use App\Models\User;
use App\Models\UserNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Testing\TestResponse;

uses(RefreshDatabase::class);

/**
 * Varredura de privacidade: nada que é pessoal de uma cidadã (dados cadastrais,
 * notificações, pedido de acesso, nome na linha do tempo/conversa) pode aparecer
 * — na tela ou no JSON da página — para visitantes, outros cidadãos ou a prefeitura.
 */
function sweepScenario(): array
{
    seedComplaintStatuses();
    ['city' => $city, 'municipality' => $muni, 'outros' => $outros] = cityWithMunicipality('Birigui');

    $autora = User::factory()->create([
        'name' => 'Zuleica Privada', 'email' => 'zuleica.privada@example.com', 'cpf' => '321.654.987-00',
        'address' => 'Travessa Sigilosa, 99', 'birth_date' => '1987-03-14', 'city_id' => $city->id,
    ]);
    $complaint = makeComplaint($autora, $outros, ['status_id' => ComplaintStatus::ENDED]);

    ComplaintEvent::create([
        'complaint_id' => $complaint->id, 'type' => 'created', 'to_status' => ComplaintStatus::OPEN,
        'actor_type' => 'user', 'actor_id' => $autora->id, 'actor_name' => $autora->name,
    ]);
    ComplaintMessage::create([
        'complaint_id' => $complaint->id, 'author_type' => 'user', 'author_id' => $autora->id,
        'author_name' => $autora->name, 'is_admin' => false, 'body' => 'Alguma novidade?',
    ]);
    UserNotification::create([
        'user_id' => $autora->id, 'type' => 'status_changed', 'title' => 'Aviso pessoal da Zuleica',
        'body' => 'Sua reclamação foi encerrada.', 'link' => '/complaints/show/'.$complaint->id,
    ]);
    CityRequest::create([
        'user_id' => $autora->id, 'city_id' => $city->id,
        'requester' => 'Zuleica Privada', 'email' => 'zuleica.gestora@example.com',
    ]);
    Ranking::create([
        'city_id' => $city->id, 'state_id' => $city->state_id, 'total_complaints' => 1,
        'solved_complaints' => 0, 'resolution' => 0, 'month' => 10, 'year' => 2026, 'rank' => 1, 'rank_state' => 1,
    ]);

    return compact('muni', 'complaint');
}

function assertNoPersonalDataOf(TestResponse $response, string $page): void
{
    $response->assertOk();

    foreach (['Zuleica', 'zuleica.privada@example.com', 'zuleica.gestora@example.com', '321.654.987-00', 'Travessa Sigilosa', '1987-03-14'] as $needle) {
        expect(str_contains($response->getContent(), $needle))->toBeFalse("'{$needle}' apareceu em {$page}");
    }
}

it('não mostra nada pessoal da cidadã para visitantes', function () {
    ['complaint' => $complaint] = sweepScenario();

    foreach ([
        route('home'),
        route('ranking.index'),
        route('ranking.state', ['stateUf' => 'sp']),
        route('ranking.city', ['stateUf' => 'sp', 'citySlug' => 'birigui']),
        route('cities.show', ['stateUf' => 'sp', 'citySlug' => 'birigui']),
        route('complaints.show', $complaint),
        route('login'),
        route('register'),
    ] as $url) {
        assertNoPersonalDataOf($this->get($url), $url);
    }
});

it('não mostra nada pessoal da cidadã para outro cidadão', function () {
    ['complaint' => $complaint] = sweepScenario();
    $this->actingAs(User::factory()->create());

    foreach ([
        route('home'),
        route('dashboard'),
        route('complaints.index'),
        route('complaints.create'),
        route('complaints.show', $complaint),
        route('cities.show', ['stateUf' => 'sp', 'citySlug' => 'birigui']),
        route('solicitation-form.index'),
        route('profile.edit'),
        route('address.edit'),
        route('password.edit'),
    ] as $url) {
        assertNoPersonalDataOf($this->get($url), $url);
    }
});

it('não mostra nada pessoal da cidadã para a prefeitura', function () {
    ['muni' => $muni, 'complaint' => $complaint] = sweepScenario();
    $this->actingAs($muni, 'municipality');

    foreach ([
        route('municipality.dashboard'),
        route('municipality.complaints.index'),
        route('municipality.complaints.show', $complaint),
        route('municipality.neighborhoods.index'),
        route('municipality.departments.index'),
        route('municipality.settings.edit'),
    ] as $url) {
        assertNoPersonalDataOf($this->get($url), $url);
    }
});
