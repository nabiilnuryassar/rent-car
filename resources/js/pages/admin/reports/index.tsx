import { Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { LoadingWrapper } from '@/components/ui/loading-wrapper';
import { SkeletonTable } from '@/components/ui/skeleton';
import AdminLayout from '@/layouts/admin-layout';
import admin from '@/routes/admin';

type Order = {
    id: number;
    order_number: string;
    total_amount: number;
    updated_at: string;
    customer: { user: { name: string } };
    vehicle: { brand: string; model: string; category: { name: string } };
    payments: { amount: number; paid_at: string | null }[];
};

type Filters = { date_from: string; date_to: string };

type Props = {
    orders: {
        data: Order[];
        links: { url: string | null; label: string; active: boolean }[];
        total: number;
    };
    totalRevenue: number;
    totalTransactions: number;
    filters: Filters;
};

export default function ReportIndex({
    orders,
    totalRevenue,
    totalTransactions,
    filters,
}: Props) {
    const [isRouteLoading, setIsRouteLoading] = useState(false);
    const [localFrom, setLocalFrom] = useState(filters.date_from);
    const [localTo, setLocalTo] = useState(filters.date_to);

    function applyFilter(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setIsRouteLoading(true);
        router.get(
            admin.reports.index.url(),
            { date_from: localFrom, date_to: localTo },
            {
                preserveState: true,
                preserveScroll: true,
                onFinish: () => setIsRouteLoading(false),
            },
        );
    }

    function resetFilters() {
        setIsRouteLoading(true);
        router.get(
            admin.reports.index.url(),
            {},
            {
                preserveState: true,
                preserveScroll: true,
                onFinish: () => setIsRouteLoading(false),
            },
        );
    }

    return (
        <AdminLayout
            title="Laporan Keuangan"
            breadcrumbs={[
                { label: 'Dasbor', href: admin.dashboard.url() },
                { label: 'Laporan' },
            ]}
        >
            <form
                onSubmit={applyFilter}
                className="mb-6 flex flex-wrap items-end gap-3"
            >
                <div>
                    <label className="mb-1 block text-xs font-semibold">Dari Tanggal</label>
                    <input
                        name="date_from"
                        type="date"
                        value={localFrom}
                        onChange={(e) => setLocalFrom(e.target.value)}
                        className="rounded-full border border-slate-gray/20 bg-base-white px-4 py-2 text-sm outline-none"
                    />
                </div>
                <div>
                    <label className="mb-1 block text-xs font-semibold">Sampai Tanggal</label>
                    <input
                        name="date_to"
                        type="date"
                        value={localTo}
                        onChange={(e) => setLocalTo(e.target.value)}
                        className="rounded-full border border-slate-gray/20 bg-base-white px-4 py-2 text-sm outline-none"
                    />
                </div>
                <Button type="submit" variant="accent">Terapkan</Button>
                <Button type="button" variant="ghost" onClick={resetFilters}>Reset</Button>
            </form>

            <div className="mb-6 grid grid-cols-2 gap-4">
                <div className="rounded-2xl border border-slate-gray/15 bg-base-white p-6 shadow-rental">
                    <p className="text-xs font-semibold tracking-wide text-slate-gray uppercase">
                        Total Transaksi
                    </p>
                    <p className="mt-1 text-4xl font-extrabold">{totalTransactions}</p>
                </div>
                <div className="rounded-2xl border border-slate-gray/15 bg-base-white p-6 shadow-rental">
                    <p className="text-xs font-semibold tracking-wide text-slate-gray uppercase">
                        Total Pendapatan
                    </p>
                    <p className="mt-1 text-3xl font-extrabold">
                        Rp {totalRevenue.toLocaleString('id-ID')}
                    </p>
                </div>
            </div>

            <LoadingWrapper
                loading={isRouteLoading}
                skeleton={<SkeletonTable rows={6} columns={5} />}
            >
                <div className="overflow-hidden rounded-2xl border border-slate-gray/15 bg-base-white shadow-rental">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-slate-gray/15 bg-surface-gray/60 text-left text-xs font-semibold tracking-wide text-slate-gray uppercase">
                                <th className="px-5 py-4">Nomor Pesanan</th>
                                <th className="px-5 py-4">Pelanggan</th>
                                <th className="px-5 py-4">Kendaraan</th>
                                <th className="px-5 py-4">Selesai</th>
                                <th className="px-5 py-4">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.data.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-5 py-12 text-center text-slate-gray">
                                        Belum ada laporan untuk periode ini.
                                    </td>
                                </tr>
                            )}
                            {orders.data.map((o) => (
                                <tr key={o.id} className="border-b border-slate-gray/10 transition-colors hover:bg-surface-gray/40">
                                    <td className="px-5 py-3 font-mono text-xs">{o.order_number}</td>
                                    <td className="px-5 py-3">{o.customer.user.name}</td>
                                    <td className="px-5 py-3">{o.vehicle.brand} {o.vehicle.model}</td>
                                    <td className="px-5 py-3 text-xs">
                                        {new Date(o.updated_at).toLocaleDateString('id-ID')}
                                    </td>
                                    <td className="px-5 py-3 font-semibold">
                                        Rp {o.total_amount.toLocaleString('id-ID')}
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
