import { Head, Link } from '@inertiajs/react';
import CustomerLayout from '@/layouts/customer-layout';

type Order = {
    id: number;
    order_number: string;
    status: string;
    total_amount: number;
    start_at: string;
    end_at: string;
    vehicle: { brand: string; model: string; category: { name: string } };
    payments: { status: string; amount: number }[];
};

type Props = {
    orders: { data: Order[]; links: { url: string | null; label: string; active: boolean }[] };
};

const statusColors: Record<string, string> = {
    pending_payment: 'bg-yellow-100 text-yellow-700',
    waiting_verification: 'bg-orange-100 text-orange-700',
    ready_to_dispatch: 'bg-purple-100 text-purple-700',
    ongoing: 'bg-pale-green text-success-green',
    waiting_overtime_payment: 'bg-red-100 text-red-600',
    completed: 'bg-green-200 text-green-800',
    cancelled: 'bg-gray-100 text-gray-500',
};

export default function OrderIndex({ orders }: Props) {
    return (
        <CustomerLayout title="Pesanan Saya">
            <div className="mx-auto max-w-4xl">
                {/* Header Section */}
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-navy-blue">
                            Pesanan Saya
                        </h1>
                        <p className="mt-2 text-sm text-slate-gray">
                            Kelola dan pantau semua pesanan rental kendaraanmu di sini.
                        </p>
                    </div>
                </div>

                {orders.data.length === 0 ? (
                    <div className="rounded-[24px] bg-base-white p-12 text-center border border-slate-gray/10 shadow-sm">
                        <p className="text-base font-medium text-slate-gray mb-4">Kamu belum punya pesanan aktif.</p>
                        <Link 
                            href="/catalog"
                            className="inline-block rounded-full bg-navy-blue px-6 py-3 text-sm font-bold text-base-white shadow-md transition-all hover:bg-navy-blue/90"
                        >
                            Mulai Pesan Kendaraan
                        </Link>
                    </div>
                ) : (
                    <div className="flex flex-col gap-4">
                        {orders.data.map((order) => (
                            <Link key={order.id} href={`/orders/${order.id}`} className="block rounded-[24px] bg-base-white p-6 border border-slate-gray/10 shadow-sm hover:shadow-md hover:border-navy-blue/20 transition-all">
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                    <div>
                                        <div className="flex items-center gap-3 mb-2">
                                            <p className="font-mono text-xs font-bold text-navy-blue/60">{order.order_number}</p>
                                            <span className={`rounded-full px-3 py-1 text-[10px] font-bold capitalize ${statusColors[order.status] ?? 'bg-slate-gray/10 text-slate-gray'}`}>
                                                {order.status.replace(/_/g, ' ')}
                                            </span>
                                        </div>
                                        <h3 className="text-lg font-bold text-navy-blue">
                                            {order.vehicle.brand} {order.vehicle.model}
                                        </h3>
                                        <p className="text-sm font-medium text-slate-gray mb-2">
                                            {order.vehicle.category.name}
                                        </p>
                                        <p className="text-xs font-medium text-slate-gray flex items-center gap-2">
                                            <span className="flex items-center gap-1">
                                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                                {new Date(order.start_at).toLocaleDateString('id-ID', {day: 'numeric', month: 'short'})}
                                            </span>
                                            <span>→</span>
                                            <span className="flex items-center gap-1">
                                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                                {new Date(order.end_at).toLocaleDateString('id-ID', {day: 'numeric', month: 'short'})}
                                            </span>
                                        </p>
                                    </div>
                                    <div className="text-left sm:text-right">
                                        <p className="text-xs font-medium text-slate-gray mb-1">Total Biaya</p>
                                        <p className="text-xl font-extrabold text-navy-blue">
                                            Rp {order.total_amount.toLocaleString('id-ID')}
                                        </p>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}

                {orders.links.length > 3 && (
                    <div className="mt-8 flex justify-center gap-2">
                        {orders.links.map((link) => (
                            <Link 
                                key={link.label} 
                                href={link.url ?? '#'} 
                                className={`rounded-[12px] px-4 py-2 text-sm font-bold transition-all ${link.active ? 'bg-navy-blue text-base-white shadow-md' : 'bg-base-white text-slate-gray border border-slate-gray/10 hover:border-navy-blue/30 hover:text-navy-blue'}`} 
                                dangerouslySetInnerHTML={{ __html: link.label }} 
                            />
                        ))}
                    </div>
                )}
            </div>
        </CustomerLayout>
    );
}
