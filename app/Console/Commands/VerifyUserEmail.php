<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Auth\Events\Verified;
use Illuminate\Console\Command;

class VerifyUserEmail extends Command
{
    /**
     * A assinatura do comando.
     */
    protected $signature = 'app:verify-email {email : E-mail da conta a ser marcada como verificada}';

    /**
     * A descrição do comando.
     */
    protected $description = 'Marca o e-mail de um usuário como verificado (atalho para ambiente local, onde nenhum e-mail é enviado)';

    /**
     * Executa o comando.
     */
    public function handle(): int
    {
        $user = User::where('email', $this->argument('email'))->first();

        if (! $user) {
            $this->error('Nenhum usuário encontrado com esse e-mail.');
            return self::FAILURE;
        }

        if ($user->hasVerifiedEmail()) {
            $this->info("O e-mail {$user->email} já estava verificado.");
            return self::SUCCESS;
        }

        $user->markEmailAsVerified();
        event(new Verified($user));

        $this->info("E-mail {$user->email} marcado como verificado.");
        return self::SUCCESS;
    }
}
