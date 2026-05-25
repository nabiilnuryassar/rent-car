import { router } from '@inertiajs/react';
import {
    Activity,
    Calendar,
    CalendarCheck,
    CheckCircle2,
    ChevronRight,
    Clock,
    Pause,
    Play,
} from 'lucide-react';
import { ActiveOrderHero } from '@/components/driver/ActiveOrderHero';
import type { FeaturedOrder } from '@/components/driver/ActiveOrderHero';
import DriverLayout from '@/layouts/driver-layout';
import { formatOrderStatus, formatPickupOption } from '@/lib/labels';
import driver from '@/routes/driver';

type DriverInfo = {
    id: number;
    license_number: string | null;
    phone: string | null;
    status: string | null;
    professional_title: string | null;
} | null;

type DriverStats = {
    active_count: number;
    today_count: number;
    completed_count: number;
    unread_notifications: number;
};

type Props = {
    driver: DriverInfo;
    stats: DriverStats;
    assignedOrders: FeaturedOrder[];
    featuredOrder?: FeaturedOrder | null;
};

function StatusPill({ status }: { status: string | null }) {
    const map: Record<
        string,
        { label: string; tone: string; icon: typeof Play }
    > = {
        available: {
            label: 'Tersedia',
            tone: 'bg-success-green text-white',
            icon: Play,
        },
        on_duty: {
            label: 'Bertugas',
            tone: 'bg-amber-gold text-navy-blue',
            icon: Activity,
        },
        reserved: {
            label: 'Dipesan',
            tone: 'bg-blue-500 text-white',
            icon: Clock,
        },
        off_duty: {
            label: 'Off',
            tone: 'bg-slate-gray text-white',
            icon: Pause,
        },
        inactive: {
            label: 'Tidak Aktif',
            tone: 'bg-red-500 text-white',
            icon: Pause,
        },
    };

    const cfg = map[status ?? 'off_duty'] ?? map.off_duty;
    const Icon = cfg.icon;

    return (
        <span
            className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${cfg.tone}`}
        >
            <Icon className="h-3 w-3" />
            {cfg.label}
        </span>
    );
}

export default function DriverDashboard({
    driver: driverInfo,
    stats,
    assignedOrders,
    featuredOrder,
}: Props) {
    return (
        <DriverLayout
            title="Dasbor"
            eyebrow={driverInfo?.professional_title ?? 'Pengemudi'}
            headline="Selamat datang"
            notificationCount={stats.unread_notifications}
        >
            {/* Status Banner */}
            <div className="mb-5 flex items-center justify-between rounded-2xl bg-base-white p-4 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-gold/20">
                        <Activity className="h-5 w-5 text-amber-gold" />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold tracking-wider text-slate-gray uppercase">
                            Status Saat Ini
                        </p>
                        <StatusPill status={driverInfo?.status ?? null} />
                    </div>
                </div>
                <button
                    type="button"
                    onClick={() => router.visit(driver.status.index.url())}
                    className="rounded-full bg-navy-blue px-4 py-2 text-xs font-bold text-base-white"
                >
                    Ubah
                </button>
            </div>

            <ActiveOrderHero
                order={featuredOrder ?? assignedOrders[0] ?? null}
            />

            {/* KPI Cards */}
            <div className="mb-6 grid grid-cols-3 gap-3">
                <div className="rounded-2xl bg-navy-blue p-4 text-base-white shadow-sm">
                    <Calendar className="mb-2 h-5 w-5 text-amber-gold" />
                    <p className="text-2xl font-extrabold">
                        {stats.today_count}
                    </p>
                    <p className="text-[10px] font-semibold tracking-wide uppercase opacity-80">
                        Hari Ini
                    </p>
                </div>
                <div className="rounded-2xl bg-base-white p-4 shadow-sm">
                    <Clock className="mb-2 h-5 w-5 text-amber-gold" />
                    <p className="text-2xl font-extrabold text-navy-blue">
                        {stats.active_count}
                    </p>
                    <p className="text-[10px] font-semibold tracking-wide text-slate-gray uppercase">
                        Aktif
                    </p>
                </div>
                <div className="rounded-2xl bg-base-white p-4 shadow-sm">
                    <CheckCircle2 className="mb-2 h-5 w-5 text-success-green" />
                    <p className="text-2xl font-extrabold text-navy-blue">
                        {stats.completed_count}
                    </p>
                    <p className="text-[10px] font-semibold tracking-wide text-slate-gray uppercase">
                        Selesai
                    </p>
                </div>
            </div>

            {/* Active Orders Quick List */}
            <section className="mb-6 rounded-2xl bg-base-white p-5 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="flex items-center gap-2 text-sm font-bold text-navy-blue">
                        <CalendarCheck className="h-4 w-4 text-amber-gold" />
                        Pesanan Aktif
                    </h2>
                    <button
                        type="button"
                        onClick={() => router.visit(driver.orders.index.url())}
                        className="flex items-center gap-1 text-[11px] font-bold text-amber-gold"
                    >
                        Lihat semua
                        <ChevronRight className="h-3 w-3" />
                    </button>
                </div>
                {assignedOrders.length === 0 ? (
                    <p className="py-6 text-center text-xs text-slate-gray">
                        Tidak ada pesanan aktif.
                    </p>
                ) : (
                    <ul className="flex flex-col gap-3">
                        {assignedOrders.map((order) => (
                            <li
                                key={order.id}
                                className="flex flex-col gap-2 rounded-xl border border-slate-gray/10 bg-surface-gray p-3 transition-colors active:bg-slate-gray/10"
                                onClick={() =>
                                    router.visit(
                                        driver.orders.show.url(
                                            order.order_number,
                                        ),
                                    )
                                }
                                role="button"
                            >
                                <div className="flex items-center justify-between">
                                    <span className="font-mono text-[11px] font-bold text-slate-gray">
                                        {order.order_number}
                                    </span>
                                    <span className="rounded-full bg-amber-gold/20 px-2 py-0.5 text-[10px] font-bold text-amber-gold">
                                        {formatOrderStatus(order.status)}
                                    </span>
                                </div>
                                <p className="text-sm font-bold text-navy-blue">
                                    {order.vehicle?.brand}{' '}
                                    {order.vehicle?.model}
                                </p>
                                <div className="flex items-center justify-between text-[11px] text-slate-gray">
                                    <span>
                                        {order.customer?.user?.name ?? '-'}
                                    </span>
                                    <span className="font-semibold">
                                        {order.start_at
                                            ? new Intl.DateTimeFormat('id-ID', {
                                                  day: 'numeric',
                                                  month: 'short',
                                                  hour: '2-digit',
                                                  minute: '2-digit',
                                              }).format(new Date(order.start_at))
                                            : '-'}
                                    </span>
                                </div>
                                {order.pickup_option && (
                                    <span className="text-[10px] text-slate-gray italic">
                                        {formatPickupOption(
                                            order.pickup_option,
                                        )}
                                        {order.delivery_address
                                            ? ` ‒ ${order.delivery_address}`
                                            : ''}
                                    </span>
                                )}
                            </li>
                        ))}
                    </ul>
                )}
            </section>

        </DriverLayout>
    );
}
