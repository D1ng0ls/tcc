<?php

namespace App\Support\Notifications;

use Illuminate\Auth\Notifications\ResetPassword;

/**
 * Mesmo e-mail de redefinição de senha do cidadão, mas com o link do painel da prefeitura.
 */
class MunicipalityResetPasswordNotification extends ResetPassword
{
    protected function resetUrl($notifiable)
    {
        return route('municipality.password.reset', [
            'token' => $this->token,
            'email' => $notifiable->getEmailForPasswordReset(),
        ]);
    }
}
