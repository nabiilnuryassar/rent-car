import { Head, Link } from '@inertiajs/react';
import customer from '@/routes/customer';

type Payment = { id: number; status: string; amount: number; receipt: { receipt_number: string } | null };
type ShuttleOrder = {
    id: number;
    order_number: string;
    status: string;
    total_amount: number;
    scheduled_at: string;
    pickup_address: string;
    destination_address: string;
    tariff: { area_from: string; area_to: string; estimated_distance_km: string; estimated_duration_minutes: number } | null;
    payments: Payment[];
};

export default function ShuttleOrderShow({ order }: { order: ShuttleOrder }) {
    const paidPayment = order.payments.find((p) => p.status === 'paid');

    return (
        <>
            <Head title={`Shuttle ${order.order_number} — FleetGo`} />
            <div className="min-h-screen bg-base-white p-6">
                <div className="mx-auto max-w-2xl">
                    <Link href={customer.shuttleOrders.index.url()} className="mb-4 inline-flex text-sm text-slate-gray hover:text-navy-blue">← Shuttle Order</Link>

                    <div className="mb-6 flex items-center justify-between rounded-[20px] bg-surface-gray p-6 shadow-rental">
                        <div>
                            <p className="font-mono text-xs text-slate-gray">{order.order_number}</p>
                            <p className="mt-1 text-2xl font-extrabold">Rp {order.total_amount.toLocaleString('id-ID')}</p>
                        </div>
                        <span className="rounded-full bg-amber-gold/20 px-4 py-2 text-sm font-bold capitalize">{order.status.replace(/_/g, ' ')}</span>
                    </div>

                    <div className="rounded-[20px] bg-surface-gray p-6 shadow-rental">
                        <h2 className="mb-4 font-bold">Detail Shuttle</h2>
                        <dl className="flex flex-col gap-2 text-sm">
                            {[
                                ['Rute', `${order.tariff?.area_from} → ${order.tariff?.area_to}`],
                                ['Jarak', `${order.tariff?.estimated_distance_km} km`],
                                ['Estimasi Durasi', `${order.tariff?.estimated_duration_minutes} menit`],
                                ['Penjemputan', order.pickup_address],
                                ['Tujuan', order.destination_address],
                                ['Jadwal', new Date(order.scheduled_at).toLocaleString('id-ID')],
                            ].map(([k, v]) => (
                                <div key={k} className="flex justify-between border-b border-slate-gray/20/50 pb-2">
                                    <dt className="text-slate-gray">{k}</dt>
                                    <dd className="font-medium text-right max-w-xs">{v}</dd>
                                </div>
                            ))}
                        </dl>
                    </div>

                    {paidPayment?.receipt && (
                        <div className="mt-4 rounded-[20px] bg-green-50 p-4 shadow-rental">
                            <p className="font-semibold text-success-green">✅ Pembayaran Terverifikasi</p>
                            <Link href={`/receipts/${paidPayment.receipt.receipt_number}`} className="mt-1 block text-sm underline text-success-green">
                                Lihat Kwitansi
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
