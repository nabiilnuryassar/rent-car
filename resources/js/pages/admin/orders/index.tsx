import { Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { LoadingWrapper } from '@/components/ui/loading-wrapper';
import { SkeletonTable } from '@/components/ui/skeleton';
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

type Filters = {
    status?: string;
    date_from?: string;
    date_to?: string;
    search?: string;
};

type Props = {
    orders: {
        data: Order[];
        links: { url: string | null; label: string; active: boolean }[];
    };
    filters: Filters;
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

const statuses = [
    'pending_payment',
    'waiting_verification',
    'ready_to_dispatch',
    'ongoing',
    'waiting_overtime_payment',
    'completed',
    'cancelled',
];

export default function OrderIndex({ orders, filters }: Props) {
    const [isRouteLoading, setIsRouteLoading] = useState(false);
    const [searchInput, setSearchInput] = useState(filters.search ?? '');

    function applyFilter(patch: Partial<Filters>) {
        setIsRouteLoading(true);
        router.get(
            admin.orders.index.url(),
            { ...filters, ...patch },
            {
                preserveState: true,
                preserveScroll: true,
                onFinish: () => setIsRouteLoading(false),
            },
        );
    }

    function resetFilters() {
        setSearchInput('');
        setIsRouteLoading(true);
        router.get(
            admin.orders.index.url(),
            {},
            {
                preserveState: true,
                preserveScroll: true,
                onFinish: () => setIsRouteLoading(false),
            },
        );
    }

    function submitSearch(e: React.FormEvent) {
        e.preventDefault();
        applyFilter({ search: searchInput || undefined });
    }

    const hasFilters = Boolean(
        filters.status || filters.date_from || filters.date_to || filters.search,
    );

    return (
        <AdminLayout
            title="Manajemen Pesanan"
            breadcrumbs={[
                { label: 'Dasbor', href: admin.dashboard.url() },
                { label: 'Pesanan' },
            ]}
        >
            <div className="mb-4 flex flex-wrap items-end gap-2">
                <form onSubmit={submitSearch} className="flex-1 min-w-[220px]">
                    <input
                        type="search"
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        placeholder="Cari no. pesanan atau nama pelanggan..."
                        className="w-full rounded-full border border-slate-gray/20 bg-base-white px-4 py-2 text-sm outline-none focus:border-amber-gold"
                    />
                </form>
                <select
                    value={filters.status ?? ''}
                    onChange={(e) => applyFilter({ status: e.target.value || undefined })}
                    className="rounded-full border border-slate-gray/20 bg-base-white px-4 py-2 text-sm outline-none focus:border-amber-gold"
                >
                    <option value="">Semua Status</option>
                    {statuses.map((s) => (
                        <option key={s} value={s}>
                            {formatOrderStatus(s)}
                        </option>
                    ))}
                </select>
                <div className="flex items-center gap-1 rounded-full border border-slate-gray/20 bg-base-white px-3 py-1 text-sm">
                    <span className="text-xs text-slate-gray">Dari</span>
                    <input
                        type="date"
                        value={filters.date_from ?? ''}
                        onChange={(e) => applyFilter({ date_from: e.target.value || undefined })}
                        className="bg-transparent text-sm outline-none"
                    />
                </div>
                <div className="flex items-center gap-1 rounded-full border border-slate-gray/20 bg-base-white px-3 py-1 text-sm">
                    <span className="text-xs text-slate-gray">Sampai</span>
                    <input
                        type="date"
                        value={filters.date_to ?? ''}
                        onChange={(e) => applyFilter({ date_to: e.target.value || undefined })}
                        className="bg-transparent text-sm outline-none"
                    />
                </div>
                {hasFilters && (
                    <Button variant="ghost" size="sm" onClick={resetFilters}>
                        Reset
                    </Button>
                )}
            </div>

            <LoadingWrapper
                loading={isRouteLoading}
                skeleton={<SkeletonTable rows={6} columns={7} />}
            >
                <div className="overflow-hidden rounded-2xl border border-slate-gray/15 bg-base-white shadow-rental">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-slate-gray/15 bg-surface-gray/60 text-left text-xs font-semibold tracking-wide text-slate-gray uppercase">
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
                                    <td colSpan={7} className="px-5 py-12 text-center text-slate-gray">
                                        Belum ada pesanan yang cocok.
                                    </td>
                                </tr>
                            )}
                            {orders.data.map((o) => (
                                <tr key={o.id} className="border-b border-slate-gray/10 transition-colors hover:bg-surface-gray/40">
                                    <td className="px-5 py-3 font-mono text-xs">{o.order_number}</td>
                                    <td className="px-5 py-3">{o.customer.user.name}</td>
                                    <td className="px-5 py-3">{o.vehicle.brand} {o.vehicle.model}</td>
                                    <td className="px-5 py-3 text-xs">
                                        {new Date(o.start_at).toLocaleDateString('id-ID')}
                                    </td>
                                    <td className="px-5 py-3">
                                        <span className={`rounded-full px-2 py-1 text-xs font-bold capitalize ${statusColors[o.status] ?? 'bg-gray-100'}`}>
                                            {formatOrderStatus(o.status)}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3">
                                        Rp {o.total_amount.toLocaleString('id-ID')}
                                    </td>
                                    <td className="px-5 py-3">
                                        <Link
                                            href={admin.orders.show.url(o.order_number)}
                                            className="rounded-full border border-slate-gray/20 bg-base-white px-3 py-1 text-xs transition-colors hover:bg-surface-gray"
                                        >
                                            Detail
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </LoadingWrapper>

            <div className="mt-4 flex justify-center gap-1">
                {orders.links.map((link) => (
                    <Link
                        key={link.label}
                        href={link.url ?? '#'}
                        className={`rounded-full px-4 py-2 text-sm ${link.active ? 'bg-amber-gold font-bold' : 'bg-base-white hover:bg-surface-gray'}`}
                        dangerouslySetInnerHTML={{ __html: link.label }}
                    />
                ))}
            </div>
        </AdminLayout>
    );
}
