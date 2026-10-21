<?php

use Illuminate\Support\Facades\Schedule;

// Meia-noite no horário de Brasília (o app roda em UTC). Disparado pelo laço do deploy/entrypoint.sh.
Schedule::command('app:calculate-ranking')->dailyAt('00:00')->timezone('America/Sao_Paulo')->withoutOverlapping();
