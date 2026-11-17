<?php

use App\Actions\Complaint\RejectAction;
use App\ComplaintStatus;
use App\Support\Notifications\ComplaintRejectedNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Notifications\AnonymousNotifiable;
use Illuminate\Support\Facades\Notification;

uses(RefreshDatabase::class);

// Cenário reaproveitado de DisputeNotificationTest (prefeitura ativa, cidadão e reclamação).

it('envia e-mail para a prefeitura quando o cidadão marca a reclamação como não resolvida', function () {
    Notification::fake();
    ['muni' => $muni, 'citizen' => $citizen, 'complaint' => $complaint] = makeRejectedComplaintScenario();
    $complaint->update(['status_id' => ComplaintStatus::ENDED]);

    $this->actingAs($citizen, 'web');
    (new RejectAction())->execute($complaint->fresh());

    expect($complaint->fresh()->status_id)->toBe(ComplaintStatus::REJECTED);
    Notification::assertSentOnDemand(
        ComplaintRejectedNotification::class,
        fn ($notification, $channels, AnonymousNotifiable $notifiable) => $notifiable->routes['mail'] === $muni->email
            && $notification->complaint->is($complaint)
    );
});

it('não envia e-mail quando a prefeitura ainda não foi ativada', function () {
    Notification::fake();
    ['muni' => $muni, 'citizen' => $citizen, 'complaint' => $complaint] = makeRejectedComplaintScenario();
    $muni->update(['active' => false]);
    $complaint->update(['status_id' => ComplaintStatus::ENDED]);

    $this->actingAs($citizen, 'web');
    (new RejectAction())->execute($complaint->fresh());

    expect($complaint->fresh()->status_id)->toBe(ComplaintStatus::REJECTED);
    Notification::assertNothingSent();
});

it('monta o e-mail com o link do painel da prefeitura', function () {
    ['complaint' => $complaint] = makeRejectedComplaintScenario();

    $mail = (new ComplaintRejectedNotification($complaint))->toMail(new AnonymousNotifiable());

    expect($mail->subject)->toContain("#{$complaint->id}");
    expect($mail->actionUrl)->toBe(route('municipality.complaints.show', $complaint));
});
