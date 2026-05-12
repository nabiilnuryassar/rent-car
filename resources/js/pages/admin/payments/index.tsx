import { Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useConfirm } from '@/components/ui/confirm-modal';
import { LoadingWrapper } from '@/components/ui/loading-wrapper';
import { SkeletonTable } from '@/components/ui/skeleton';
import AdminLayout from '@/layouts/admin-layout';
import { formatPaymentMethod } from '@/lib/labels';
import admin from '@/routes/admin';

type Payment = {
    id: number;
    amount: number;
    method: string;
    transfer_proof_url: string | null;
    paid_at: string | null;
    orderable: {
        id: number;
        order_number?: string;
        customer?: { user: { name: string } };
    };
    orderable_type: string;
};

type Filters = { method?: string; date_from?: string; date_to?: string };

type Props = {
    payments: { data: Payment[]; links: { url: string | null; label: string; active: boolean }[] };
    filters: Filters;
};

function orderableLabel(payment: Payment) {
    const name = payment.orderable?.customer?.user?.name ?? 'Pelanggan';
    const no = payment.orderable?.order_number ?? `#${payment.orderable?.id}`;

    return `${name} - ${no}`;
}

export default function PaymentVerificationIndex({ payments, filters }: Props) {
    const confirm = useConfirm();
    const [isRouteLoading, setIsRouteLoading] = useState(false);

    function applyFilter(patch: Partial<Filters>) {
        setIsRouteLoading(true);
        router.get(
            admin.payments.verification.index.url(),
            { ...filters, ...patch },
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
            admin.payments.verification.index.url(),
            {},
            {
                preserveState: true,
                preserveScroll: true,
                onFinish: () => setIsRouteLoading(false),
            },
        );
    }

    async function approve(payment: Payment) {
        const ok = await confirm({
            title: 'Setujui pembayaran ini?',
            description: (
                <span>
                    Sejumlah{' '}
                    <span className="font-semibold text-navy-blue">
                        Rp {payment.amount.toLocaleString('id-ID')}
                    </span>{' '}
                    akan diverifikasi dan kuitansi dibuat otomatis.
                </span>
            ),
            confirmLabel: 'Setujui',
        });
        if (!ok) return;

        router.post(admin.payments.approve.url(payment.id));
    }

    async function reject(payment: Payment) {
        const ok = await confirm({
            title: 'Tolak pembayaran ini?',
            description:
                'Pelanggan perlu mengunggah ulang bukti transfer setelah ditolak.',
            confirmLabel: 'Tolak',
            variant: 'danger',
        });
        if (!ok) return;

        router.post(admin.payments.reject.url(payment.id), {
            rejection_reason: 'Bukti transfer tidak valid',
        });
    }

    const hasFilters = Boolean(
        filters.method || filters.date_from || filters.date_to,
    );

    return (
        <AdminLayout
            title="Verifikasi Pembayaran"
            breadcrumbs={[
                { label: 'Dasbor', href: admin.dashboard.url() },
                { label: 'Pembayaran' },
            ]}
        >
            <div className="mb-4 flex flex-wrap items-end gap-2">
                <select
                    value={filters.method ?? ''}
                    onChange={(e) => applyFilter({ method: e.target.value || undefined })}
                    className="rounded-full border border-slate-gray/20 bg-base-white px-4 py-2 text-sm outline-none focus:border-amber-gold"
                >
                    <option value="">Semua Metode</option>
                    <option value="bank_transfer">Transfer Bank</option>
                    <option value="cash">Tunai</option>
                    <option value="e_wallet">E-Wallet</option>
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
                skeleton={<SkeletonTable rows={5} columns={5} />}
            >
                <div className="overflow-hidden rounded-2xl border border-slate-gray/15 bg-base-white shadow-rental">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-slate-gray/15 bg-surface-gray/60 text-left text-xs font-semibold tracking-wide text-slate-gray uppercase">
                                <th className="px-6 py-4">Pesanan</th>
                                <th className="px-6 py-4">Jumlah</th>
                                <th className="px-6 py-4">Metode</th>
                                <th className="px-6 py-4">Bukti Transfer</th>
                                <th className="px-6 py-4">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {payments.data.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-gray">
                                        Tidak ada pembayaran yang menunggu verifikasi.
                                    </td>
                                </tr>
                            )}
                            {payments.data.map((payment) => (
                                <tr key={payment.id} className="border-b border-slate-gray/10 transition-colors hover:bg-surface-gray/40">
                                    <td className="px-6 py-4">{orderableLabel(payment)}</td>
                                    <td className="px-6 py-4 font-semibold">
                                        Rp {payment.amount.toLocaleString('id-ID')}
                                    </td>
                                    <td className="px-6 py-4">{formatPaymentMethod(payment.method)}</td>
                                    <td className="px-6 py-4">
                                        {payment.transfer_proof_url ? (
                                            <a
                                                href={`/storage/${payment.transfer_proof_url}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="text-xs text-slate-gray underline hover:text-navy-blue"
                                            >
                                                Lihat Bukti
                                            </a>
                                        ) : (
                                            <span className="text-xs text-slate-gray">-</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex gap-2">
                                            <Button
                                                size="sm"
                                                variant="primary"
                                                className="bg-success-green hover:bg-green-600"
                                                onClick={() => approve(payment)}
                                            >
                                                Setujui
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="border-red-300 text-red-600 hover:bg-red-50"
                                                onClick={() => reject(payment)}
                                            >
                                                Tolak
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </LoadingWrapper>

            <div className="mt-4 flex justify-center gap-1">
                {payments.links.map((link) => (
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
