import { router, usePage } from '@inertiajs/react';
import { Car, CarFront, AlertTriangle } from 'lucide-react';
import KpiCard from '@/components/dashboard/KpiCard';
import RecentBookingsTable from '@/components/dashboard/RecentBookingsTable';
import TopHeader from '@/components/dashboard/TopHeader';
import TrendChart from '@/components/dashboard/TrendChart';
import { Button } from '@/components/ui/button';
import { useConfirm } from '@/components/ui/confirm-modal';
import AdminLayout from '@/layouts/admin-layout';
import admin from '@/routes/admin';

type Stats = {
    orders_today: number;
    pending_payment: number;
    waiting_verification: number;
    available_vehicles: number;
    in_use_vehicles: number;
    available_drivers: number;
    on_duty_drivers: number;
    mtd_revenue: number;
    maintenance_alerts: number;
};

type Payment = {
    id: number;
    status: string;
    amount: number;
    method: string;
    orderable: {
        id: number;
        customer: { user: { name: string } };
        order_number?: string;
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
    stats: Stats;
    recentOrders: RecentOrder[];
    quickVerifications: Payment[];
    trend: TrendPayload;
};

export default function AdminDashboard({
    stats,
    recentOrders,
    quickVerifications,
    trend,
}: Props) {
    const { auth } = usePage().props as { auth: { user: { name: string } } };
    const confirm = useConfirm();

    async function handleProcess(p: Payment) {
        if (!p.orderable) {
            return;
        }

        const ok = await confirm({
            title: 'Proses pembayaran ini?',
            description: (
                <span>
                    Anda akan diarahkan ke halaman detail verifikasi pembayaran{' '}
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

        // Since kasir does not have access to admin.orders.show, direct them to verification index
        router.visit(admin.payments.verification.index.url());
    }

    const kpiCards = [
        {
            label: 'Total Penyewaan Aktif',
            value: stats.in_use_vehicles,
            icon: <Car className="h-6 w-6" />,
            trendValue: '+8.6%',
            trendType: 'up' as const,
            trendLabel: 'minggu ini',
        },
        {
            label: 'Pendapatan (Bulan Berjalan)',
            value: `Rp ${stats.mtd_revenue.toLocaleString('id-ID')}`,
            icon: <span className="text-xl font-bold">Rp</span>,
            trendValue: '+12.6%',
            trendType: 'up' as const,
            trendLabel: 'dibandingkan bulan lalu',
        },
        {
            label: 'Kendaraan Tersedia',
            value: stats.available_vehicles,
            icon: <CarFront className="h-6 w-6" />,
            trendValue: '+5.3%',
            trendType: 'up' as const,
            trendLabel: 'minggu ini',
        },
        {
            label: 'Peringatan Perawatan',
            value: stats.maintenance_alerts.toString(),
            icon: <AlertTriangle className="h-6 w-6" />,
            trendValue: '+2',
            trendType: 'neutral' as const,
            trendLabel: 'sejak kemarin',
        },
    ];

    return (
        <AdminLayout title="Dasbor">
            <div className="flex flex-col gap-6">
                <TopHeader userName={auth.user?.name || 'Admin'} />

                {/* Ringkasan KPI */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                    {kpiCards.map((card) => (
                        <KpiCard key={card.label} {...card} />
                    ))}
                </div>

                {/* Middle Section: Chart and Ikhtisar Singkat */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <div className="lg:col-span-2">
                        <TrendChart range={trend.range} data={trend.data} />
                    </div>
                    <div>
                        <div className="h-full rounded-[20px] bg-surface-gray p-6 shadow-rental">
                            <h3 className="mb-4 font-bold">
                                Pesanan yang Perlu Diverifikasi
                            </h3>
                            {quickVerifications.length === 0 ? (
                                <p className="text-sm text-slate-gray">
                                    Tidak ada pembayaran menunggu verifikasi.
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
                                                    onClick={() => handleProcess(p)}
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

                {/* Pesanan Terbaru */}
                <RecentBookingsTable
                    orders={recentOrders}
                    viewAllUrl={admin.orders.index.url()}
                />
            </div>
        </AdminLayout>
    );
}
