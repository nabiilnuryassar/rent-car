<?php

namespace App\Enums;

enum OrderStatus: string
{
    case Draft = 'draft';
    case PendingPayment = 'pending_payment';
    case WaitingVerification = 'waiting_verification';
    case Paid = 'paid';
    case ReadyToDispatch = 'ready_to_dispatch';
    case Ongoing = 'ongoing';
    case WaitingOvertimePayment = 'waiting_overtime_payment';
    case Completed = 'completed';
    case Cancelled = 'cancelled';
}
