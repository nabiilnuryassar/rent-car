import { Link, router } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin-layout';
import { formatOrderStatus } from '@/lib/labels';
import admin from '@/routes/admin';

type Order = {
    id: number;
    order_number: string;
    status: string;
    total_amount: number;
    start_at: string;
    end_at: string;
    actual_return_at: string | null;
    customer: { user: { name: string } };
    vehicle: { brand: string; model: string; plate_number: string };
    driver: { user: { name: string } } | null;
    payments: { status: string; amount: number }[];
};

type Props = {
    orders: {
        data: Order[];
        links: { url: string | null; label: string; active: boolean }[];
    };
    filters: { status?: string };
};

const statusColors: Record<string, string> = {
    pending_payment: 'bg-yellow-100 text-yellow-700',
    waiting_verification: 'bg-orange-100 text-orange-700',
    paid: 'bg-blue-100 text-blue-700',
    ready_to_dispatch: 'bg-purple-100 text-purple-700',
    ongoing: 'bg-pale-green text-success-green',
    waiting_overtime_payment: 'bg-red-100 text-red-600',
    completed: 'bg-green-200 text-green-800',
    cancelled: 'bg-gray-100 text-gray-500',
};

export default function OrderIndex({ orders, filters }: Props) {
    const statuses = [
        'pending_payment',
        'waiting_verification',
        'ready_to_dispatch',
        'ongoing',
        'waiting_overtime_payment',
        'completed',
        'cancelled',
    ];

    return (
        <AdminLayout title="Manajemen Pesanan">
            <div className="mb-6">
                <select
                    value={filters.status ?? ''}
                    onChange={(e) =>
                        router.get(
                            admin.orders.index.url(),
                            { status: e.target.value },
                            { preserveState: true },
                        )
                    }
                    className="rounded-full border border-slate-gray/20 bg-surface-gray px-4 py-2 text-sm outline-none"
                >
                    <option value="">Semua Status</option>
                    {statuses.map((s) => (
                        <option key={s} value={s}>
                            {formatOrderStatus(s)}
                        </option>
                    ))}
                </select>
            </div>

            <div className="overflow-hidden rounded-[20px] bg-surface-gray shadow-rental">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-slate-gray/20 text-left text-xs font-semibold tracking-wide text-slate-gray uppercase">
                            <th className="px-5 py-4">Nomor Pesanan</th>
                            <th className="px-5 py-4">Pelanggan</th>
                            <th className="px-5 py-4">Kendaraan</th>
                            <th className="px-5 py-4">Mulai</th>
                            <th className="px-5 py-4">Status</th>
                            <th className="px-5 py-4">Total</th>
                            <th className="px-5 py-4">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.data.length === 0 && (
                            <tr>
                                <td
                                    colSpan={7}
                                    className="px-5 py-12 text-center text-slate-gray"
                                >
                                    Belum ada pesanan.
                                </td>
                            </tr>
                        )}
                        {orders.data.map((o) => (
                            <tr
                                key={o.id}
                                className="border-slate-gray/20/50 border-b transition-colors hover:bg-base-white/40"
                            >
                                <td className="px-5 py-3 font-mono text-xs">
                                    {o.order_number}
                                </td>
                                <td className="px-5 py-3">
                                    {o.customer.user.name}
                                </td>
                                <td className="px-5 py-3">
                                    {o.vehicle.brand} {o.vehicle.model}
                                </td>
                                <td className="px-5 py-3 text-xs">
                                    {new Date(o.start_at).toLocaleDateString(
                                        'id-ID',
                                    )}
                                </td>
                                <td className="px-5 py-3">
                                    <span
                                        className={`rounded-full px-2 py-1 text-xs font-bold capitalize ${statusColors[o.status] ?? 'bg-gray-100'}`}
                                    >
                                        {formatOrderStatus(o.status)}
                                    </span>
                                </td>
                                <td className="px-5 py-3">
                                    Rp {o.total_amount.toLocaleString('id-ID')}
                                </td>
                                <td className="px-5 py-3">
                                    <Link
                                        href={admin.orders.show.url(
                                            o.order_number,
                                        )}
                                        className="rounded-full border border-slate-gray/20 px-3 py-1 text-xs transition-colors hover:bg-base-white"
                                    >
                                        Detail
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="mt-4 flex justify-center gap-1">
                {orders.links.map((link) => (
                    <Link
                        key={link.label}
                        href={link.url ?? '#'}
                        className={`rounded-full px-4 py-2 text-sm ${link.active ? 'bg-amber-gold font-bold' : 'bg-surface-gray hover:bg-base-white'}`}
                        dangerouslySetInnerHTML={{ __html: link.label }}
                    />
                ))}
            </div>
        </AdminLayout>
    );
}
