<?php

use App\ComplaintStatus;
use App\Models\ComplaintDispute;
use App\Models\User;
use App\Models\UserNotification;
use App\Support\ComplaintEventLogger;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

beforeEach(fn () => seedComplaintStatuses());

// Marcador de novidade (RF060): prefeitura pelas datas da reclamação, cidadão pelas notificações.

it('marca novidade para a prefeitura quando o cidadão escreve e tira ao abrir', function () {
    ['municipality' => $muni, 'outros' => $outros] = cityWithMunicipality('Birigui');
    $author = User::factory()->create();
    $complaint = makeComplaint($author, $outros);
    $complaint->markSeenByMunicipality();
    $this->travel(1)->minutes();

    $this->actingAs($author, 'web')
        ->post(route('complaints.messages.store', $complaint), ['body' => 'Alguma previsão?'])
        ->assertRedirect();

    $this->actingAs($muni, 'municipality')
        ->get(route('municipality.complaints.index'))
        ->assertInertia(fn (Assert $page) => $page->where('complaints.data.0.id', $complaint->id)->where('complaints.data.0.has_novelty', 1));

    $this->actingAs($muni, 'municipality')->get(route('municipality.complaints.show', $complaint))->assertOk();

    $this->actingAs($muni, 'municipality')
        ->get(route('municipality.complaints.index'))
        ->assertInertia(fn (Assert $page) => $page->where('complaints.data.0.has_novelty', 0));
});

it('ação da própria prefeitura não vira novidade para ela', function () {
    ['municipality' => $muni, 'outros' => $outros] = cityWithMunicipality('Birigui');
    $complaint = makeComplaint(User::factory()->create(), $outros);
    $complaint->markSeenByMunicipality();
    $this->travel(1)->minutes();

    $this->actingAs($muni, 'municipality')
        ->post(route('municipality.complaints.messages.store', $complaint), ['body' => 'Equipe a caminho.']);

    $this->actingAs($muni, 'municipality')
        ->get(route('municipality.complaints.index'))
        ->assertInertia(fn (Assert $page) => $page->where('complaints.data.0.has_novelty', 0));
});

it('reclamação com novidade sobe para o topo da lista da prefeitura', function () {
    ['municipality' => $muni, 'outros' => $outros] = cityWithMunicipality('Birigui');
    $author = User::factory()->create();
    $antiga = makeComplaint($author, $outros, ['title' => 'Antiga']);
    $nova = makeComplaint($author, $outros, ['title' => 'Nova']);
    $antiga->markSeenByMunicipality();
    $nova->markSeenByMunicipality();
    $this->travel(1)->minutes();

    $this->actingAs($author, 'web')->post(route('complaints.messages.store', $antiga), ['body' => 'Novidade aqui']);

    $this->actingAs($muni, 'municipality')
        ->get(route('municipality.complaints.index'))
        ->assertInertia(fn (Assert $page) => $page->where('complaints.data.0.id', $antiga->id)->where('complaints.data.1.id', $nova->id));
});

it('mensagem do admin avisa o cidadão e a novidade some quando ele abre a reclamação', function () {
    ['outros' => $outros] = cityWithMunicipality('Birigui');
    $author = User::factory()->create();
    $admin = User::factory()->create(['role' => 'admin']);
    $complaint = makeComplaint($author, $outros);

    $this->actingAs($admin, 'web')
        ->post(route('complaints.messages.store', $complaint), ['body' => 'Estamos acompanhando.']);

    $notification = UserNotification::where('user_id', $author->id)->where('type', 'message_received')->first();
    expect($notification)->not->toBeNull();
    expect($notification->complaint_id)->toBe($complaint->id);

    $this->actingAs($author, 'web')
        ->get(route('complaints.index'))
        ->assertInertia(fn (Assert $page) => $page->where('complaints.data.0.has_novelty', true));

    $this->actingAs($author, 'web')->get(route('complaints.show', $complaint))->assertOk();

    expect($notification->fresh()->read_at)->not->toBeNull();
    $this->actingAs($author, 'web')
        ->get(route('complaints.index'))
        ->assertInertia(fn (Assert $page) => $page->where('complaints.data.0.has_novelty', false));
});

it('avisa o cidadão quando o administrador ignora a contestação', function () {
    ['municipality' => $muni, 'outros' => $outros] = cityWithMunicipality('Birigui');
    $author = User::factory()->create();
    $admin = User::factory()->create(['role' => 'admin']);
    $complaint = makeComplaint($author, $outros, ['status_id' => ComplaintStatus::REJECTED]);
    $dispute = ComplaintDispute::create([
        'complaint_id' => $complaint->id, 'municipality_id' => $muni->id,
        'reason' => 'A obra foi entregue.', 'status' => 'pending',
    ]);

    $this->actingAs($admin, 'web')
        ->patch(route('admin.disputes.resolve', $dispute), ['action' => 'ignored'])
        ->assertRedirect();

    expect(UserNotification::where('user_id', $author->id)->where('type', 'dispute_resolved')->where('complaint_id', $complaint->id)->exists())->toBeTrue();
});

it('dashboard do cidadão lista as reclamações com novidade', function () {
    ['outros' => $outros] = cityWithMunicipality('Birigui');
    $author = User::factory()->create();
    $complaint = makeComplaint($author, $outros);
    \App\Support\ComplaintNotifier::departmentChanged($complaint, 'Saúde');

    $this->actingAs($author, 'web')
        ->get(route('dashboard'))
        ->assertInertia(fn (Assert $page) => $page->where('noveltyCount', 1)->where('novelties.0.id', $complaint->id));
});

it('painel da prefeitura conta as não resolvidas e mostra todos os departamentos', function () {
    ['municipality' => $muni, 'outros' => $outros] = cityWithMunicipality('Birigui');
    $author = User::factory()->create();
    makeComplaint($author, $outros, ['status_id' => ComplaintStatus::REJECTED]);
    foreach (range(1, 6) as $i) {
        $dept = \App\Models\Department::create(['name' => "Depto {$i}", 'municipality_id' => $muni->id]);
        makeComplaint($author, $dept);
    }

    $this->actingAs($muni, 'municipality')
        ->get(route('municipality.dashboard'))
        ->assertInertia(fn (Assert $page) => $page->where('stats.rejected', 1)->has('byDepartment', 7));
});
