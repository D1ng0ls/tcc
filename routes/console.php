<?php

use Illuminate\Support\Facades\Schedule;

Schedule::command('app:calculate-ranking')->dailyAt('00:00')->withoutOverlapping();
