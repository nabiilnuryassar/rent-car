import { Link, router } from '@inertiajs/react';
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

type Props = {
    orders: { data: Order[]; links: { url: string | null; label: string; active: boolean }[]; total: number };
    totalRevenue: number;
    totalTransactions: number;
    filters: { date_from: string; date_to: string };
};

export default function ReportIndex({ orders, totalRevenue, totalTransactions, filters }: Props) {
    function applyFilter(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        router.get(admin.reports.index.url(), { date_from: fd.get('date_from'), date_to: fd.get('date_to') }, { preserveState: true });
    }

    return (
        <AdminLayout title="Laporan Keuangan">
            {/* Filter */}
            <form onSubmit={applyFilter} className="mb-6 flex flex-wrap items-end gap-3">
                <div>
                    <label className="mb-1 block text-xs font-semibold">Dari Tanggal</label>
                    <input name="date_from" type="date" defaultValue={filters.date_from} className="rounded-full border border-slate-gray/20 bg-surface-gray px-4 py-2 text-sm outline-none" />
                </div>
                <div>
                    <label className="mb-1 block text-xs font-semibold">Sampai Tanggal</label>
                    <input name="date_to" type="date" defaultValue={filters.date_to} className="rounded-full border border-slate-gray/20 bg-surface-gray px-4 py-2 text-sm outline-none" />
                </div>
                <button type="submit" className="rounded-full bg-amber-gold px-5 py-2 text-sm font-semibold text-navy-blue hover:bg-yellow-300">Terapkan</button>
            </form>

            {/* Kartu ringkasan */}
            <div className="mb-6 grid grid-cols-2 gap-4">
                <div className="rounded-[20px] bg-surface-gray p-6 shadow-rental">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-gray">Total Transaksi</p>
                    <p className="mt-1 text-4xl font-extrabold">{totalTransactions}</p>
                </div>
                <div className="rounded-[20px] bg-surface-gray p-6 shadow-rental">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-gray">Total Pendapatan</p>
                    <p className="mt-1 text-3xl font-extrabold">Rp {totalRevenue.toLocaleString('id-ID')}</p>
                </div>
            </div>

            {/* Tabel laporan */}
            <div className="rounded-[20px] bg-surface-gray shadow-rental overflow-hidden">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-slate-gray/20 text-left text-xs font-semibold uppercase tracking-wide text-slate-gray">
                            <th className="px-5 py-4">Nomor Pesanan</th>
                            <th className="px-5 py-4">Pelanggan</th>
                            <th className="px-5 py-4">Kendaraan</th>
                            <th className="px-5 py-4">Selesai</th>
                            <th className="px-5 py-4">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.data.length === 0 && <tr><td colSpan={5} className="px-5 py-12 text-center text-slate-gray">Belum ada laporan untuk periode ini.</td></tr>}
                        {orders.data.map((o) => (
                            <tr key={o.id} className="border-b border-slate-gray/20/50 hover:bg-base-white/40 transition-colors">
                                <td className="px-5 py-3 font-mono text-xs">{o.order_number}</td>
                                <td className="px-5 py-3">{o.customer.user.name}</td>
                                <td className="px-5 py-3">{o.vehicle.brand} {o.vehicle.model}</td>
                                <td className="px-5 py-3 text-xs">{new Date(o.updated_at).toLocaleDateString('id-ID')}</td>
                                <td className="px-5 py-3 font-semibold">Rp {o.total_amount.toLocaleString('id-ID')}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="mt-4 flex justify-center gap-1">
                {orders.links.map((link) => (
                    <Link key={link.label} href={link.url ?? '#'} className={`rounded-full px-4 py-2 text-sm ${link.active ? 'bg-amber-gold font-bold' : 'bg-surface-gray hover:bg-base-white'}`} dangerouslySetInnerHTML={{ __html: link.label }} />
                ))}
            </div>
        </AdminLayout>
    );
}
