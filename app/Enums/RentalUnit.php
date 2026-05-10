<?php

namespace App\Enums;

enum RentalUnit: string
{
    case Hour = 'hour';
    case Day = 'day';
    case Week = 'week';
    case Month = 'month';
}
