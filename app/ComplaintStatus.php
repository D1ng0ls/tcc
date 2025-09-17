<?php

namespace App;

enum ComplaintStatus
{
    public const OPEN = 1;
    public const IN_PROGRESS = 2;
    public const ENDED = 3;
    public const SOLVED = 4;
    public const REJECTED = 5;
    public const CLOSED = 6;
}
