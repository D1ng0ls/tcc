<?php

use App\ComplaintStatus;
use App\Models\ComplaintEvent;
use App\Models\Status;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Gate;

uses(RefreshDatabase::class);

beforeEach(fn () => seedComplaintStatuses());

it('a política consulta quem pode aplicar cada situação (tipo do status)', function () {
    ['municipality' => $muni, 'outros' => $outros] = cityWithMunicipality('Birigui');
    $author = User::factory()->create();
    $aberta = makeComplaint($author, $outros);
    $encerrada = makeComplaint($author, $outros, ['status_id' => ComplaintStatus::ENDED]);

    expect(Gate::forUser($muni)->allows('start', $aberta))->toBeTrue();
    expect(Gate::forUser($author)->allows('approve', $encerrada))->toBeTrue();

    // Se "Em andamento" deixasse de ser uma situação aplicada pela prefeitura, ela não poderia iniciar.
    Status::whereKey(ComplaintStatus::IN_PROGRESS)->update(['type' => 'user']);
    expect(Gate::forUser($muni)->allows('start', $aberta))->toBeFalse();

    // Idem para a avaliação do cidadão.
    Status::whereKey(ComplaintStatus::SOLVED)->update(['type' => 'municipality']);
    expect(Gate::forUser($author)->allows('approve', $encerrada))->toBeFalse();
});

it('eventos do histórico não podem ser alterados nem apagados', function () {
    ['outros' => $outros] = cityWithMunicipality('Birigui');
    $complaint = makeComplaint(User::factory()->create(), $outros);
    $event = ComplaintEvent::create([
        'complaint_id' => $complaint->id, 'type' => 'created', 'to_status' => ComplaintStatus::OPEN,
        'actor_type' => 'user', 'actor_name' => 'Maria',
    ]);

    expect(fn () => $event->update(['note' => 'editado']))->toThrow(LogicException::class);
    expect(fn () => $event->delete())->toThrow(LogicException::class);
    expect(ComplaintEvent::find($event->id)->note)->toBeNull();
});

it('administrador vai para o painel admin depois do login', function () {
    $admin = User::factory()->create(['role' => 'admin', 'password' => bcrypt('Senha@2026')]);

    $this->post(route('login'), ['email' => $admin->email, 'password' => 'Senha@2026'])
        ->assertRedirect(route('admin.dashboard', absolute: false));
});
