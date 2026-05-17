<?php

namespace App\Services\Dashboard;

use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Models\Payment;
use App\Models\RentalOrder;
use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;

class DashboardTrendService
{
    /**
     * Monthly rentals vs. revenue for the last N months (inclusive of current month).
     *
     * @return array<int, array{name: string, period: string, rentals: int, revenue: int}>
     */
    public function monthly(int $months = 6): array
    {
        $months = max(1, min(24, $months));

        $end = CarbonImmutable::now()->endOfMonth();
        $start = $end->subMonths($months - 1)->startOfMonth();

        $rentals = RentalOrder::query()
            ->select('created_at')
            ->whereNotIn('status', [OrderStatus::Cancelled->value])
            ->whereBetween('created_at', [$start, $end])
            ->get()
            ->groupBy(fn ($row) => Carbon::parse($row->created_at)->format('Y-m'))
            ->map(fn ($group) => $group->count());

        $revenue = Payment::query()
            ->select('paid_at', 'amount')
            ->where('status', PaymentStatus::Paid->value)
            ->whereNotNull('paid_at')
            ->whereBetween('paid_at', [$start, $end])
            ->get()
            ->groupBy(fn ($row) => Carbon::parse($row->paid_at)->format('Y-m'))
            ->map(fn ($group) => $group->sum('amount'));

        return $this->buildSeries($start, $end, $rentals, $revenue);
    }

    /**
     * @param  Collection<string, int|string>  $rentals
     * @param  Collection<string, int|string>  $revenue
     * @return array<int, array{name: string, period: string, rentals: int, revenue: int}>
     */
    private function buildSeries(CarbonImmutable $start, CarbonImmutable $end, Collection $rentals, Collection $revenue): array
    {
        $series = [];
        $cursor = $start;

        while ($cursor->lessThanOrEqualTo($end)) {
            $period = $cursor->format('Y-m');
            $series[] = [
                'name' => $cursor->locale(app()->getLocale())->isoFormat("MMM 'YY"),
                'period' => $period,
                'rentals' => (int) ($rentals[$period] ?? 0),
                'revenue' => (int) ($revenue[$period] ?? 0),
            ];
            $cursor = $cursor->addMonth()->startOfMonth();
        }

        return $series;
    }
}
