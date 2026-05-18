import { Link } from '@inertiajs/react';
import {
    ArrowLeft,
    Calendar,
    Car,
    CreditCard,
    MapPin,
    Phone,
    Receipt,
    User,
} from 'lucide-react';
import DriverLayout from '@/layouts/driver-layout';
import {
    formatOrderStatus,
    formatPaymentMethod,
    formatPaymentStatus,
    formatPickupOption,
} from '@/lib/labels';
import driver from '@/routes/driver';

type Order = {
    id: number;
    order_number: string;
    status: string;
    start_at: string | null;
    end_at: string | null;
    actual_return_at: string | null;
    total_amount: number;
    pickup_option: string | null;
    delivery_address: string | null;
    customer?: {
        user?: { name?: string };
        phone?: string;
        address?: string;
    } | null;
    vehicle?: {
        brand?: string;
        model?: string;
        plate_number?: string;
        category?: { name?: string } | null;
    } | null;
    driver?: {
        user?: { name?: string };
    } | null;
    payments?: Array<{
        id: number;
        amount: number;
        method: string;
        status: string;
        receipt: { receipt_number: string } | null;
    }>;
};

type Props = {
    order: Order;
};

function formatDate(value: string | null): string {
    if (!value) {
        return '-';
    }

    try {
        return new Date(value).toLocaleString('id-ID', {
            weekday: 'short',
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

export default function DriverOrderShow({ order }: Props) {
    return (
        <DriverLayout
            title={order.order_number}
            headline={`Detail ${order.order_number}`}
        >
            <Link
                href={driver.orders.index.url()}
                className="mb-4 inline-flex items-center gap-1 text-xs font-bold text-amber-gold"
            >
                <ArrowLeft className="h-3 w-3" />
                Kembali ke daftar
            </Link>

            {/* Status Header */}
            <div className="mb-5 rounded-2xl bg-base-white p-5 shadow-sm">
                <div className="mb-3 flex items-center justify-between">
                    <span className="font-mono text-xs text-slate-gray">
                        {order.order_number}
                    </span>
                    <span
                        className={`rounded-full px-3 py-1 text-[10px] font-bold ${statusTone(order.status)}`}
                    >
                        {formatOrderStatus(order.status)}
                    </span>
                </div>
                <p className="text-2xl font-extrabold text-navy-blue">
                    Rp {order.total_amount.toLocaleString('id-ID')}
                </p>
            </div>

            {/* Schedule */}
            <section className="mb-4 rounded-2xl bg-base-white p-5 shadow-sm">
                <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-navy-blue">
                    <Calendar className="h-4 w-4 text-amber-gold" />
                    Jadwal Layanan
                </h3>
                <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                        <span className="text-slate-gray">Mulai:</span>
                        <span className="font-bold text-navy-blue">
                            {formatDate(order.start_at)}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-slate-gray">Selesai:</span>
                        <span className="font-bold text-navy-blue">
                            {formatDate(order.end_at)}
                        </span>
                    </div>
                    {order.actual_return_at && (
                        <div className="flex justify-between">
                            <span className="text-slate-gray">
                                Pengembalian aktual:
                            </span>
                            <span className="font-bold text-navy-blue">
                                {formatDate(order.actual_return_at)}
                            </span>
                        </div>
                    )}
                </div>
            </section>

            {/* Customer */}
            <section className="mb-4 rounded-2xl bg-base-white p-5 shadow-sm">
                <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-navy-blue">
                    <User className="h-4 w-4 text-amber-gold" />
                    Pelanggan
                </h3>
                <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                        <span className="text-slate-gray">Nama:</span>
                        <span className="font-bold text-navy-blue">
                            {order.customer?.user?.name ?? '-'}
                        </span>
                    </div>
                    {order.customer?.phone && (
                        <div className="flex items-center justify-between">
                            <span className="text-slate-gray">Telepon:</span>
                            <a
                                href={`tel:${order.customer.phone}`}
                                className="flex items-center gap-1 font-bold text-amber-gold"
                            >
                                <Phone className="h-3 w-3" />
                                {order.customer.phone}
                            </a>
                        </div>
                    )}
                    {order.customer?.address && (
                        <div className="flex flex-col gap-1">
                            <span className="text-slate-gray">Alamat:</span>
                            <span className="font-medium text-navy-blue">
                                {order.customer.address}
                            </span>
                        </div>
                    )}
                </div>
            </section>

            {/* Vehicle */}
            <section className="mb-4 rounded-2xl bg-base-white p-5 shadow-sm">
                <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-navy-blue">
                    <Car className="h-4 w-4 text-amber-gold" />
                    Kendaraan
                </h3>
                <p className="text-base font-bold text-navy-blue">
                    {order.vehicle?.brand} {order.vehicle?.model}
                </p>
                <p className="text-xs text-slate-gray">
                    {order.vehicle?.plate_number}
                    {order.vehicle?.category?.name &&
                        ` ‒ ${order.vehicle.category.name}`}
                </p>
            </section>

            {/* Pickup */}
            {order.pickup_option && (
                <section className="mb-4 rounded-2xl bg-base-white p-5 shadow-sm">
                    <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-navy-blue">
                        <MapPin className="h-4 w-4 text-amber-gold" />
                        Titik Penjemputan
                    </h3>
                    <p className="text-sm font-semibold text-navy-blue">
                        {formatPickupOption(order.pickup_option)}
                    </p>
                    {order.delivery_address && (
                        <p className="mt-1 text-xs text-slate-gray">
                            {order.delivery_address}
                        </p>
                    )}
                </section>
            )}

            {/* Payments */}
            {order.payments && order.payments.length > 0 && (
                <section className="mb-4 rounded-2xl bg-base-white p-5 shadow-sm">
                    <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-navy-blue">
                        <CreditCard className="h-4 w-4 text-amber-gold" />
                        Pembayaran
                    </h3>
                    <ul className="flex flex-col gap-3">
                        {order.payments.map((payment) => (
                            <li
                                key={payment.id}
                                className="rounded-xl bg-surface-gray p-3"
                            >
                                <div className="flex items-center justify-between text-xs">
                                    <span className="font-bold text-navy-blue">
                                        Rp{' '}
                                        {payment.amount.toLocaleString('id-ID')}
                                    </span>
                                    <span className="text-[10px] font-bold text-slate-gray uppercase">
                                        {formatPaymentMethod(payment.method)}
                                    </span>
                                </div>
                                <div className="mt-1 flex items-center justify-between text-[11px]">
                                    <span className="text-slate-gray">
                                        {formatPaymentStatus(payment.status)}
                                    </span>
                                    {payment.receipt && (
                                        <a
                                            href={`/receipts/${payment.receipt.receipt_number}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="flex items-center gap-1 font-bold text-amber-gold"
                                        >
                                            <Receipt className="h-3 w-3" />
                                            Kuitansi
                                        </a>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                </section>
            )}

            <p className="px-2 py-4 text-center text-[11px] text-slate-gray">
                Pembaruan status dispatch & return dilakukan oleh Admin. Hubungi
                admin jika ada perubahan rencana.
            </p>
        </DriverLayout>
    );
}
