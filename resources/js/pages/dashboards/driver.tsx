import StatCard from '@/components/stat-card';
import AppLayout from '@/layouts/app-layout';

type DriverNotification = {
    id: string;
    type: string;
    data: {
        order_id?: number;
        order_number?: string;
        customer_name?: string | null;
        vehicle_label?: string | null;
        start_at?: string | null;
        pickup_option?: string | null;
        delivery_address?: string | null;
        dispatched_at?: string | null;
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

type DriverDashboardProps = {
    notifications: DriverNotification[];
    assignedOrders: AssignedOrder[];
};

function formatDate(value: string | null): string {
    if (!value) {
        return '-';
    }
    try {
        return new Date(value).toLocaleString();
    } catch {
        return value;
    }
}

export default function DriverDashboard({
    notifications,
    assignedOrders,
}: DriverDashboardProps) {
    const activeCount = assignedOrders.length;

    return (
        <AppLayout title="Dashboard Driver" eyebrow="Driver">
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                <StatCard
                    label="Jadwal aktif"
                    value={String(activeCount)}
                    detail={
                        activeCount > 0
                            ? 'Order yang sedang berjalan atau menunggu dispatch.'
                            : 'Belum ada penugasan.'
                    }
                />
                <StatCard
                    label="Notifikasi baru"
                    value={String(notifications.length)}
                    detail="Pesan belum dibaca."
                />
                <StatCard
                    label="Order selesai"
                    value="0"
                    detail="Belum ada layanan selesai."
                />
            </div>

            <section className="mt-8 rounded-[20px] bg-surface-gray p-6 shadow-rental">
                <h2 className="text-lg font-semibold">Notifikasi</h2>
                {notifications.length === 0 ? (
                    <p className="mt-4 text-sm text-slate-gray">
                        Tidak ada notifikasi baru.
                    </p>
                ) : (
                    <ul className="mt-4 divide-y divide-slate-200">
                        {notifications.map((notification) => (
                            <li key={notification.id} className="py-4">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <p className="text-sm font-semibold">
                                            {notification.type}
                                        </p>
                                        <p className="mt-1 text-sm">
                                            {notification.data.message ??
                                                `Order ${
                                                    notification.data
                                                        .order_number ?? ''
                                                } - ${
                                                    notification.data
                                                        .vehicle_label ?? ''
                                                }`}
                                        </p>
                                        <dl className="mt-2 grid gap-1 text-xs text-slate-gray sm:grid-cols-2">
                                            {notification.data
                                                .customer_name && (
                                                <div>
                                                    <dt className="inline font-medium">
                                                        Customer:{' '}
                                                    </dt>
                                                    <dd className="inline">
                                                        {
                                                            notification.data
                                                                .customer_name
                                                        }
                                                    </dd>
                                                </div>
                                            )}
                                            {notification.data.start_at && (
                                                <div>
                                                    <dt className="inline font-medium">
                                                        Mulai:{' '}
                                                    </dt>
                                                    <dd className="inline">
                                                        {formatDate(
                                                            notification.data
                                                                .start_at,
                                                        )}
                                                    </dd>
                                                </div>
                                            )}
                                            {notification.data
                                                .pickup_option && (
                                                <div>
                                                    <dt className="inline font-medium">
                                                        Pickup:{' '}
                                                    </dt>
                                                    <dd className="inline">
                                                        {
                                                            notification.data
                                                                .pickup_option
                                                        }
                                                    </dd>
                                                </div>
                                            )}
                                            {notification.data
                                                .delivery_address && (
                                                <div>
                                                    <dt className="inline font-medium">
                                                        Alamat:{' '}
                                                    </dt>
                                                    <dd className="inline">
                                                        {
                                                            notification.data
                                                                .delivery_address
                                                        }
                                                    </dd>
                                                </div>
                                            )}
                                        </dl>
                                    </div>
                                    <span className="shrink-0 text-xs text-slate-gray">
                                        {formatDate(notification.created_at)}
                                    </span>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </section>

            <section className="mt-6 rounded-[20px] bg-surface-gray p-6 shadow-rental">
                <h2 className="text-lg font-semibold">Order aktif</h2>
                {assignedOrders.length === 0 ? (
                    <p className="mt-4 text-sm text-slate-gray">
                        Belum ada order aktif.
                    </p>
                ) : (
                    <ul className="mt-4 divide-y divide-slate-200">
                        {assignedOrders.map((order) => (
                            <li key={order.id} className="py-4 text-sm">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <span className="font-semibold">
                                        {order.order_number}
                                    </span>
                                    <span className="rounded-full bg-white px-3 py-1 text-xs">
                                        {order.status}
                                    </span>
                                </div>
                                <p className="mt-1 text-slate-gray">
                                    {order.vehicle?.brand}{' '}
                                    {order.vehicle?.model} (
                                    {order.vehicle?.plate_number}) -{' '}
                                    {order.customer?.user?.name ?? '-'}
                                </p>
                                <p className="text-xs text-slate-gray">
                                    {formatDate(order.start_at)} →{' '}
                                    {formatDate(order.end_at)}
                                </p>
                            </li>
                        ))}
                    </ul>
                )}
            </section>
        </AppLayout>
    );
}
