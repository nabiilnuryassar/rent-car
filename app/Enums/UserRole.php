<?php

namespace App\Enums;

enum UserRole: string
{
    case Admin = 'admin';
    case Cashier = 'kasir';
    case Customer = 'customer';
    case Driver = 'driver';
}
