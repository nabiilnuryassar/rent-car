import { Link, router, useForm } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin-layout';
import { formatPaymentMethod } from '@/lib/labels';
import admin from '@/routes/admin';

type Payment = {
    id: number;
    amount: number;
    method: string;
    transfer_proof_url: string | null;
    paid_at: string | null;
    orderable: { id: number; order_number?: string; customer?: { user: { name: string } } };
    orderable_type: string;
};

type Props = {
    payments: { data: Payment[]; links: { url: string | null; label: string; active: boolean }[] };
};

function orderableLabel(payment: Payment) {
    const name = payment.orderable?.customer?.user?.name ?? 'Pelanggan';
    const no = payment.orderable?.order_number ?? `#${payment.orderable?.id}`;

    return `${name} - ${no}`;
}

export default function PaymentVerificationIndex({ payments }: Props) {
    const rejectForm = useForm({ rejection_reason: '' });

    function approve(payment: Payment) {
        if (!confirm('Setujui pembayaran ini?')) {
return;
}

        router.post(admin.payments.approve.url(payment.id));
    }

    function reject(payment: Payment) {
        const reason = prompt('Alasan penolakan:');

        if (!reason) {
return;
}

        rejectForm.setData('rejection_reason', reason);
        router.post(admin.payments.reject.url(payment.id), { rejection_reason: reason });
    }

    return (
        <AdminLayout title="Verifikasi Pembayaran">
            <div className="rounded-[20px] bg-surface-gray shadow-rental overflow-hidden">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-slate-gray/20 text-left text-xs font-semibold uppercase tracking-wide text-slate-gray">
                            <th className="px-6 py-4">Pesanan</th>
                            <th className="px-6 py-4">Jumlah</th>
                            <th className="px-6 py-4">Metode</th>
                            <th className="px-6 py-4">Bukti Transfer</th>
                            <th className="px-6 py-4">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {payments.data.length === 0 && (
                            <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-gray">Tidak ada pembayaran yang menunggu verifikasi.</td></tr>
                        )}
                        {payments.data.map((payment) => (
                            <tr key={payment.id} className="border-b border-slate-gray/20/50 hover:bg-base-white/40 transition-colors">
                                <td className="px-6 py-4">{orderableLabel(payment)}</td>
                                <td className="px-6 py-4 font-semibold">Rp {payment.amount.toLocaleString('id-ID')}</td>
                                <td className="px-6 py-4">{formatPaymentMethod(payment.method)}</td>
                                <td className="px-6 py-4">
                                    {payment.transfer_proof_url ? (
                                        <a href={`/storage/${payment.transfer_proof_url}`} target="_blank" className="text-xs underline text-slate-gray hover:text-navy-blue">
                                            Lihat Bukti
                                        </a>
                                    ) : (
                                        <span className="text-xs text-slate-gray">-</span>
                                    )}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex gap-2">
                                        <button onClick={() => approve(payment)} className="rounded-full bg-success-green px-3 py-1 text-xs font-semibold text-white hover:bg-green-600">
                                            Setujui
                                        </button>
                                        <button onClick={() => reject(payment)} className="rounded-full border border-red-300 px-3 py-1 text-xs font-semibold text-red-600 hover:bg-red-50">
                                            Tolak
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="mt-4 flex justify-center gap-1">
                {payments.links.map((link) => (
                    <Link key={link.label} href={link.url ?? '#'} className={`rounded-full px-4 py-2 text-sm ${link.active ? 'bg-amber-gold font-bold' : 'bg-surface-gray hover:bg-base-white'}`} dangerouslySetInnerHTML={{ __html: link.label }} />
                ))}
            </div>
        </AdminLayout>
    );
}
