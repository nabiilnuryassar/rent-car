<?php

namespace App\Enums;

enum PaymentStatus: string
{
    case Unpaid = 'unpaid';
    case WaitingVerification = 'waiting_verification';
    case Rejected = 'rejected';
    case Paid = 'paid';
    case Refunded = 'refunded';
}
