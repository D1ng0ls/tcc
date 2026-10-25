<?php

namespace App\Http\Middleware;

use App\Models\State;
use App\Models\City;
use App\Models\Neighborhood;
use Illuminate\Foundation\Inspiring;
use Illuminate\Http\Request;
use Inertia\Middleware;
use Tighten\Ziggy\Ziggy;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        [$message, $author] = str(Inspiring::quotes()->random())->explode('-');

        // No painel, o usuário de departamento usa as telas da prefeitura dele: auth.user é a
        // prefeitura e auth.member diz quem é a pessoa e de qual departamento.
        $member = \App\Support\Panel::member();
        $municipalityUser = auth('municipality')->user() ?? $member?->municipality;
        $webUser = auth('web')->user();
        $authUser = $municipalityUser ?? $webUser;
        $authGuard = $municipalityUser ? 'municipality' : ($webUser ? 'web' : null);

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'quote' => ['message' => trim($message), 'author' => trim($author)],
            'auth' => [
                'user' => $authUser?->loadMissing('city.state'),
                'guard' => $authGuard,
                'member' => $member ? [
                    'id' => $member->id,
                    'name' => $member->name,
                    'email' => $member->email,
                    'department_id' => $member->department_id,
                    'department_name' => $member->department?->name,
                ] : null,
            ],
            'ziggy' => fn(): array => [
                ...(new Ziggy)->toArray(),
                'location' => $request->url(),
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
            'flash' => [
                'success' => fn() => $request->session()->get('success'),
                'error' => fn() => $request->session()->get('error'),
                'info' => fn() => $request->session()->get('info'),
                'warn' => fn() => $request->session()->get('warn'),
            ],
        ];
    }
}
