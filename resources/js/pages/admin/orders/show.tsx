import { useForm, router, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { useConfirm } from '@/components/ui/confirm-modal';
import AdminLayout from '@/layouts/admin-layout';
import {
    formatOrderStatus,
    formatPaymentMethod,
    formatPaymentStatus,
    formatPickupOption,
} from '@/lib/labels';
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
const canCancel = (order: Order) =>
    !['completed', 'cancelled'].includes(order.status);

export default function OrderShow({ order }: { order: Order }) {
    const confirm = useConfirm();
    const { data, setData, processing } = useForm({ actual_return_at: '' });

    async function dispatch() {
        const ok = await confirm({
            title: 'Kirim kendaraan sekarang?',
            description:
                'Status pesanan akan berubah menjadi "Sedang Berjalan" dan pengemudi akan diberitahu.',
            confirmLabel: 'Kirim',
        });
        if (!ok) return;

        router.post(admin.orders.dispatch.url(order.order_number));
    }

    function processReturn(e: React.FormEvent) {
        e.preventDefault();
        router.post(admin.orders.return.url(order.order_number), {
            actual_return_at: data.actual_return_at,
        });
    }

    async function complete() {
        const ok = await confirm({
            title: 'Selesaikan pesanan ini?',
            description: 'Pastikan semua pembayaran overtime sudah diverifikasi.',
            confirmLabel: 'Selesaikan',
        });
        if (!ok) return;

        router.post(admin.orders.complete.url(order.order_number));
    }

    async function cancelOrder() {
        const ok = await confirm({
            title: `Batalkan pesanan ${order.order_number}?`,
            description:
                'Pesanan akan berstatus dibatalkan. Pengemudi dan kendaraan akan dibebaskan.',
            confirmLabel: 'Batalkan Pesanan',
            variant: 'danger',
        });
        if (!ok) return;

        router.post(admin.orders.cancel.url(order.order_number), {
            reason: 'Dibatalkan oleh admin',
        });
    }

    async function approvePayment(paymentId: number) {
        const ok = await confirm({
            title: 'Setujui pembayaran ini?',
            description:
                'Kuitansi akan dibuat otomatis dan status pesanan naik ke "Siap Dikirim".',
            confirmLabel: 'Setujui',
        });
        if (!ok) return;

        router.post(admin.payments.approve.url(paymentId));
    }

    async function rejectPayment(paymentId: number) {
        const ok = await confirm({
            title: 'Tolak pembayaran ini?',
            description:
                'Pelanggan perlu mengunggah ulang bukti transfer setelah ditolak.',
            confirmLabel: 'Tolak',
            variant: 'danger',
        });
        if (!ok) return;

        // Using default reason; if granular reasons are needed, bring this back
        // as a small inline form instead of prompt().
        router.post(admin.payments.reject.url(paymentId), {
            rejection_reason: 'Bukti transfer tidak valid',
        });
    }

    return (
        <AdminLayout
            title={`Pesanan: ${order.order_number}`}
            breadcrumbs={[
                { label: 'Dasbor', href: admin.dashboard.url() },
                { label: 'Pesanan', href: admin.orders.index.url() },
                { label: order.order_number },
            ]}
            headerActions={
                canCancel(order) && (
                    <Button variant="ghost" className="text-red-600 hover:bg-red-50 hover:text-red-700" onClick={cancelOrder}>
                        Batalkan Pesanan
                    </Button>
                )
            }
        >
            <div className="mb-4">
                <Link
                    href={admin.orders.index.url()}
                    className="text-sm text-slate-gray hover:text-navy-blue"
                >
                    ← Kembali ke Daftar Pesanan
                </Link>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                <div className="rounded-[20px] bg-base-white p-6 shadow-rental">
                    <h3 className="mb-4 font-bold">Informasi Pesanan</h3>
                    <dl className="flex flex-col gap-2 text-sm">
                        {[
                            ['Nomor Pesanan', order.order_number],
                            [
                                'Status',
                                <span
                                    key="s"
                                    className="rounded-full bg-amber-gold/20 px-2 py-0.5 text-xs font-bold"
                                >
                                    {formatOrderStatus(order.status)}
                                </span>,
                            ],
                            ['Pelanggan', order.customer.user.name],
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
                                new Date(order.start_at).toLocaleString('id-ID'),
                            ],
                            [
                                'Selesai (rencana)',
                                new Date(order.end_at).toLocaleString('id-ID'),
                            ],
                            [
                                'Pengembalian (aktual)',
                                order.actual_return_at
                                    ? new Date(order.actual_return_at).toLocaleString('id-ID')
                                    : '-',
                            ],
                            ['Luar Kota', order.is_out_of_town ? 'Ya' : 'Tidak'],
                            ['Penjemputan', formatPickupOption(order.pickup_option)],
                            ['Alamat Pengantaran', order.delivery_address ?? '-'],
                            [
                                'Total',
                                `Rp ${order.total_amount.toLocaleString('id-ID')}`,
                            ],
                        ].map(([key, val]) => (
                            <div
                                key={String(key)}
                                className="flex items-start justify-between gap-4 border-b border-slate-gray/10 pb-2"
                            >
                                <dt className="text-slate-gray">{key}</dt>
                                <dd className="text-right font-medium">{val}</dd>
                            </div>
                        ))}
                    </dl>
                </div>

                <div className="flex flex-col gap-6">
                    <div className="rounded-[20px] bg-base-white p-6 shadow-rental">
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
                                                Rp {p.amount.toLocaleString('id-ID')}
                                            </p>
                                            <p className="text-xs text-slate-gray capitalize">
                                                {formatPaymentMethod(p.method)} - {formatPaymentStatus(p.status)}
                                            </p>
                                        </div>
                                        {p.receipt ? (
                                            <Link
                                                href={`/receipts/${p.receipt.receipt_number}`}
                                                className="text-xs text-slate-gray underline"
                                            >
                                                Kuitansi
                                            </Link>
                                        ) : p.status === 'waiting_verification' ? (
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
                                                <Button
                                                    size="sm"
                                                    variant="primary"
                                                    className="bg-success-green hover:bg-green-600"
                                                    onClick={() => approvePayment(p.id)}
                                                >
                                                    Setujui
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="danger"
                                                    onClick={() => rejectPayment(p.id)}
                                                >
                                                    Tolak
                                                </Button>
                                            </div>
                                        ) : null}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="rounded-[20px] bg-base-white p-6 shadow-rental">
                        <h3 className="mb-4 font-bold">Tindakan</h3>
                        <div className="flex flex-col gap-3">
                            {canDispatch(order) && (
                                <Button variant="accent" onClick={dispatch}>
                                    Kirim Kendaraan
                                </Button>
                            )}
                            {canReturn(order) && (
                                <form onSubmit={processReturn} className="flex gap-2">
                                    <input
                                        type="datetime-local"
                                        value={data.actual_return_at}
                                        onChange={(e) => setData('actual_return_at', e.target.value)}
                                        className="flex-1 rounded-full border border-slate-gray/20 bg-base-white px-4 py-2 text-sm outline-none"
                                    />
                                    <Button type="submit" variant="primary" loading={processing}>
                                        Catat Pengembalian
                                    </Button>
                                </form>
                            )}
                            {canComplete(order) && (
                                <Button
                                    variant="outline"
                                    className="border-green-400 bg-green-50 text-success-green hover:bg-pale-green"
                                    onClick={complete}
                                >
                                    Selesaikan Pesanan
                                </Button>
                            )}
                            {!canDispatch(order) && !canReturn(order) && !canComplete(order) && (
                                <p className="text-sm text-slate-gray">
                                    Tidak ada tindakan tersedia untuk status ini.
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
