# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Dev environment
- `composer dev` — runs server + queue listener + Vite concurrently (the everyday command).
- `composer dev:ssr` — same as above plus `inertia:start-ssr` and `pail` log tailing.
- `npm run dev` — Vite only (use when PHP server is already running).
- `npm run build` / `npm run build:ssr` — production bundles.

### Tests
- `composer test` — clears config then runs `php artisan test` (Pest under the hood).
- `php artisan test --filter=SomeTest` — run a single test or group.
- `vendor/bin/pest tests/Feature/Foo/BarTest.php` — direct Pest invocation.
- Test DB is sqlite `:memory:` (see [phpunit.xml](phpunit.xml)); no setup needed.

### Lint / format / types
- `npm run lint` — ESLint with `--fix` over the whole repo.
- `npm run format` / `npm run format:check` — Prettier over `resources/`.
- `npm run types` — `tsc --noEmit`.
- `vendor/bin/pint` — PHP formatter (Laravel Pint).

### DB
- `php artisan migrate --seed` — seeds states/cities, statuses, municipalities, neighborhoods (see [database/seeders/DatabaseSeeder.php](database/seeders/DatabaseSeeder.php)).

## Architecture

Laravel 12 backend + Inertia.js + React 19 (TypeScript) frontend. No REST API layer — controllers return `Inertia::render(...)` and pages live under [resources/js/pages](resources/js/pages) keyed by the string passed to `render`.

### Two authentication guards, two route trees
Auth is split by guard in [config/auth.php](config/auth.php):
- `web` guard — `users` provider, `App\Models\User` (citizens + admins).
- `municipality` guard — `municipalities` provider, `App\Models\Municipality` (city-hall users).

Routing mirrors this:
- [routes/web.php](routes/web.php) — main domain (`APP_DOMAIN` env), uses `auth:web`. Contains public ranking pages, solicitation form, citizen-side complaints, and the `/admin` area.
- [routes/municipality.php](routes/municipality.php) — `cid.{APP_DOMAIN}` subdomain, uses `auth:municipality`. The municipality back-office (departments, neighborhoods, complaint workflow).
- [routes/auth.php](routes/auth.php) and [routes/settings.php](routes/settings.php) — split out of `web.php`.

Both routes files use `Route::domain(...)`, so **env `APP_DOMAIN` must be set** for routes to resolve in any environment. When adding routes, decide which guard/domain group they belong to.

The same complaint resource is exposed under both trees — `App\Http\Controllers\ComplaintController` (citizen view, approve/reject) and `App\Http\Controllers\Municipality\ComplaintController` (start/end workflow). `web.php` reuses the municipality controller's `start`/`end` actions for the citizen-facing patch routes.

### Complaint workflow
Complaints are the core domain. Status transitions live in [app/ComplaintStatus.php](app/ComplaintStatus.php) (OPEN → IN_PROGRESS → ENDED → SOLVED/REJECTED/CLOSED) and each transition is a single-purpose action class in [app/Actions/Complaint](app/Actions/Complaint) (`CreateAction`, `ApproveAction`, `RejectAction`, `StartAction`, `EndAction`). Controllers should dispatch to these actions rather than mutating the model directly.

### Shared Inertia props
[app/Http/Middleware/HandleInertiaRequests.php](app/Http/Middleware/HandleInertiaRequests.php) shares `auth.user` (eager-loading `city.state`), `ziggy` routes, sidebar state, and `flash.{success,error,info,warn}` to every page. The middleware checks both guards and swaps `auth.user` accordingly — frontend code can read `auth.user` without caring which guard logged in.

### Frontend conventions
- Pages: [resources/js/pages](resources/js/pages) — file path matches the `Inertia::render('foo/bar')` key.
- Layouts in [resources/js/layouts](resources/js/layouts) (`app-layout`, `auth-layout`, `guest-layout`, plus nested `app/`, `auth/`, `settings/` variants).
- UI primitives in `resources/js/components/ui` (shadcn-style), domain components at `resources/js/components` root.
- Mixing component libs: Radix-based shadcn UI + PrimeReact + Headless UI all present. Match the surrounding page's style before adding a new one.
- Ziggy provides typed `route()` helper from PHP routes — alias `ziggy-js` points at `vendor/tightenco/ziggy` (see [vite.config.ts](vite.config.ts)).
- Tailwind v4 via `@tailwindcss/vite`.

### Deployment
Multi-stage [Dockerfile](Dockerfile): PHP 8.4-fpm + composer, separate Node stage for `npm run build`, final image runs Nginx + PHP-FPM together via [deploy/entrypoint.sh](deploy/entrypoint.sh) on port 8000.

## Project context
- Language: comments, commit messages, route prefixes (`solicitation-form`, `cid.`) mix English and Portuguese. The domain is Brazilian municipal services (states/cities/neighborhoods, citizen complaints to city halls).
- Some older migrations have non-timestamped names (`01_create_users_table.php` … `13_…`) intermixed with normal `2025_*` migrations — don't "fix" the naming, ordering relies on it.
