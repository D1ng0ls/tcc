<?php

/*
|--------------------------------------------------------------------------
| Test Case
|--------------------------------------------------------------------------
|
| The closure you provide to your test functions is always bound to a specific PHPUnit test
| case class. By default, that class is "PHPUnit\Framework\TestCase". Of course, you may
| need to change it using the "pest()" function to bind a different classes or traits.
|
*/

pest()->extend(Tests\TestCase::class)
 // ->use(Illuminate\Foundation\Testing\RefreshDatabase::class)
    ->in('Feature');

/*
|--------------------------------------------------------------------------
| Expectations
|--------------------------------------------------------------------------
|
| When you're writing tests, you often need to check that values meet certain conditions. The
| "expect()" function gives you access to a set of "expectations" methods that you can use
| to assert different things. Of course, you may extend the Expectation API at any time.
|
*/

expect()->extend('toBeOne', function () {
    return $this->toBe(1);
});

/*
|--------------------------------------------------------------------------
| Functions
|--------------------------------------------------------------------------
|
| While Pest is very powerful out-of-the-box, you may have some testing code specific to your
| project that you don't want to repeat in every file. Here you can also expose helpers as
| global functions to help you to reduce the number of lines of code in your test files.
|
*/

function something()
{
    // ..
}

/**
 * Status na mesma ordem do StatusSeeder (ids 1..6 = constantes de App\ComplaintStatus).
 */
function seedComplaintStatuses(): void
{
    foreach ([
        ['Aberto', 'municipality'], ['Em andamento', 'municipality'], ['Encerrado', 'municipality'],
        ['Resolvido', 'user'], ['Não resolvido', 'user'], ['Fechado', 'system'],
    ] as [$name, $type]) {
        \App\Models\Status::firstOrCreate(['name' => $name], ['type' => $type]);
    }
}

/**
 * Cidade com prefeitura ativa e o departamento padrão "Outros".
 *
 * @return array{city: \App\Models\City, municipality: \App\Models\Municipality, outros: \App\Models\Department}
 */
function cityWithMunicipality(string $cityName): array
{
    $state = \App\Models\State::firstOrCreate(['uf' => 'SP'], ['name' => 'São Paulo']);
    $slug = \Illuminate\Support\Str::slug($cityName);
    $city = \App\Models\City::create(['name' => $cityName, 'state_id' => $state->id, 'slug' => $slug]);

    $municipality = \App\Models\Municipality::create([
        'name' => "Prefeitura de {$cityName}",
        'email' => "prefeitura@{$slug}.sp.gov.br",
        'password' => \Illuminate\Support\Facades\Hash::make('Senha@1234'),
        'photo_url' => 'avatar.png',
        'active' => true,
        'city_id' => $city->id,
    ]);

    $outros = \App\Models\Department::create([
        'name' => 'Outros', 'municipality_id' => $municipality->id, 'is_default' => true,
    ]);

    return ['city' => $city, 'municipality' => $municipality, 'outros' => $outros];
}

function makeComplaint(\App\Models\User $author, \App\Models\Department $department, array $attributes = []): \App\Models\Complaint
{
    return \App\Models\Complaint::create(array_merge([
        'title' => 'Buraco na rua',
        'description' => 'Buraco grande em frente ao número 100.',
        'address' => 'Rua das Flores, 100',
        'user_id' => $author->id,
        'department_id' => $department->id,
        'status_id' => \App\ComplaintStatus::OPEN,
    ], $attributes));
}
