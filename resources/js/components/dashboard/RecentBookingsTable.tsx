import { Link } from '@inertiajs/react';
import { ArrowRight, MoreVertical, Calendar } from 'lucide-react';
import { formatOrderStatus } from '@/lib/labels';
import admin from '@/routes/admin';
import Badge from '../ui/Badge';

type RecentOrder = {
    id: number;
    order_number: string;
    status: string;
    total_amount: number;
    created_at: string;
    customer: { user: { name: string } };
    vehicle: { brand: string; model: string; category: { name: string } };
};

type Props = {
    orders: RecentOrder[];
    viewAllUrl: string;
};

const getStatusColor = (status: string) => {
    switch (status) {
        case 'ongoing':
        case 'completed':
            return 'green';
        case 'pending_payment':
        case 'waiting_verification':
            return 'yellow';
        case 'waiting_overtime_payment':
            return 'red';
        case 'ready_to_dispatch':
            return 'blue';
        default:
            return 'gray';
    }
};

export default function RecentBookingsTable({ orders, viewAllUrl }: Props) {
    return (
        <div className="overflow-hidden rounded-[20px] bg-surface-gray shadow-rental">
            <div className="flex items-center justify-between px-6 py-5">
                <h2 className="font-bold text-navy-blue">Pesanan Terbaru</h2>
                <Link
                    href={viewAllUrl}
                    className="flex items-center gap-1 text-sm font-medium text-navy-blue hover:underline"
                >
                    <span>Lihat Semua Pesanan</span>
                    <ArrowRight className="h-4 w-4" />
                </Link>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-y border-slate-gray/20 bg-surface-gray text-left text-[11px] font-bold tracking-wider text-slate-gray uppercase">
                            <th className="px-6 py-3">Nomor Pesanan</th>
                            <th className="px-6 py-3">Pelanggan</th>
                            <th className="px-6 py-3">Model Kendaraan</th>
                            <th className="px-6 py-3">Periode</th>
                            <th className="px-6 py-3">Status</th>
                            <th className="px-6 py-3"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.length === 0 && (
                            <tr>
                                <td
                                    colSpan={6}
                                    className="px-6 py-10 text-center text-slate-gray"
                                >
                                    Belum ada pesanan terbaru.
                                </td>
                            </tr>
                        )}
                        {orders.map((order) => (
                            <tr
                                key={order.id}
                                className="border-slate-gray/20/30 border-b transition-colors hover:bg-base-white/30"
                            >
                                <td className="px-6 py-4 font-mono text-xs font-medium text-navy-blue">
                                    {order.order_number}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-base-white text-xs font-bold text-navy-blue">
                                            {order.customer.user.name
                                                .charAt(0)
                                                .toUpperCase()}
                                        </div>
                                        <span className="font-medium text-navy-blue">
                                            {order.customer.user.name}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-navy-blue">
                                    {order.vehicle.brand} {order.vehicle.model}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2 text-slate-gray">
                                        <Calendar className="h-4 w-4" />
                                        <span>
                                            {new Date(
                                                order.created_at,
                                            ).toLocaleDateString('id-ID', {
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric',
                                            })}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <Badge color={getStatusColor(order.status)}>
                                        {formatOrderStatus(order.status)}
                                    </Badge>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <Link
                                            href={admin.orders.show.url(
                                                order.order_number,
                                            )}
                                            className="rounded-full bg-navy-blue px-3 py-1 text-xs font-semibold text-white hover:opacity-90"
                                        >
                                            Perbarui Status
                                        </Link>
                                        <button className="hover:bg-slate-gray/20/50 rounded-full p-1.5 text-slate-gray transition-colors hover:text-navy-blue">
                                            <MoreVertical className="h-4 w-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
