<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Telas do painel que só o master (o login da prefeitura) usa: bairros, departamentos,
 * usuários e dados da prefeitura. Usuário de departamento não entra.
 */
class EnsurePanelMaster
{
    public function handle(Request $request, Closure $next): Response
    {
        abort_unless(auth('municipality')->check(), 403);

        return $next($request);
    }
}
