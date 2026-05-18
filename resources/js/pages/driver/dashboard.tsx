import { router } from '@inertiajs/react';
import {
    Activity,
    Bell,
    Calendar,
    CalendarCheck,
    CheckCircle2,
    ChevronRight,
    Clock,
    Pause,
    Play,
} from 'lucide-react';
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

type Notification = {
    id: string;
    type: string;
    data: {
        order_number?: string;
        customer_name?: string | null;
        vehicle_label?: string | null;
        pickup_option?: string | null;
        delivery_address?: string | null;
        message?: string | null;
    };
    read_at: string | null;
    created_at: string | null;
};

type AssignedOrder = {
    id: number;
    order_number: string;
    status: string;
    start_at: string | null;
    end_at: string | null;
    pickup_option: string | null;
    delivery_address: string | null;
    customer?: { user?: { name?: string } | null } | null;
    vehicle?: {
        brand?: string;
        model?: string;
        plate_number?: string;
    } | null;
};

type Props = {
    driver: DriverInfo;
    stats: DriverStats;
    notifications: Notification[];
    assignedOrders: AssignedOrder[];
};

function formatDate(value: string | null): string {
    if (!value) {
        return '-';
    }

    try {
        return new Date(value).toLocaleString('id-ID', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
        });
    } catch {
        return value;
    }
}

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
    notifications,
    assignedOrders,
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
                                        {formatDate(order.start_at)}
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

            {/* Notifications */}
            <section className="rounded-2xl bg-base-white p-5 shadow-sm">
                <h2 className="mb-4 flex items-center gap-2 text-sm font-bold text-navy-blue">
                    <Bell className="h-4 w-4 text-amber-gold" />
                    Notifikasi Terbaru
                    {notifications.length > 0 && (
                        <span className="rounded-full bg-amber-gold px-2 py-0.5 text-[10px] font-bold text-navy-blue">
                            {notifications.length}
                        </span>
                    )}
                </h2>
                {notifications.length === 0 ? (
                    <p className="py-6 text-center text-xs text-slate-gray">
                        Tidak ada notifikasi baru.
                    </p>
                ) : (
                    <ul className="flex flex-col gap-3">
                        {notifications.slice(0, 5).map((notif) => (
                            <li
                                key={notif.id}
                                className="rounded-xl border-l-4 border-amber-gold bg-surface-gray p-3"
                            >
                                <p className="text-xs font-bold text-navy-blue">
                                    {notif.data.message ??
                                        `Pesanan ${notif.data.order_number ?? ''}`}
                                </p>
                                <div className="mt-1 flex flex-wrap gap-x-3 text-[11px] text-slate-gray">
                                    {notif.data.customer_name && (
                                        <span>
                                            👤 {notif.data.customer_name}
                                        </span>
                                    )}
                                    {notif.data.vehicle_label && (
                                        <span>
                                            🚗 {notif.data.vehicle_label}
                                        </span>
                                    )}
                                </div>
                                <p className="mt-1 text-[10px] text-slate-gray">
                                    {formatDate(notif.created_at)}
                                </p>
                            </li>
                        ))}
                    </ul>
                )}
            </section>
        </DriverLayout>
    );
}
