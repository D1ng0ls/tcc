<?php

// A landing page consulta cidades/reclamações, então precisa do schema migrado.
uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

it('returns a successful response', function () {
    $response = $this->get('/');

    $response->assertStatus(200);
});
