<?php

use App\Http\Middleware\HandleAppearance;
use App\Http\Middleware\HandleInertiaRequests;
use App\Http\Middleware\CustomRedirectIfAuthenticated;
use App\Http\Middleware\EnsureUserIsAdmin;
use App\Http\Middleware\EnsureUserIsCitizen;
use App\Http\Middleware\AuthenticateMunicipalitySession;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__ . '/../routes/web.php',
        commands: __DIR__ . '/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->encryptCookies(except: ['appearance', 'sidebar_state']);

        // Em produção a requisição chega pelo Cloudflare e pelo proxy do EasyPanel; sem confiar
        // neles, $request->ip() seria o IP do proxy para todo mundo (e o limite de login por IP
        // bloquearia todos ao mesmo tempo). Com isso o Laravel lê o IP real do X-Forwarded-For.
        $middleware->trustProxies(at: '*');

        $middleware->web(append: [
            HandleAppearance::class,
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
        ]);

        $middleware->alias([
            'guest:municipality' => CustomRedirectIfAuthenticated::class,
            'admin' => EnsureUserIsAdmin::class,
            'citizen' => EnsureUserIsCitizen::class,
            'municipality.session' => AuthenticateMunicipalitySession::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        // Falhas ao salvar/enviar/atualizar mostram um aviso na própria tela e páginas de erro
        // em português, em vez da página padrão do Laravel. Em ambiente local o erro 500
        // continua detalhado para depuração; nos testes, nada muda.
        $exceptions->respond(function (\Symfony\Component\HttpFoundation\Response $response, \Throwable $e, \Illuminate\Http\Request $request) {
            $status = $response->getStatusCode();

            if (app()->runningUnitTests() || (app()->isLocal() && $status >= 500)) {
                return $response;
            }

            if ($status === 419) {
                return back()->with('error', 'A página ficou muito tempo aberta. Tente novamente.');
            }

            // Ação que falhou (POST/PUT/PATCH/DELETE pelo Inertia): volta para a tela com o aviso.
            if ($status >= 500 && $request->header('X-Inertia') && ! $request->isMethod('GET')) {
                return back()->with('error', 'Não foi possível concluir a operação. Tente novamente.');
            }

            if (in_array($status, [403, 404, 500, 503], true)) {
                $message = $status === 403 && $e->getMessage() !== '' && $e->getMessage() !== 'This action is unauthorized.'
                    ? $e->getMessage()
                    : null;

                return \Inertia\Inertia::render('error', ['status' => $status, 'message' => $message])
                    ->toResponse($request)
                    ->setStatusCode($status);
            }

            return $response;
        });
    })->create();
