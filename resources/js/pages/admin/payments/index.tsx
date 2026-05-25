import { Link, router } from '@inertiajs/react';
import { Banknote, CheckCircle2, FileText, RotateCcw, X } from 'lucide-react';
import { useState } from 'react';
import ProofImageModal from '@/components/ProofImageModal';
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
    status: string;
    transfer_proof_url: string | null;
    paid_at: string | null;
    orderable: {
        id: number;
        order_number?: string;
        customer?: { user: { name: string } };
        total_amount?: number;
    };
    orderable_type: string;
};

type Tab = 'transfer' | 'cash' | 'paid';

type Filters = {
    method?: string;
    date_from?: string;
    date_to?: string;
    tab?: Tab;
};

type Props = {
    payments: {
        data: Payment[];
        links: { url: string | null; label: string; active: boolean }[];
    };
    tab: Tab;
    filters: Filters;
};

function orderableLabel(payment: Payment) {
    const name = payment.orderable?.customer?.user?.name ?? 'Pelanggan';
    const no = payment.orderable?.order_number ?? `#${payment.orderable?.id}`;

    return `${name} - ${no}`;
}

export default function PaymentVerificationIndex({
    payments,
    tab,
    filters,
}: Props) {
    const confirm = useConfirm();
    const [isRouteLoading, setIsRouteLoading] = useState(false);
    const [cashModalPayment, setCashModalPayment] = useState<Payment | null>(
        null,
    );
    const [cashAmount, setCashAmount] = useState<string>('');
    const [refundModalPayment, setRefundModalPayment] = useState<Payment | null>(
        null,
    );
    const [refundReason, setRefundReason] = useState<string>('');
    const [proofModalUrl, setProofModalUrl] = useState<string | null>(null);

    function openProofModal(path: string | null) {
        if (path) {
            setProofModalUrl(path.startsWith('/') ? path : `/storage/${path}`);
        }
    }

    function applyFilter(patch: Partial<Filters>) {
        setIsRouteLoading(true);
        router.get(
            admin.payments.verification.index.url(),
            { ...filters, ...patch, tab },
            {
                preserveState: true,
                preserveScroll: true,
                onFinish: () => setIsRouteLoading(false),
            },
        );
    }

    function switchTab(nextTab: Tab) {
        if (nextTab === tab) {
            return;
        }

        setIsRouteLoading(true);
        router.get(
            admin.payments.verification.index.url(),
            { tab: nextTab },
            {
                preserveScroll: true,
                onFinish: () => setIsRouteLoading(false),
            },
        );
    }

    function resetFilters() {
        setIsRouteLoading(true);
        router.get(
            admin.payments.verification.index.url(),
            { tab },
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

        if (!ok) {
            return;
        }

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

        if (!ok) {
            return;
        }

        router.post(admin.payments.reject.url(payment.id), {
            rejection_reason: 'Bukti transfer tidak valid',
        });
    }

    function openCashModal(payment: Payment) {
        const total = payment.orderable?.total_amount ?? payment.amount;
        setCashAmount(String(total ?? ''));
        setCashModalPayment(payment);
    }

    function closeCashModal() {
        setCashModalPayment(null);
        setCashAmount('');
    }

    function submitCash() {
        if (!cashModalPayment) {
            return;
        }

        const amount = Number(cashAmount);

        if (!amount || amount <= 0) {
            return;
        }

        router.post(
            admin.payments.cash.url(cashModalPayment.id),
            { amount },
            {
                onSuccess: () => closeCashModal(),
            },
        );
    }

    function openRefundModal(payment: Payment) {
        setRefundReason('');
        setRefundModalPayment(payment);
    }

    function closeRefundModal() {
        setRefundModalPayment(null);
        setRefundReason('');
    }

    function submitRefund() {
        if (!refundModalPayment) {
            return;
        }

        const reason = refundReason.trim();

        if (reason.length < 5) {
            return;
        }

        router.post(
            admin.payments.refund.url(refundModalPayment.id),
            { reason },
            {
                onSuccess: () => closeRefundModal(),
            },
        );
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
            {/* Tabs */}
            <div className="mb-6 inline-flex rounded-full bg-surface-gray p-1 shadow-sm">
                <button
                    type="button"
                    onClick={() => switchTab('transfer')}
                    className={`flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold transition-all ${
                        tab === 'transfer'
                            ? 'bg-navy-blue text-base-white shadow'
                            : 'text-slate-gray hover:text-navy-blue'
                    }`}
                >
                    <FileText className="h-4 w-4" />
                    Verifikasi Transfer
                </button>
                <button
                    type="button"
                    onClick={() => switchTab('cash')}
                    className={`flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold transition-all ${
                        tab === 'cash'
                            ? 'bg-navy-blue text-base-white shadow'
                            : 'text-slate-gray hover:text-navy-blue'
                    }`}
                >
                    <Banknote className="h-4 w-4" />
                    Pembayaran Tunai
                </button>
                <button
                    type="button"
                    onClick={() => switchTab('paid')}
                    className={`flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold transition-all ${
                        tab === 'paid'
                            ? 'bg-navy-blue text-base-white shadow'
                            : 'text-slate-gray hover:text-navy-blue'
                    }`}
                >
                    <RotateCcw className="h-4 w-4" />
                    Refund
                </button>
            </div>

            <div className="mb-4 flex flex-wrap items-end gap-2">
                {tab === 'transfer' && (
                    <select
                        value={filters.method ?? ''}
                        onChange={(e) =>
                            applyFilter({
                                method: e.target.value || undefined,
                            })
                        }
                        className="rounded-full border border-slate-gray/20 bg-base-white px-4 py-2 text-sm outline-none focus:border-amber-gold"
                    >
                        <option value="">Semua Metode</option>
                        <option value="bank_transfer">Transfer Bank</option>
                        <option value="e_wallet">E-Wallet</option>
                    </select>
                )}
                <div className="flex items-center gap-1 rounded-full border border-slate-gray/20 bg-base-white px-3 py-1 text-sm">
                    <span className="text-xs text-slate-gray">Dari</span>
                    <input
                        type="date"
                        value={filters.date_from ?? ''}
                        onChange={(e) =>
                            applyFilter({
                                date_from: e.target.value || undefined,
                            })
                        }
                        className="bg-transparent text-sm outline-none"
                    />
                </div>
                <div className="flex items-center gap-1 rounded-full border border-slate-gray/20 bg-base-white px-3 py-1 text-sm">
                    <span className="text-xs text-slate-gray">Sampai</span>
                    <input
                        type="date"
                        value={filters.date_to ?? ''}
                        onChange={(e) =>
                            applyFilter({
                                date_to: e.target.value || undefined,
                            })
                        }
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
                                {tab === 'transfer' && (
                                    <th className="px-6 py-4">Bukti</th>
                                )}
                                <th className="px-6 py-4">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {payments.data.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={tab === 'transfer' ? 5 : 4}
                                        className="px-6 py-12 text-center text-slate-gray"
                                    >
                                        {tab === 'transfer'
                                            ? 'Tidak ada pembayaran yang menunggu verifikasi.'
                                            : tab === 'cash'
                                              ? 'Tidak ada pesanan yang menunggu pembayaran tunai.'
                                              : 'Tidak ada pembayaran paid yang dapat di-refund.'}
                                    </td>
                                </tr>
                            )}
                            {payments.data.map((payment) => (
                                <tr
                                    key={payment.id}
                                    className="border-b border-slate-gray/10 transition-colors hover:bg-surface-gray/40"
                                >
                                    <td className="px-6 py-4">
                                        {orderableLabel(payment)}
                                    </td>
                                    <td className="px-6 py-4 font-semibold">
                                        Rp{' '}
                                        {(
                                            payment.orderable?.total_amount ??
                                            payment.amount
                                        ).toLocaleString('id-ID')}
                                    </td>
                                    <td className="px-6 py-4">
                                        {formatPaymentMethod(
                                            payment.method ?? 'cash',
                                        )}
                                    </td>
                                    {tab === 'transfer' && (
                                        <td className="px-6 py-4">
                                            {payment.transfer_proof_url ? (
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        openProofModal(
                                                            payment.transfer_proof_url,
                                                        )
                                                    }
                                                    className="inline-flex items-center gap-1.5 rounded-full bg-surface-gray px-3 py-1 text-xs font-semibold text-navy-blue transition hover:bg-amber-gold/30"
                                                >
                                                    <FileText className="h-3.5 w-3.5" />
                                                    Lihat Bukti
                                                </button>
                                            ) : (
                                                <span className="text-xs text-slate-gray">
                                                    -
                                                </span>
                                            )}
                                        </td>
                                    )}
                                    <td className="px-6 py-4">
                                        {tab === 'transfer' ? (
                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="primary"
                                                    className="bg-success-green hover:bg-green-600"
                                                    onClick={() =>
                                                        approve(payment)
                                                    }
                                                    leadingIcon={<CheckCircle2 className="h-4 w-4" />}
                                                >
                                                    Setujui
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="border-red-300 text-red-600 hover:bg-red-50"
                                                    onClick={() =>
                                                        reject(payment)
                                                    }
                                                    leadingIcon={<X className="h-4 w-4" />}
                                                >
                                                    Tolak
                                                </Button>
                                            </div>
                                        ) : tab === 'cash' ? (
                                            <Button
                                                size="sm"
                                                variant="primary"
                                                className="bg-amber-gold text-navy-blue hover:bg-yellow-400"
                                                onClick={() =>
                                                    openCashModal(payment)
                                                }
                                                leadingIcon={<Banknote className="h-4 w-4" />}
                                            >
                                                Catat Tunai
                                            </Button>
                                        ) : (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="border-red-300 text-red-600 hover:bg-red-50"
                                                onClick={() =>
                                                    openRefundModal(payment)
                                                }
                                                leadingIcon={<RotateCcw className="h-4 w-4" />}
                                            >
                                                Refund
                                            </Button>
                                        )}
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

            {/* Cash Payment Modal */}
            {cashModalPayment && (
                <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center bg-navy-blue/40 p-4">
                    <div className="w-full max-w-md rounded-2xl bg-base-white p-6 shadow-2xl">
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-navy-blue">
                                Catat Pembayaran Tunai
                            </h3>
                            <button
                                type="button"
                                onClick={closeCashModal}
                                className="rounded-full p-1 text-slate-gray hover:bg-surface-gray"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <p className="mb-2 text-sm text-slate-gray">
                            Pesanan:{' '}
                            <span className="font-semibold text-navy-blue">
                                {orderableLabel(cashModalPayment)}
                            </span>
                        </p>
                        <p className="mb-4 text-sm text-slate-gray">
                            Total tagihan:{' '}
                            <span className="font-semibold text-navy-blue">
                                Rp{' '}
                                {(
                                    cashModalPayment.orderable?.total_amount ??
                                    cashModalPayment.amount
                                ).toLocaleString('id-ID')}
                            </span>
                        </p>

                        <label className="mb-4 block">
                            <span className="mb-1 block text-xs font-semibold tracking-wide text-slate-gray uppercase">
                                Jumlah Diterima (Rp)
                            </span>
                            <input
                                type="number"
                                value={cashAmount}
                                onChange={(e) => setCashAmount(e.target.value)}
                                min={1}
                                className="w-full rounded-xl border border-slate-gray/20 bg-base-white px-4 py-2 text-sm outline-none focus:border-amber-gold"
                            />
                        </label>

                        <div className="flex justify-end gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={closeCashModal}
                            >
                                Batal
                            </Button>
                            <Button
                                variant="primary"
                                size="sm"
                                className="bg-success-green hover:bg-green-600"
                                onClick={submitCash}
                            >
                                <CheckCircle2 className="mr-1 h-4 w-4" />
                                Konfirmasi & Cetak Kuitansi
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {refundModalPayment && (
                <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center bg-navy-blue/40 p-4">
                    <div className="w-full max-w-lg rounded-2xl bg-base-white p-6 shadow-2xl">
                        <div className="mb-4 flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-bold text-navy-blue">
                                    Refund Pembayaran
                                </h3>
                                <p className="text-xs text-slate-gray">
                                    Pembayaran akan ditandai refunded dan pesanan terkait dibatalkan jika masih aktif.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={closeRefundModal}
                                className="rounded-full p-1 text-slate-gray hover:bg-surface-gray"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="mb-4 rounded-xl border border-red-100 bg-red-50 p-4 text-sm">
                            <p className="text-slate-gray">
                                Pesanan:{' '}
                                <span className="font-semibold text-navy-blue">
                                    {orderableLabel(refundModalPayment)}
                                </span>
                            </p>
                            <p className="mt-1 text-slate-gray">
                                Nominal refund:{' '}
                                <span className="font-semibold text-red-700">
                                    Rp {refundModalPayment.amount.toLocaleString('id-ID')}
                                </span>
                            </p>
                        </div>

                        <label className="mb-4 block">
                            <span className="mb-1 block text-xs font-semibold tracking-wide text-slate-gray uppercase">
                                Alasan Refund
                            </span>
                            <textarea
                                value={refundReason}
                                onChange={(e) => setRefundReason(e.target.value)}
                                rows={4}
                                placeholder="Contoh: Customer membatalkan sebelum kendaraan dikirim"
                                className="w-full rounded-xl border border-slate-gray/20 bg-base-white px-4 py-3 text-sm outline-none focus:border-amber-gold"
                            />
                            <span className="mt-1 block text-xs text-slate-gray">
                                Minimal 5 karakter. Alasan tersimpan di audit trail.
                            </span>
                        </label>

                        <div className="flex justify-end gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={closeRefundModal}
                            >
                                Batal
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                className="border-red-300 text-red-600 hover:bg-red-50"
                                onClick={submitRefund}
                                disabled={refundReason.trim().length < 5}
                                leadingIcon={<RotateCcw className="h-4 w-4" />}
                            >
                                Konfirmasi Refund
                            </Button>
                        </div>
                    </div>
                </div>
            )}
            <ProofImageModal
                url={proofModalUrl}
                onClose={() => setProofModalUrl(null)}
            />
        </AdminLayout>
    );
}
