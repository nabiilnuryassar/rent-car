import { Head, Link } from '@inertiajs/react';
import { formatOrderStatus } from '@/lib/labels';
import customer from '@/routes/customer';

type ShuttleOrder = {
    id: number;
    order_number: string;
    status: string;
    total_amount: number;
    scheduled_at: string;
    tariff: { area_from: string; area_to: string } | null;
    payments: { status: string; amount: number }[];
};

export default function ShuttleOrderIndex({ orders }: { orders: { data: ShuttleOrder[]; links: { url: string | null; label: string; active: boolean }[] } }) {
    return (
        <>
            <Head title="Pesanan Antar-Jemput - URBAN 8" />
            <div className="min-h-screen bg-base-white p-6">
                <div className="mx-auto max-w-3xl">
                    <div className="mb-6 flex items-center justify-between">
                        <h1 className="text-2xl font-bold">Pesanan Antar-Jemput</h1>
                        <Link href={customer.shuttleOrders.create.url()} className="rounded-full bg-amber-gold px-5 py-2 text-sm font-semibold hover:bg-yellow-300">
                            + Pesan Antar-Jemput
                        </Link>
                    </div>

                    {orders.data.length === 0 && (
                        <div className="rounded-[24px] bg-surface-gray p-12 text-center shadow-rental">
                            <p className="text-slate-gray">Belum ada pesanan antar-jemput.</p>
                        </div>
                    )}

                    <div className="flex flex-col gap-4">
                        {orders.data.map((o) => (
                            <Link key={o.id} href={customer.shuttleOrders.show.url(o.id)} className="rounded-[20px] bg-surface-gray p-6 shadow-rental hover:shadow-lg transition-shadow">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="font-mono text-xs text-slate-gray">{o.order_number}</p>
                                        <p className="mt-1 text-lg font-bold">{o.tariff?.area_from} - {o.tariff?.area_to}</p>
                                        <p className="mt-1 text-xs text-slate-gray">{new Date(o.scheduled_at).toLocaleString('id-ID')}</p>
                                    </div>
                                    <div className="text-right">
                                        <span className="rounded-full bg-amber-gold/20 px-3 py-1 text-xs font-bold">{formatOrderStatus(o.status)}</span>
                                        <p className="mt-3 text-xl font-extrabold">Rp {o.total_amount.toLocaleString('id-ID')}</p>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}
