<?php

use Illuminate\Mail\Transport\ResendTransport;
use Illuminate\Support\Facades\Mail;

// Produção envia o link de verificação pela API do Resend: MAIL_MAILER=resend + RESEND_KEY.
it('monta o envio pela API do Resend quando MAIL_MAILER=resend', function () {
    config([
        'mail.default' => 'resend',
        'services.resend.key' => 're_chave_de_teste',
    ]);

    expect(Mail::mailer()->getSymfonyTransport())->toBeInstanceOf(ResendTransport::class);
});
