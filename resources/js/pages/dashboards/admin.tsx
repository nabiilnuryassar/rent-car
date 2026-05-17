import { router, usePage } from '@inertiajs/react';
import {
    AlertTriangle,
    Banknote,
    Car,
    CarFront,
    Clock,
    CreditCard,
    Receipt,
} from 'lucide-react';
import KpiCard from '@/components/dashboard/KpiCard';
import RecentBookingsTable from '@/components/dashboard/RecentBookingsTable';
import TopHeader from '@/components/dashboard/TopHeader';
import TrendChart from '@/components/dashboard/TrendChart';
import { Button } from '@/components/ui/button';
import { useConfirm } from '@/components/ui/confirm-modal';
import AdminLayout from '@/layouts/admin-layout';
import admin from '@/routes/admin';

type AdminStats = {
    orders_today: number;
    pending_payment: number;
    waiting_verification: number;
    available_vehicles: number;
    in_use_vehicles: number;
    available_drivers: number;
    on_duty_drivers: number;
    mtd_revenue: number;
    last_month_revenue: number;
    revenue_growth_pct: number | null;
    maintenance_alerts: number;
    maintenance_delta: number;
    orders_this_week: number;
    orders_last_week: number;
    orders_growth_pct: number | null;
};

type CashierStats = {
    orders_today: number;
    pending_payment: number;
    waiting_verification: number;
    paid_today: number;
    paid_yesterday: number;
    mtd_revenue: number;
    last_month_revenue: number;
    revenue_growth_pct: number | null;
};

type Stats = AdminStats | CashierStats;

type Payment = {
    id: number;
    status: string;
    amount: number;
    method: string;
    orderable: {
        id: number;
        customer: { user: { name: string } };
        order_number?: string;
        total_amount?: number;
    };
    receipt: { receipt_number: string } | null;
    transfer_proof_url: string | null;
};

type RecentOrder = {
    id: number;
    order_number: string;
    status: string;
    total_amount: number;
    created_at: string;
    customer: { user: { name: string } };
    vehicle: { brand: string; model: string; category: { name: string } };
};

type TrendPoint = {
    name: string;
    period: string;
    rentals: number;
    revenue: number;
};

type TrendPayload = {
    range: '6m' | '12m';
    data: TrendPoint[];
};

type Props = {
    isAdmin: boolean;
    stats: Stats;
    recentOrders: RecentOrder[];
    quickVerifications: Payment[];
    pendingCash: Payment[];
    trend: TrendPayload;
};

export default function AdminDashboard({
    isAdmin,
    stats,
    recentOrders,
    quickVerifications,
    pendingCash,
    trend,
}: Props) {
    const { auth } = usePage().props as { auth: { user: { name: string } } };
    const confirm = useConfirm();

    async function handleProcessTransfer(p: Payment) {
        if (!p.orderable) {
            return;
        }

        const ok = await confirm({
            title: 'Buka halaman verifikasi pembayaran?',
            description: (
                <span>
                    Anda akan diarahkan ke halaman verifikasi untuk pesanan{' '}
                    <span className="font-semibold text-navy-blue">
                        {p.orderable.order_number ?? `#${p.orderable.id}`}
                    </span>
                    .
                </span>
            ),
            confirmLabel: 'Lanjutkan',
        });

        if (!ok) {
            return;
        }

        router.visit(admin.payments.verification.index.url() + '?tab=transfer');
    }

    async function handleProcessCash(p: Payment) {
        if (!p.orderable) {
            return;
        }

        const ok = await confirm({
            title: 'Catat pembayaran tunai?',
            description: (
                <span>
                    Anda akan diarahkan ke halaman pembayaran tunai untuk
                    pesanan{' '}
                    <span className="font-semibold text-navy-blue">
                        {p.orderable.order_number ?? `#${p.orderable.id}`}
                    </span>
                    .
                </span>
            ),
            confirmLabel: 'Lanjutkan',
        });

        if (!ok) {
            return;
        }

        router.visit(admin.payments.verification.index.url() + '?tab=cash');
    }

    const adminStats = stats as AdminStats;
    const cashierStats = stats as CashierStats;

    const formatPct = (pct: number | null | undefined): string => {
        if (pct === null || pct === undefined) {
            return '—';
        }

        const sign = pct > 0 ? '+' : '';

        return `${sign}${pct}%`;
    };

    const trendType = (
        delta: number | null | undefined,
    ): 'up' | 'down' | 'neutral' => {
        if (delta === null || delta === undefined || delta === 0) {
            return 'neutral';
        }

        return delta > 0 ? 'up' : 'down';
    };

    const paidDelta =
        (cashierStats.paid_today ?? 0) - (cashierStats.paid_yesterday ?? 0);

    const adminKpiCards = [
        {
            label: 'Total Penyewaan Aktif',
            value: adminStats.in_use_vehicles ?? 0,
            icon: <Car className="h-6 w-6" />,
            trendValue: formatPct(adminStats.orders_growth_pct),
            trendType: trendType(adminStats.orders_growth_pct),
            trendLabel: 'order minggu ini',
        },
        {
            label: 'Pendapatan (Bulan Berjalan)',
            value: `Rp ${(stats.mtd_revenue ?? 0).toLocaleString('id-ID')}`,
            icon: <span className="text-xl font-bold">Rp</span>,
            trendValue: formatPct(adminStats.revenue_growth_pct),
            trendType: trendType(adminStats.revenue_growth_pct),
            trendLabel: 'vs bulan lalu',
        },
        {
            label: 'Kendaraan Tersedia',
            value: adminStats.available_vehicles ?? 0,
            icon: <CarFront className="h-6 w-6" />,
            trendValue: `${adminStats.in_use_vehicles ?? 0} disewa`,
            trendType: 'neutral' as const,
            trendLabel: 'saat ini',
        },
        {
            label: 'Peringatan Perawatan',
            value: (adminStats.maintenance_alerts ?? 0).toString(),
            icon: <AlertTriangle className="h-6 w-6" />,
            trendValue:
                (adminStats.maintenance_delta ?? 0) > 0
                    ? `+${adminStats.maintenance_delta}`
                    : `${adminStats.maintenance_delta ?? 0}`,
            trendType: trendType(adminStats.maintenance_delta),
            trendLabel: 'sejak kemarin',
        },
    ];

    const cashierKpiCards = [
        {
            label: 'Menunggu Pembayaran',
            value: cashierStats.pending_payment ?? 0,
            icon: <Clock className="h-6 w-6" />,
            trendValue: 'tunai',
            trendType: 'neutral' as const,
            trendLabel: 'untuk dicatat',
        },
        {
            label: 'Menunggu Verifikasi',
            value: cashierStats.waiting_verification ?? 0,
            icon: <CreditCard className="h-6 w-6" />,
            trendValue: 'transfer',
            trendType: 'neutral' as const,
            trendLabel: 'untuk diverifikasi',
        },
        {
            label: 'Pembayaran Hari Ini',
            value: cashierStats.paid_today ?? 0,
            icon: <Receipt className="h-6 w-6" />,
            trendValue: paidDelta > 0 ? `+${paidDelta}` : `${paidDelta}`,
            trendType: trendType(paidDelta),
            trendLabel: 'vs kemarin',
        },
        {
            label: 'Pendapatan (Bulan Berjalan)',
            value: `Rp ${(stats.mtd_revenue ?? 0).toLocaleString('id-ID')}`,
            icon: <span className="text-xl font-bold">Rp</span>,
            trendValue: formatPct(cashierStats.revenue_growth_pct),
            trendType: trendType(cashierStats.revenue_growth_pct),
            trendLabel: 'vs bulan lalu',
        },
    ];

    const kpiCards = isAdmin ? adminKpiCards : cashierKpiCards;

    return (
        <AdminLayout title="Dasbor">
            <div className="flex flex-col gap-6">
                <TopHeader
                    userName={auth.user?.name ?? (isAdmin ? 'Admin' : 'Kasir')}
                />

                {/* KPI Summary */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                    {kpiCards.map((card) => (
                        <KpiCard key={card.label} {...card} />
                    ))}
                </div>

                {/* Middle Section */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {isAdmin && (
                        <div className="lg:col-span-2">
                            <TrendChart range={trend.range} data={trend.data} />
                        </div>
                    )}

                    <div className={isAdmin ? '' : 'lg:col-span-2'}>
                        <div className="h-full rounded-[20px] bg-surface-gray p-6 shadow-rental">
                            <h3 className="mb-4 flex items-center gap-2 font-bold">
                                <CreditCard className="h-5 w-5 text-amber-gold" />
                                Verifikasi Transfer
                            </h3>
                            {quickVerifications.length === 0 ? (
                                <p className="text-sm text-slate-gray">
                                    Tidak ada pembayaran transfer menunggu
                                    verifikasi.
                                </p>
                            ) : (
                                <div className="flex flex-col gap-3">
                                    {quickVerifications.map((p) => (
                                        <div
                                            key={p.id}
                                            className="flex flex-col gap-2 rounded-xl border border-slate-gray/20 bg-base-white p-3 shadow-sm"
                                        >
                                            <div className="flex justify-between text-sm">
                                                <span className="font-semibold">
                                                    {p.orderable?.customer?.user
                                                        ?.name ?? 'Pelanggan'}
                                                </span>
                                                <span className="font-bold text-navy-blue">
                                                    Rp{' '}
                                                    {p.amount.toLocaleString(
                                                        'id-ID',
                                                    )}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                {p.transfer_proof_url && (
                                                    <a
                                                        href={`/storage/${p.transfer_proof_url}`}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="text-xs text-blue-500 underline"
                                                    >
                                                        Lihat Bukti
                                                    </a>
                                                )}
                                                <div className="flex gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="primary"
                                                        onClick={() =>
                                                            handleProcessTransfer(
                                                                p,
                                                            )
                                                        }
                                                    >
                                                        Proses
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Cashier-only: pending cash widget */}
                {!isAdmin && (
                    <div className="rounded-[20px] bg-surface-gray p-6 shadow-rental">
                        <h3 className="mb-4 flex items-center gap-2 font-bold">
                            <Banknote className="h-5 w-5 text-amber-gold" />
                            Pembayaran Tunai Pending
                        </h3>
                        {pendingCash.length === 0 ? (
                            <p className="text-sm text-slate-gray">
                                Tidak ada pesanan menunggu pembayaran tunai.
                            </p>
                        ) : (
                            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                                {pendingCash.map((p) => (
                                    <div
                                        key={p.id}
                                        className="flex flex-col gap-2 rounded-xl border border-slate-gray/20 bg-base-white p-4 shadow-sm"
                                    >
                                        <div className="font-mono text-xs text-slate-gray">
                                            {p.orderable?.order_number ??
                                                `#${p.orderable?.id}`}
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="font-semibold">
                                                {p.orderable?.customer?.user
                                                    ?.name ?? 'Pelanggan'}
                                            </span>
                                        </div>
                                        <div className="text-base font-bold text-navy-blue">
                                            Rp{' '}
                                            {(
                                                p.orderable?.total_amount ??
                                                p.amount
                                            ).toLocaleString('id-ID')}
                                        </div>
                                        <Button
                                            size="sm"
                                            variant="primary"
                                            className="bg-amber-gold text-navy-blue hover:bg-yellow-400"
                                            onClick={() => handleProcessCash(p)}
                                        >
                                            <Banknote className="mr-1 h-4 w-4" />
                                            Catat Tunai
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Recent Orders \u2014 admin only */}
                {isAdmin && (
                    <RecentBookingsTable
                        orders={recentOrders}
                        viewAllUrl={admin.orders.index.url()}
                    />
                )}
            </div>
        </AdminLayout>
    );
}
