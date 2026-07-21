<?php

use App\ComplaintStatus;
use App\Http\Controllers\ComplaintDisputeController;
use App\Models\City;
use App\Models\Complaint;
use App\Models\Department;
use App\Models\Municipality;
use App\Models\State;
use App\Models\Status;
use App\Models\User;
use App\Models\UserNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

uses(RefreshDatabase::class);

function makeRejectedComplaintScenario(): array
{
    // statuses na mesma ordem do StatusSeeder (REJECTED = id 5)
    foreach ([
        ['Aberto', 'municipality'], ['Em andamento', 'municipality'], ['Encerrado', 'municipality'],
        ['Resolvido', 'user'], ['Não resolvido', 'user'], ['Fechado', 'system'],
    ] as [$name, $type]) {
        Status::create(['name' => $name, 'type' => $type]);
    }

    $state = State::create(['name' => 'São Paulo', 'uf' => 'SP']);
    $city = City::create(['name' => 'Birigui', 'state_id' => $state->id]);
    $muni = Municipality::create([
        'name' => 'Prefeitura de Birigui', 'email' => 'pref@bir.gov',
        'password' => Hash::make('password'), 'photo_url' => 'avatar.png',
        'active' => true, 'city_id' => $city->id,
    ]);
    $dept = Department::create(['name' => 'Infraestrutura', 'municipality_id' => $muni->id, 'is_default' => true]);
    $citizen = User::factory()->create([
        'cpf' => '12345678901', 'birth_date' => '2000-01-01', 'city_id' => $city->id,
    ]);
    $complaint = Complaint::create([
        'title' => 'Buraco na rua', 'description' => 'Buraco grande na via', 'address' => 'Rua X, 100',
        'user_id' => $citizen->id, 'department_id' => $dept->id, 'status_id' => ComplaintStatus::REJECTED,
    ]);

    return compact('muni', 'citizen', 'complaint');
}

it('notifica o cidadão quando a prefeitura abre uma contestação', function () {
    ['muni' => $muni, 'citizen' => $citizen, 'complaint' => $complaint] = makeRejectedComplaintScenario();

    $this->actingAs($muni, 'municipality');
    $request = Request::create('/', 'POST', ['reason' => 'Entregamos a solução solicitada.']);
    app()->instance('request', $request);

    (new ComplaintDisputeController())->store($request, $complaint);

    // contestação criada
    expect($complaint->fresh()->disputes()->where('status', 'pending')->count())->toBe(1);

    // notificação in-app gerada para o cidadão autor
    $notif = UserNotification::where('user_id', $citizen->id)->where('type', 'dispute_opened')->first();
    expect($notif)->not->toBeNull();
    expect($notif->link)->toBe('/complaints/show/' . $complaint->id);
    expect(UserNotification::where('type', 'dispute_opened')->count())->toBe(1);
});
