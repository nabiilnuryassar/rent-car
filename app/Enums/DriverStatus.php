<?php

namespace App\Enums;

enum DriverStatus: string
{
    case Available = 'available';
    case Reserved = 'reserved';
    case OnDuty = 'on_duty';
    case OffDuty = 'off_duty';
    case Inactive = 'inactive';
}
