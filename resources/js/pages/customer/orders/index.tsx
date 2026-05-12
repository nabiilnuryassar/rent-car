import { Link, router } from '@inertiajs/react';
import { Calendar, CarFront, CreditCard, Eye, Package, Plus, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import CustomerLayout from '@/layouts/customer-layout';
import { LoadingWrapper } from '@/components/ui/loading-wrapper';
import { useConfirm } from '@/components/ui/confirm-modal';
import { toast } from '@/components/ui/toast';
import { formatOrderStatus } from '@/lib/labels';
import ordersRoute from '@/routes/customer/orders';

type Payment = { status: string; amount: number };

type Order = {
    id: number;
    order_number: string;
    status: string;
    total_amount: number;
    start_at: string;
    end_at: string;
    vehicle: {
        brand: string;
        model: string;
        images?: string[];
        category: { name: string };
    };
    payments: Payment[];
};

type PaginationLink = { url: string | null; label: string; active: boolean };

type Props = {
    orders: { data: Order[]; links: PaginationLink[] };
};

type StatusFilter =
    | 'all'
    | 'pending_payment'
    | 'waiting_verification'
    | 'paid'
    | 'ready_to_dispatch'
    | 'ongoing'
    | 'completed'
    | 'cancelled';

const STATUS_TABS: { value: StatusFilter; label: string }[] = [
    { value: 'all', label: 'Semua' },
    { value: 'pending_payment', label: 'Menunggu Bayar' },
    { value: 'waiting_verification', label: 'Verifikasi' },
    { value: 'paid', label: 'Dibayar' },
    { value: 'ready_to_dispatch', label: 'Siap Kirim' },
    { value: 'ongoing', label: 'Berjalan' },
    { value: 'completed', label: 'Selesai' },
    { value: 'cancelled', label: 'Dibatalkan' },
];

const statusStyles: Record<
    string,
    { bg: string; text: string; ring: string }
> = {
    pending_payment: {
        bg: 'bg-yellow-100',
        text: 'text-yellow-700',
        ring: 'ring-yellow-200',
    },
    waiting_verification: {
        bg: 'bg-orange-100',
        text: 'text-orange-700',
        ring: 'ring-orange-200',
    },
    paid: { bg: 'bg-blue-100', text: 'text-blue-700', ring: 'ring-blue-200' },
    ready_to_dispatch: {
        bg: 'bg-purple-100',
        text: 'text-purple-700',
        ring: 'ring-purple-200',
    },
    ongoing: {
        bg: 'bg-pale-green',
        text: 'text-success-green',
        ring: 'ring-green-200',
    },
    waiting_overtime_payment: {
        bg: 'bg-red-100',
        text: 'text-red-600',
        ring: 'ring-red-200',
    },
    completed: {
        bg: 'bg-green-200',
        text: 'text-green-800',
        ring: 'ring-green-300',
    },
    cancelled: {
        bg: 'bg-gray-100',
        text: 'text-gray-500',
        ring: 'ring-gray-200',
    },
};

const defaultStatusStyle = {
    bg: 'bg-slate-gray/10',
    text: 'text-slate-gray',
    ring: 'ring-slate-gray/20',
};

function formatCurrency(value: number) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(value);
}

function formatDateRange(start: string, end: string) {
    const s = new Date(start);
    const e = new Date(end);
    const opts: Intl.DateTimeFormatOptions = {
        day: 'numeric',
        month: 'short',
    };
    return `${s.toLocaleDateString('id-ID', opts)} - ${e.toLocaleDateString('id-ID', opts)}`;
}

function getVehicleImage(order: Order) {
    if (order.vehicle.images && order.vehicle.images.length > 0) {
        return `/storage/${order.vehicle.images[0]}`;
    }
    const name = order.vehicle.category.name.toLowerCase();
    if (name.includes('suv')) return '/images/mockup/suv.png';
    if (name.includes('mpv') || name.includes('minibus')) return '/images/mockup/mpv.png';
    return '/images/mockup/sedan.png';
}

export default function OrderIndex({ orders }: Props) {
    const confirm = useConfirm();
    const [activeStatus, setActiveStatus] = useState<StatusFilter>('all');
    const [isNavigating, setIsNavigating] = useState(false);

    useEffect(() => {
        const handleStart = () => setIsNavigating(true);
        const handleFinish = () => setIsNavigating(false);

        const rStart = router.on('start', handleStart);
        const rFinish = router.on('finish', handleFinish);

        return () => {
            rStart();
            rFinish();
        };
    }, []);

    const filtered = orders.data.filter((o) =>
        activeStatus === 'all' ? true : o.status === activeStatus,
    );

    const statusCount = (value: StatusFilter) =>
        value === 'all'
            ? orders.data.length
            : orders.data.filter((o) => o.status === value).length;

    const handleCancel = async (order: Order) => {
        const ok = await confirm({
            title: 'Batalkan pesanan?',
            description: `Pesanan ${order.order_number} akan dibatalkan dan tidak dapat dikembalikan.`,
            confirmLabel: 'Batalkan Pesanan',
            cancelLabel: 'Tutup',
            variant: 'danger',
        });

        if (!ok) {
            return;
        }

        router.post(
            ordersRoute.cancel.url({ order: order.id }),
            { reason: 'Dibatalkan oleh pelanggan' },
            {
                preserveScroll: true,
                onSuccess: () => toast.success('Pesanan berhasil dibatalkan'),
                onError: () => toast.error('Gagal membatalkan pesanan'),
            },
        );
    };

    const renderActionButtons = (order: Order) => {
        const canPay =
            order.status === 'pending_payment' &&
            order.payments.some(
                (p) => p.status === 'unpaid' || p.status === 'rejected',
            );

        const canCancel = [
            'pending_payment',
            'waiting_verification',
            'paid',
            'ready_to_dispatch',
        ].includes(order.status);

        return (
            <div className="flex flex-wrap items-center gap-2">
                <Link
                    href={ordersRoute.show.url({ order: order.id })}
                    className="inline-flex items-center gap-1.5 rounded-full border border-slate-gray/20 bg-base-white px-4 py-2 text-xs font-bold text-navy-blue shadow-sm transition-colors hover:border-navy-blue/40 hover:bg-surface-gray"
                >
                    <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                    Detail
                </Link>
                {canPay && (
                    <Link
                        href={ordersRoute.show.url({ order: order.id })}
                        className="inline-flex items-center gap-1.5 rounded-full bg-amber-gold px-4 py-2 text-xs font-bold text-navy-blue shadow-sm transition-colors hover:bg-amber-gold/90"
                    >
                        <CreditCard className="h-3.5 w-3.5" aria-hidden="true" />
                        Bayar
                    </Link>
                )}
                {canCancel && (
                    <button
                        type="button"
                        onClick={() => handleCancel(order)}
                        className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-base-white px-4 py-2 text-xs font-bold text-red-500 shadow-sm transition-colors hover:bg-red-50"
                    >
                        <XCircle className="h-3.5 w-3.5" aria-hidden="true" />
                        Batalkan
                    </button>
                )}
            </div>
        );
    };

    return (
        <CustomerLayout title="Pesanan Saya">
            <div className="mx-auto max-w-5xl">
                <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-navy-blue">
                            Pesanan Saya
                        </h1>
                        <p className="mt-2 text-sm text-slate-gray">
                            Kelola dan pantau seluruh pesanan penyewaan kendaraan Anda.
                        </p>
                    </div>
                    <Link
                        href="/catalog"
                        className="inline-flex items-center gap-2 self-start rounded-full bg-navy-blue px-5 py-3 text-sm font-bold text-base-white shadow-md transition-colors hover:bg-navy-blue/90 sm:self-auto"
                    >
                        <Plus className="h-4 w-4" aria-hidden="true" />
                        Pemesanan Baru
                    </Link>
                </div>

                {/* Status tabs */}
                <div className="mb-6 -mx-2 overflow-x-auto px-2 pb-1">
                    <div className="flex min-w-max items-center gap-2">
                        {STATUS_TABS.map((tab) => {
                            const isActive = activeStatus === tab.value;
                            const count = statusCount(tab.value);
                            return (
                                <button
                                    key={tab.value}
                                    type="button"
                                    onClick={() => setActiveStatus(tab.value)}
                                    className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-4 py-2 text-xs font-bold transition-colors ${
                                        isActive
                                            ? 'bg-navy-blue text-base-white shadow-sm'
                                            : 'bg-base-white text-slate-gray ring-1 ring-slate-gray/15 hover:text-navy-blue'
                                    }`}
                                >
                                    {tab.label}
                                    <span
                                        className={`inline-flex min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] ${
                                            isActive
                                                ? 'bg-base-white/20 text-base-white'
                                                : 'bg-surface-gray text-slate-gray'
                                        }`}
                                    >
                                        {count}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                <LoadingWrapper
                    loading={isNavigating}
                    skeleton={
                        <div className="flex flex-col gap-4">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <div
                                    key={i}
                                    className="h-44 animate-pulse rounded-2xl border border-slate-gray/10 bg-base-white"
                                />
                            ))}
                        </div>
                    }
                >
                    {filtered.length === 0 ? (
                        <div className="rounded-2xl border border-slate-gray/10 bg-base-white p-12 text-center shadow-sm">
                            <Package
                                className="mx-auto h-12 w-12 text-slate-gray/60"
                                aria-hidden="true"
                            />
                            <p className="mt-4 text-sm font-medium text-slate-gray">
                                {activeStatus === 'all'
                                    ? 'Anda belum memiliki pesanan aktif.'
                                    : 'Tidak ada pesanan pada status ini.'}
                            </p>
                            <Link
                                href="/catalog"
                                className="mt-6 inline-flex items-center gap-2 rounded-full bg-navy-blue px-6 py-3 text-sm font-bold text-base-white shadow-md transition-colors hover:bg-navy-blue/90"
                            >
                                <Plus className="h-4 w-4" aria-hidden="true" />
                                Mulai Pemesanan Kendaraan
                            </Link>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-4">
                            {filtered.map((order) => {
                                const style =
                                    statusStyles[order.status] ?? defaultStatusStyle;
                                return (
                                    <article
                                        key={order.id}
                                        className="rounded-2xl border border-slate-gray/10 bg-base-white p-5 shadow-sm transition-all hover:border-navy-blue/20 hover:shadow-md md:p-6"
                                    >
                                        <div className="flex flex-col gap-5 md:flex-row md:items-center">
                                            <div className="flex h-24 w-full shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-surface-gray p-2 md:h-28 md:w-40">
                                                <img
                                                    src={getVehicleImage(order)}
                                                    alt={`${order.vehicle.brand} ${order.vehicle.model}`}
                                                    className="h-full w-full object-contain drop-shadow-md"
                                                />
                                            </div>

                                            <div className="min-w-0 flex-1">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <p className="font-mono text-[11px] font-bold text-navy-blue/60">
                                                        {order.order_number}
                                                    </p>
                                                    <span
                                                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ring-1 ${style.bg} ${style.text} ${style.ring}`}
                                                    >
                                                        {formatOrderStatus(order.status)}
                                                    </span>
                                                </div>

                                                <h3 className="mt-1 truncate text-lg font-extrabold text-navy-blue">
                                                    {order.vehicle.brand} {order.vehicle.model}
                                                </h3>
                                                <p className="flex items-center gap-1.5 text-xs font-semibold text-slate-gray">
                                                    <CarFront
                                                        className="h-3.5 w-3.5"
                                                        aria-hidden="true"
                                                    />
                                                    {order.vehicle.category.name}
                                                </p>

                                                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-gray">
                                                    <span className="flex items-center gap-1.5">
                                                        <Calendar
                                                            className="h-3.5 w-3.5"
                                                            aria-hidden="true"
                                                        />
                                                        {formatDateRange(
                                                            order.start_at,
                                                            order.end_at,
                                                        )}
                                                    </span>
                                                    <span className="font-bold text-navy-blue">
                                                        Total{' '}
                                                        {formatCurrency(order.total_amount)}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="md:self-center">
                                                {renderActionButtons(order)}
                                            </div>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    )}
                </LoadingWrapper>

                {orders.links.length > 3 && (
                    <nav className="mt-8 flex justify-center gap-2">
                        {orders.links.map((link) => (
                            <Link
                                key={link.label}
                                href={link.url ?? '#'}
                                className={`rounded-xl px-4 py-2 text-sm font-bold transition-colors ${
                                    link.active
                                        ? 'bg-navy-blue text-base-white shadow-md'
                                        : 'border border-slate-gray/10 bg-base-white text-slate-gray hover:border-navy-blue/30 hover:text-navy-blue'
                                }`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </nav>
                )}
            </div>
        </CustomerLayout>
    );
}
