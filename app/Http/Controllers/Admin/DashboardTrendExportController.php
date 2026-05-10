<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\Dashboard\DashboardTrendService;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

class DashboardTrendExportController extends Controller
{
    public function __construct(private readonly DashboardTrendService $trendService) {}

    public function __invoke(Request $request): StreamedResponse
    {
        $range = $request->string('range')->toString();
        $months = $range === '12m' ? 12 : 6;
        $series = $this->trendService->monthly($months);

        $filename = 'dashboard-trend-'.now()->format('Ymd-His').'.csv';

        return response()->streamDownload(function () use ($series): void {
            $handle = fopen('php://output', 'wb');

            // BOM so Excel opens UTF-8 correctly.
            fwrite($handle, chr(0xEF).chr(0xBB).chr(0xBF));

            fputcsv($handle, ['Period', 'Label', 'Total Rentals', 'Revenue (IDR)']);

            foreach ($series as $row) {
                fputcsv($handle, [
                    $row['period'],
                    $row['name'],
                    $row['rentals'],
                    $row['revenue'],
                ]);
            }

            fclose($handle);
        }, $filename, [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Cache-Control' => 'no-store, no-cache, must-revalidate',
        ]);
    }
}
