import { Link } from '@inertiajs/react';
import { Calendar, ChevronRight, History, MapPin } from 'lucide-react';
import { useState } from 'react';
import DriverLayout from '@/layouts/driver-layout';
import { formatOrderStatus, formatPickupOption } from '@/lib/labels';
import driver from '@/routes/driver';

type Order = {
    id: number;
    order_number: string;
    status: string;
    start_at: string | null;
    end_at: string | null;
    actual_return_at: string | null;
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
    activeOrders: Order[];
    completedOrders: Order[];
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

function statusTone(status: string): string {
    switch (status) {
        case 'ongoing':
            return 'bg-amber-gold text-navy-blue';
        case 'ready_to_dispatch':
            return 'bg-blue-500 text-white';
        case 'completed':
            return 'bg-success-green text-white';
        case 'cancelled':
            return 'bg-red-500 text-white';
        case 'waiting_overtime_payment':
            return 'bg-orange-500 text-white';
        default:
            return 'bg-slate-gray text-white';
    }
}

function OrderCard({ order }: { order: Order }) {
    return (
        <Link
            href={driver.orders.show.url(order.order_number)}
            className="block rounded-2xl border border-slate-gray/10 bg-base-white p-4 shadow-sm transition-transform active:scale-[0.98]"
        >
            <div className="mb-2 flex items-center justify-between">
                <span className="font-mono text-[11px] font-bold text-slate-gray">
                    {order.order_number}
                </span>
                <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${statusTone(order.status)}`}
                >
                    {formatOrderStatus(order.status)}
                </span>
            </div>
            <p className="text-base font-bold text-navy-blue">
                {order.vehicle?.brand} {order.vehicle?.model}
            </p>
            <p className="text-xs text-slate-gray">
                {order.vehicle?.plate_number} ‒ {order.customer?.user?.name ?? '-'}
            </p>
            <div className="mt-3 flex items-center justify-between text-[11px] text-slate-gray">
                <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatDate(order.start_at)}
                </span>
                <ChevronRight className="h-4 w-4 text-amber-gold" />
            </div>
            {order.pickup_option && (
                <div className="mt-2 flex items-center gap-1 rounded-lg bg-surface-gray px-2 py-1 text-[10px] text-slate-gray">
                    <MapPin className="h-3 w-3" />
                    {formatPickupOption(order.pickup_option)}
                    {order.delivery_address && ` ‒ ${order.delivery_address}`}
                </div>
            )}
        </Link>
    );
}

export default function DriverOrdersIndex({
    activeOrders,
    completedOrders,
}: Props) {
    const [tab, setTab] = useState<'active' | 'history'>('active');

    const visible = tab === 'active' ? activeOrders : completedOrders;

    return (
        <DriverLayout title="Pesanan" headline="Pesanan Saya">
            {/* Tabs */}
            <div className="mb-5 grid grid-cols-2 gap-2 rounded-full bg-base-white p-1 shadow-sm">
                <button
                    type="button"
                    onClick={() => setTab('active')}
                    className={`rounded-full py-2 text-xs font-bold transition-all ${
                        tab === 'active'
                            ? 'bg-navy-blue text-base-white shadow'
                            : 'text-slate-gray'
                    }`}
                >
                    Aktif ({activeOrders.length})
                </button>
                <button
                    type="button"
                    onClick={() => setTab('history')}
                    className={`flex items-center justify-center gap-1 rounded-full py-2 text-xs font-bold transition-all ${
                        tab === 'history'
                            ? 'bg-navy-blue text-base-white shadow'
                            : 'text-slate-gray'
                    }`}
                >
                    <History className="h-3 w-3" />
                    Riwayat ({completedOrders.length})
                </button>
            </div>

            {/* List */}
            {visible.length === 0 ? (
                <div className="flex flex-col items-center gap-2 rounded-2xl bg-base-white p-10 text-center shadow-sm">
                    <Calendar className="h-10 w-10 text-slate-gray/40" />
                    <p className="text-sm font-semibold text-slate-gray">
                        {tab === 'active'
                            ? 'Tidak ada pesanan aktif'
                            : 'Belum ada riwayat pesanan'}
                    </p>
                </div>
            ) : (
                <div className="flex flex-col gap-3">
                    {visible.map((order) => (
                        <OrderCard key={order.id} order={order} />
                    ))}
                </div>
            )}
        </DriverLayout>
    );
}
