<?php

use Illuminate\Support\Facades\Schedule;

Schedule::command('app:calculate-ranking')->monthlyOn(1, '02:00')->withoutOverlapping();
