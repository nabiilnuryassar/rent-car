<?php

namespace App\Enums;

enum PickupOption: string
{
    case PickupAtOffice = 'pickup_at_office';
    case DeliverToCustomer = 'deliver_to_customer';
}
