import { Link, router } from '@inertiajs/react';
import {
    Calendar,
    CarFront,
    CheckCircle2,
    CreditCard,
    Eye,
    Package,
    Plus,
    XCircle,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useConfirm } from '@/components/ui/confirm-modal';
import { LoadingWrapper } from '@/components/ui/loading-wrapper';
import { Pagination } from '@/components/ui/pagination';
import { toast } from '@/components/ui/toast';
import CustomerLayout from '@/layouts/customer-layout';
import { formatOrderStatus } from '@/lib/labels';
import ordersRoute from '@/routes/customer/orders';
import type { Paginated } from '@/types/pagination';

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

type Props = {
    orders: Paginated<Order>;
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

const statusStyles: Record<string, { bg: string; text: string; dot: string }> =
    {
        pending_payment: {
            bg: 'bg-yellow-50',
            text: 'text-yellow-700',
            dot: 'bg-yellow-400',
        },
        waiting_verification: {
            bg: 'bg-orange-50',
            text: 'text-orange-700',
            dot: 'bg-orange-400',
        },
        paid: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-400' },
        ready_to_dispatch: {
            bg: 'bg-purple-50',
            text: 'text-purple-700',
            dot: 'bg-purple-400',
        },
        ongoing: {
            bg: 'bg-pale-green',
            text: 'text-success-green',
            dot: 'bg-success-green',
        },
        waiting_overtime_payment: {
            bg: 'bg-red-50',
            text: 'text-red-600',
            dot: 'bg-red-400',
        },
        completed: {
            bg: 'bg-green-50',
            text: 'text-green-700',
            dot: 'bg-green-500',
        },
        cancelled: {
            bg: 'bg-gray-50',
            text: 'text-gray-500',
            dot: 'bg-gray-400',
        },
    };

const defaultStatusStyle = {
    bg: 'bg-surface-gray',
    text: 'text-slate-gray',
    dot: 'bg-slate-gray',
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
        year: 'numeric',
    };

    return `${s.toLocaleDateString('id-ID', opts)} — ${e.toLocaleDateString('id-ID', opts)}`;
}

function getVehicleImage(order: Order) {
    if (order.vehicle.images && order.vehicle.images.length > 0) {
        return `/storage/${order.vehicle.images[0]}`;
    }

    const name = order.vehicle.category.name.toLowerCase();

    if (name.includes('suv')) {
        return '/images/mockup/suv.png';
    }

    if (name.includes('mpv') || name.includes('minibus')) {
        return '/images/mockup/mpv.png';
    }

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
                    className="inline-flex min-h-[44px] items-center gap-1.5 rounded-full border border-slate-gray/20 bg-base-white px-3 text-xs font-bold text-navy-blue transition-all hover:border-navy-blue/40 hover:bg-surface-gray sm:px-4"
                >
                    <Eye className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    <span className="hidden sm:inline">Detail</span>
                </Link>
                {canPay && (
                    <Link
                        href={ordersRoute.show.url({ order: order.id })}
                        className="inline-flex min-h-[44px] items-center gap-1.5 rounded-full bg-amber-gold px-3 text-xs font-bold text-navy-blue transition-all hover:bg-amber-gold/90 sm:px-4"
                    >
                        <CreditCard
                            className="h-3.5 w-3.5 shrink-0"
                            aria-hidden="true"
                        />
                        <span className="hidden sm:inline">Bayar</span>
                    </Link>
                )}
                {canCancel && (
                    <button
                        type="button"
                        onClick={() => handleCancel(order)}
                        className="inline-flex min-h-[44px] items-center gap-1.5 rounded-full border border-red-200 bg-base-white px-3 text-xs font-bold text-red-500 transition-all hover:bg-red-50 sm:px-4"
                    >
                        <XCircle
                            className="h-3.5 w-3.5 shrink-0"
                            aria-hidden="true"
                        />
                        <span className="hidden sm:inline">Batalkan</span>
                    </button>
                )}
            </div>
        );
    };

    return (
        <CustomerLayout title="Pesanan Saya">
            <div className="mx-auto max-w-5xl">
                {/* Page header */}
                <div className="mb-8 flex items-start justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-extrabold tracking-tight text-navy-blue sm:text-3xl">
                            Pesanan Saya
                        </h1>
                        <p className="mt-1 text-sm text-slate-gray">
                            Pantau dan kelola seluruh penyewaan kendaraan Anda.
                        </p>
                    </div>
                    <Link
                        href="/catalog"
                        className="inline-flex shrink-0 items-center gap-2 rounded-full bg-navy-blue px-4 py-3.5 text-xs font-bold text-base-white shadow-md transition-all hover:-translate-y-0.5 hover:bg-navy-blue/90 sm:px-5 sm:text-sm"
                    >
                        <Plus className="h-4 w-4" aria-hidden="true" />
                        <span className="hidden sm:inline">Pemesanan Baru</span>
                        <span className="sm:hidden">Baru</span>
                    </Link>
                </div>

                {/* Status tabs — horizontally scrollable on mobile */}
                <div className="-mx-6 mb-6 overflow-x-auto px-6 pb-1 sm:-mx-0 sm:px-0">
                    <div className="flex min-w-max items-center gap-2">
                        {STATUS_TABS.map((tab) => {
                            const isActive = activeStatus === tab.value;
                            const count = statusCount(tab.value);

                            return (
                                <button
                                    key={tab.value}
                                    type="button"
                                    onClick={() => setActiveStatus(tab.value)}
                                    className={`inline-flex min-h-[44px] items-center gap-1.5 rounded-full px-3.5 py-2.5 text-xs font-bold whitespace-nowrap transition-all sm:px-4 ${
                                        isActive
                                            ? 'bg-navy-blue text-base-white shadow-sm'
                                            : 'bg-base-white text-slate-gray ring-1 ring-slate-gray/15 hover:text-navy-blue'
                                    }`}
                                >
                                    {tab.label}
                                    {count > 0 && (
                                        <span
                                            className={`inline-flex min-w-[18px] items-center justify-center rounded-full px-1 text-[10px] font-bold ${
                                                isActive
                                                    ? 'bg-base-white/20 text-base-white'
                                                    : 'bg-surface-gray text-slate-gray'
                                            }`}
                                        >
                                            {count}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Order list */}
                <LoadingWrapper
                    loading={isNavigating}
                    skeleton={
                        <div className="flex flex-col gap-4">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <div
                                    key={i}
                                    className="h-36 animate-pulse rounded-2xl border border-slate-gray/10 bg-base-white sm:h-44"
                                />
                            ))}
                        </div>
                    }
                >
                    {filtered.length === 0 ? (
                        <div className="rounded-2xl border border-slate-gray/10 bg-base-white p-10 text-center shadow-sm sm:p-16">
                            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-surface-gray">
                                <Package
                                    className="h-8 w-8 text-slate-gray/50"
                                    aria-hidden="true"
                                />
                            </div>
                            <p className="mt-4 text-sm font-semibold text-navy-blue">
                                {activeStatus === 'all'
                                    ? 'Belum ada pesanan'
                                    : 'Tidak ada pesanan pada status ini'}
                            </p>
                            <p className="mt-1 text-xs text-slate-gray">
                                Mulai perjalanan baru dari katalog kendaraan
                                kami.
                            </p>
                            <Link
                                href="/catalog"
                                className="mt-6 inline-flex items-center gap-2 rounded-full bg-navy-blue px-6 py-3 text-sm font-bold text-base-white shadow-md transition-all hover:-translate-y-0.5 hover:bg-navy-blue/90"
                            >
                                <Plus className="h-4 w-4" aria-hidden="true" />
                                Mulai Pemesanan
                            </Link>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-3 sm:gap-4">
                            {filtered.map((order) => {
                                const style =
                                    statusStyles[order.status] ??
                                    defaultStatusStyle;

                                return (
                                    <article
                                        key={order.id}
                                        className="group rounded-2xl border border-slate-gray/10 bg-base-white shadow-sm transition-all hover:border-navy-blue/20 hover:shadow-md"
                                    >
                                        <div className="flex items-stretch gap-0">
                                            {/* Vehicle image — left column */}
                                            <div className="flex w-20 shrink-0 items-center justify-center overflow-hidden rounded-l-2xl bg-surface-gray p-2 sm:w-32">
                                                <img
                                                    src={getVehicleImage(order)}
                                                    alt={`${order.vehicle.brand} ${order.vehicle.model}`}
                                                    className="h-full w-full object-contain drop-shadow-md transition-transform group-hover:scale-105"
                                                />
                                            </div>

                                            {/* Content — right column */}
                                            <div className="flex min-w-0 flex-1 flex-col justify-between gap-3 p-4 sm:p-5">
                                                {/* Top row: order number + status badge */}
                                                <div className="flex flex-wrap items-center justify-between gap-2">
                                                    <p className="font-mono text-[10px] font-bold tracking-wider text-navy-blue/50 sm:text-[11px]">
                                                        {order.order_number}
                                                    </p>
                                                    <span
                                                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold ${style.bg} ${style.text}`}
                                                    >
                                                        <span
                                                            className={`h-1.5 w-1.5 rounded-full ${style.dot}`}
                                                        />
                                                        {formatOrderStatus(
                                                            order.status,
                                                        )}
                                                    </span>
                                                </div>

                                                {/* Vehicle name + category */}
                                                <div>
                                                    <h3 className="truncate text-base leading-tight font-extrabold text-navy-blue sm:text-lg">
                                                        {order.vehicle.brand}{' '}
                                                        {order.vehicle.model}
                                                    </h3>
                                                    <p className="mt-0.5 flex items-center gap-1 text-xs font-semibold text-slate-gray">
                                                        <CarFront
                                                            className="h-3.5 w-3.5 shrink-0"
                                                            aria-hidden="true"
                                                        />
                                                        {
                                                            order.vehicle
                                                                .category.name
                                                        }
                                                    </p>
                                                </div>

                                                {/* Bottom row: date + total + actions */}
                                                <div className="flex flex-wrap items-center justify-between gap-2">
                                                    <div className="flex flex-col gap-1">
                                                        <span className="flex min-w-0 items-center gap-1.5 text-[11px] text-slate-gray sm:text-xs">
                                                            <Calendar
                                                                className="h-3.5 w-3.5 shrink-0"
                                                                aria-hidden="true"
                                                            />
                                                            <span className="truncate">
                                                                {formatDateRange(
                                                                    order.start_at,
                                                                    order.end_at,
                                                                )}
                                                            </span>
                                                        </span>
                                                        <span className="text-xs font-extrabold text-navy-blue sm:text-sm">
                                                            {formatCurrency(
                                                                order.total_amount,
                                                            )}
                                                        </span>
                                                    </div>
                                                    {renderActionButtons(order)}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Completed ribbon */}
                                        {order.status === 'completed' && (
                                            <div className="flex items-center gap-2 rounded-b-2xl border-t border-green-100 bg-green-50 px-4 py-2.5">
                                                <CheckCircle2
                                                    className="h-4 w-4 shrink-0 text-green-600"
                                                    aria-hidden="true"
                                                />
                                                <p className="text-xs font-semibold text-green-700">
                                                    Perjalanan selesai — terima
                                                    kasih telah menggunakan
                                                    URBAN 8.
                                                </p>
                                            </div>
                                        )}
                                    </article>
                                );
                            })}
                        </div>
                    )}
                </LoadingWrapper>

                <Pagination
                    links={orders.links}
                    currentPage={orders.current_page}
                    lastPage={orders.last_page}
                />
            </div>
        </CustomerLayout>
    );
}
