<?php

use App\ComplaintStatus;
use App\Helpers\CalcResolutionHelper;
use App\Models\ComplaintEvent;
use App\Models\Ranking;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Schema;

uses(RefreshDatabase::class);

// A justificativa da contestação aceita 2000 caracteres e vira a nota do evento.
it('guarda justificativa de contestação de 2000 caracteres na linha do tempo', function () {
    expect(Schema::getColumnType('complaint_events', 'note'))->toBe('text');

    seedComplaintStatuses();
    ['municipality' => $muni, 'outros' => $outros] = cityWithMunicipality('Birigui');
    $complaint = makeComplaint(User::factory()->create(), $outros, ['status_id' => ComplaintStatus::REJECTED]);
    $justificativa = str_repeat('Serviço executado conforme a ordem. ', 56); // > 2000
    $justificativa = mb_substr($justificativa, 0, 2000);

    $this->actingAs($muni, 'municipality')
        ->post(route('municipality.complaints.disputes.store', $complaint), ['reason' => $justificativa])
        ->assertRedirect()
        ->assertSessionHas('success');

    $evento = ComplaintEvent::where('complaint_id', $complaint->id)->where('type', 'dispute_opened')->sole();
    expect(mb_strlen($evento->note))->toBe(2000);
});

// O índice de resolução tem duas casas decimais (66,67 não pode virar 67).
it('guarda o índice de resolução do ranking com casas decimais', function () {
    expect(Schema::getColumnType('rankings', 'resolution'))->not->toBe('integer');

    ['city' => $city] = cityWithMunicipality('Birigui');
    $ranking = Ranking::create([
        'city_id' => $city->id, 'state_id' => $city->state_id,
        'total_complaints' => 3, 'solved_complaints' => 2,
        'resolution' => CalcResolutionHelper::calcRaw(3, 2),
        'month' => 10, 'year' => 2026,
    ]);

    expect($ranking->fresh()->resolution)->toBe(66.67);
});
