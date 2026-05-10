import { useForm, router, Link } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin-layout';
import admin from '@/routes/admin';

type Payment = {
    id: number;
    status: string;
    amount: number;
    method: string;
    paid_at: string | null;
    receipt: { receipt_number: string } | null;
    transfer_proof_url: string | null;
};

type Order = {
    id: number;
    order_number: string;
    status: string;
    total_amount: number;
    start_at: string;
    end_at: string;
    actual_return_at: string | null;
    is_out_of_town: boolean;
    pickup_option: string;
    delivery_address: string | null;
    customer: { user: { name: string; email: string } };
    vehicle: {
        brand: string;
        model: string;
        plate_number: string;
        category: { name: string };
    };
    driver: {
        user: { name: string };
        phone: string;
        license_number: string;
    } | null;
    payments: Payment[];
};

const canDispatch = (order: Order) => order.status === 'ready_to_dispatch';
const canReturn = (order: Order) => order.status === 'ongoing';
const canComplete = (order: Order) =>
    order.status === 'waiting_overtime_payment';

export default function OrderShow({ order }: { order: Order }) {
    const { data, setData, processing } = useForm({ actual_return_at: '' });

    function dispatch() {
        if (!confirm('Konfirmasi dispatch kendaraan?')) {
            return;
        }

        router.post(admin.orders.dispatch.url(order.order_number));
    }

    function processReturn(e: React.FormEvent) {
        e.preventDefault();
        router.post(admin.orders.return.url(order.order_number), {
            actual_return_at: data.actual_return_at,
        });
    }

    function complete() {
        if (!confirm('Selesaikan order ini?')) {
            return;
        }

        router.post(admin.orders.complete.url(order.order_number));
    }

    function approvePayment(paymentId: number) {
        if (confirm('Setujui pembayaran ini?')) {
            router.post(admin.payments.approve.url(paymentId));
        }
    }

    function rejectPayment(paymentId: number) {
        const reason = prompt('Alasan penolakan:');

        if (reason) {
            router.post(admin.payments.reject.url(paymentId), {
                rejection_reason: reason,
            });
        }
    }

    return (
        <AdminLayout title={`Order: ${order.order_number}`}>
            <div className="mb-4">
                <Link
                    href={admin.orders.index.url()}
                    className="text-sm text-slate-gray hover:text-navy-blue"
                >
                    ← Kembali ke Daftar Order
                </Link>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                {/* Order Info */}
                <div className="rounded-[20px] bg-surface-gray p-6 shadow-rental">
                    <h3 className="mb-4 font-bold">Informasi Order</h3>
                    <dl className="flex flex-col gap-2 text-sm">
                        {[
                            ['No. Order', order.order_number],
                            [
                                'Status',
                                <span
                                    key="s"
                                    className="rounded-full bg-amber-gold/20 px-2 py-0.5 text-xs font-bold"
                                >
                                    {order.status.replace(/_/g, ' ')}
                                </span>,
                            ],
                            ['Customer', order.customer.user.name],
                            ['Email', order.customer.user.email],
                            [
                                'Kendaraan',
                                `${order.vehicle.brand} ${order.vehicle.model} (${order.vehicle.plate_number})`,
                            ],
                            ['Kategori', order.vehicle.category.name],
                            ['Pengemudi', order.driver?.user.name ?? '-'],
                            ['SIM', order.driver?.license_number ?? '-'],
                            [
                                'Mulai',
                                new Date(order.start_at).toLocaleString(
                                    'id-ID',
                                ),
                            ],
                            [
                                'Selesai (rencana)',
                                new Date(order.end_at).toLocaleString('id-ID'),
                            ],
                            [
                                'Kembali (aktual)',
                                order.actual_return_at
                                    ? new Date(
                                          order.actual_return_at,
                                      ).toLocaleString('id-ID')
                                    : '-',
                            ],
                            [
                                'Luar Kota',
                                order.is_out_of_town ? 'Ya' : 'Tidak',
                            ],
                            ['Pickup', order.pickup_option.replace(/_/g, ' ')],
                            ['Alamat Antar', order.delivery_address ?? '-'],
                            [
                                'Total',
                                `Rp ${order.total_amount.toLocaleString('id-ID')}`,
                            ],
                        ].map(([key, val]) => (
                            <div
                                key={String(key)}
                                className="border-slate-gray/20/50 flex items-start justify-between gap-4 border-b pb-2"
                            >
                                <dt className="text-slate-gray">{key}</dt>
                                <dd className="text-right font-medium">
                                    {val}
                                </dd>
                            </div>
                        ))}
                    </dl>
                </div>

                <div className="flex flex-col gap-6">
                    {/* Payment Info */}
                    <div className="rounded-[20px] bg-surface-gray p-6 shadow-rental">
                        <h3 className="mb-4 font-bold">Pembayaran</h3>
                        {order.payments.length === 0 ? (
                            <p className="text-sm text-slate-gray">
                                Belum ada data pembayaran.
                            </p>
                        ) : (
                            <div className="flex flex-col gap-2">
                                {order.payments.map((p) => (
                                    <div
                                        key={p.id}
                                        className="flex items-center justify-between rounded-[12px] border border-slate-gray/20 p-3 text-sm"
                                    >
                                        <div>
                                            <p className="font-semibold">
                                                Rp{' '}
                                                {p.amount.toLocaleString(
                                                    'id-ID',
                                                )}
                                            </p>
                                            <p className="text-xs text-slate-gray capitalize">
                                                {p.method?.replace('_', ' ')} ·{' '}
                                                {p.status.replace(/_/g, ' ')}
                                            </p>
                                        </div>
                                        {p.receipt ? (
                                            <Link
                                                href={`/receipts/${p.receipt.receipt_number}`}
                                                className="text-xs text-slate-gray underline"
                                            >
                                                Kwitansi
                                            </Link>
                                        ) : p.status ===
                                          'waiting_verification' ? (
                                            <div className="flex items-center gap-2">
                                                {p.transfer_proof_url && (
                                                    <a
                                                        href={`/storage/${p.transfer_proof_url}`}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="text-xs text-blue-500 underline hover:text-blue-700"
                                                    >
                                                        Lihat Bukti
                                                    </a>
                                                )}
                                                <button
                                                    onClick={() =>
                                                        approvePayment(p.id)
                                                    }
                                                    className="rounded bg-green-500 px-2 py-1 text-xs text-white hover:bg-green-600"
                                                >
                                                    Setujui
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        rejectPayment(p.id)
                                                    }
                                                    className="rounded bg-red-500 px-2 py-1 text-xs text-white hover:bg-red-600"
                                                >
                                                    Tolak
                                                </button>
                                            </div>
                                        ) : null}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="rounded-[20px] bg-surface-gray p-6 shadow-rental">
                        <h3 className="mb-4 font-bold">Tindakan</h3>
                        <div className="flex flex-col gap-3">
                            {canDispatch(order) && (
                                <button
                                    onClick={dispatch}
                                    className="rounded-full bg-amber-gold px-6 py-2.5 font-semibold text-navy-blue hover:bg-yellow-300"
                                >
                                    🚗 Dispatch Kendaraan
                                </button>
                            )}
                            {canReturn(order) && (
                                <form
                                    onSubmit={processReturn}
                                    className="flex gap-2"
                                >
                                    <input
                                        type="datetime-local"
                                        value={data.actual_return_at}
                                        onChange={(e) =>
                                            setData(
                                                'actual_return_at',
                                                e.target.value,
                                            )
                                        }
                                        className="flex-1 rounded-full border border-slate-gray/20 bg-base-white px-4 py-2 text-sm outline-none"
                                    />
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="rounded-full bg-navy-blue px-5 py-2 text-sm font-semibold text-amber-gold hover:opacity-80"
                                    >
                                        Catat Kembali
                                    </button>
                                </form>
                            )}
                            {canComplete(order) && (
                                <button
                                    onClick={complete}
                                    className="rounded-full border border-green-400 bg-green-50 px-6 py-2.5 text-sm font-semibold text-success-green hover:bg-pale-green"
                                >
                                    ✅ Selesaikan Order
                                </button>
                            )}
                            {!canDispatch(order) &&
                                !canReturn(order) &&
                                !canComplete(order) && (
                                    <p className="text-sm text-slate-gray">
                                        Tidak ada tindakan tersedia untuk status
                                        ini.
                                    </p>
                                )}
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
