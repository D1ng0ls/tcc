<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class EmailVerificationPromptController extends Controller
{
    /**
     * Show the email verification prompt page.
     */
    public function __invoke(Request $request): Response|RedirectResponse
    {
        return $request->user()->hasVerifiedEmail()
                    ? redirect()->intended(route('dashboard', absolute: false))
                    : Inertia::render('auth/verify-email', [
                        'status' => $request->session()->get('status'),
                        'email' => $request->user()->email,
                        // Ambiente local com MAIL_MAILER=log: nenhum e-mail sai da máquina,
                        // o link fica gravado no log. Em produção isto é sempre false.
                        'mailLoggedLocally' => app()->isLocal() && config('mail.default') === 'log',
                    ]);
    }
}
