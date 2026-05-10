<?php

namespace App\Enums;

enum VehicleStatus: string
{
    case Available = 'available';
    case Reserved = 'reserved';
    case InUse = 'in_use';
    case Maintenance = 'maintenance';
    case Inactive = 'inactive';
}
