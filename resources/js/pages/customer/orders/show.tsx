import { Link, router } from '@inertiajs/react';
import {
    ArrowLeft,
    Calendar,
    CarFront,
    CheckCircle2,
    FileText,
    MapPin,
    Phone,
    Upload,
    User,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import Modal from '@/components/ui/Modal';
import { toast } from '@/components/ui/toast';
import CustomerLayout from '@/layouts/customer-layout';
import { formatOrderStatus, formatPickupOption } from '@/lib/labels';
import customer from '@/routes/customer';

type Receipt = { id: number; receipt_number: string };
type Payment = {
    id: number;
    status: string;
    amount: number;
    method: string;
    paid_at: string | null;
    receipt: Receipt | null;
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
    vehicle: {
        brand: string;
        model: string;
        plate_number: string;
        category: { name: string };
    };
    driver: { user: { name: string }; phone: string } | null;
    payments: Payment[];
};

const statusStyles: Record<string, { bg: string; text: string; dot: string }> =
    {
        pending_payment: {
            bg: 'bg-yellow-50',
            text: 'text-yellow-700',
            dot: 'bg-yellow-400',
        },
        waiting_verification: {
            bg: 'bg-orange-50',
            text: 'text-orange-700',
            dot: 'bg-orange-400',
        },
        paid: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-400' },
        ready_to_dispatch: {
            bg: 'bg-purple-50',
            text: 'text-purple-700',
            dot: 'bg-purple-400',
        },
        ongoing: {
            bg: 'bg-pale-green',
            text: 'text-success-green',
            dot: 'bg-success-green',
        },
        waiting_overtime_payment: {
            bg: 'bg-red-50',
            text: 'text-red-600',
            dot: 'bg-red-400',
        },
        completed: {
            bg: 'bg-green-50',
            text: 'text-green-700',
            dot: 'bg-green-500',
        },
        cancelled: {
            bg: 'bg-gray-50',
            text: 'text-gray-500',
            dot: 'bg-gray-400',
        },
    };

const defaultStatusStyle = {
    bg: 'bg-surface-gray',
    text: 'text-slate-gray',
    dot: 'bg-slate-gray',
};

function formatCurrency(value: number) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(value);
}

function DetailRow({
    label,
    value,
}: {
    label: string;
    value: React.ReactNode;
}) {
    return (
        <div className="flex items-start justify-between gap-4 border-b border-slate-gray/10 py-3 last:border-0">
            <dt className="shrink-0 text-xs font-semibold text-slate-gray">
                {label}
            </dt>
            <dd className="min-w-0 break-words text-right text-xs font-bold text-navy-blue">
                {value}
            </dd>
        </div>
    );
}

export default function RentalOrderShow({ order }: { order: Order }) {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    const pendingPayment = order.payments.find(
        (p) => p.status === 'unpaid' || p.status === 'rejected',
    );
    const waitingVerification = order.payments.find(
        (p) => p.status === 'waiting_verification',
    );
    const paidPayment = order.payments.find((p) => p.status === 'paid');

    const style = statusStyles[order.status] ?? defaultStatusStyle;

    useEffect(() => {
        if (!selectedFile) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setPreviewUrl(null);

            return;
        }

        if (selectedFile.type.startsWith('image/')) {
            const url = URL.createObjectURL(selectedFile);

            setPreviewUrl(url);

            return () => URL.revokeObjectURL(url);
        } else {
            setPreviewUrl(null);
        }
    }, [selectedFile]);

    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];

        if (file) {
            setSelectedFile(file);
            setIsConfirmModalOpen(true);
            e.target.value = '';
        }
    }

    function uploadProof() {
        if (!pendingPayment || !selectedFile) {
            return;
        }

        setIsUploading(true);

        router.post(
            customer.payments.uploadProof.url(pendingPayment.id),
            { proof: selectedFile, _method: 'post' },
            {
                forceFormData: true,
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Bukti transfer berhasil diunggah', {
                        description:
                            'Admin akan memverifikasi pembayaran Anda.',
                    });
                },
                onFinish: () => {
                    setIsUploading(false);
                    setIsConfirmModalOpen(false);
                    setSelectedFile(null);
                },
                onError: () => {
                    toast.error('Gagal mengunggah bukti transfer', {
                        description: 'Periksa berkas Anda lalu coba lagi.',
                    });
                },
            },
        );
    }

    return (
        <CustomerLayout title={`Pesanan ${order.order_number}`}>
            <div className="mx-auto max-w-2xl">
                {/* Back link */}
                <Link
                    href="/orders"
                    className="mb-6 inline-flex items-center gap-2 text-xs font-bold text-slate-gray transition-colors hover:text-navy-blue sm:text-sm"
                >
                    <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                    Kembali ke Pesanan Saya
                </Link>

                {/* Hero status card */}
                <div className="mb-5 overflow-hidden rounded-2xl border border-slate-gray/10 bg-base-white shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-3 p-5 sm:p-6">
                        <div className="min-w-0">
                            <p className="font-mono text-[10px] font-bold tracking-widest text-navy-blue/40 uppercase">
                                {order.order_number}
                            </p>
                            <p className="mt-1 text-xl font-extrabold text-navy-blue sm:text-3xl">
                                {formatCurrency(order.total_amount)}
                            </p>
                        </div>
                        <span
                            className={`inline-flex shrink-0 items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold sm:px-4 sm:py-2 sm:text-sm ${style.bg} ${style.text}`}
                        >
                            <span
                                className={`h-2 w-2 rounded-full ${style.dot}`}
                            />
                            {formatOrderStatus(order.status)}
                        </span>
                    </div>

                    {/* Progress strip */}
                    <div className="grid grid-cols-4 border-t border-slate-gray/10">
                        {[
                            { key: 'pending_payment', label: 'Bayar' },
                            { key: 'ready_to_dispatch', label: 'Kirim' },
                            { key: 'ongoing', label: 'Berjalan' },
                            { key: 'completed', label: 'Selesai' },
                        ].map((step, i, arr) => {
                            const statusOrder = [
                                'pending_payment',
                                'waiting_verification',
                                'paid',
                                'ready_to_dispatch',
                                'ongoing',
                                'waiting_overtime_payment',
                                'completed',
                            ];
                            const currentIdx = statusOrder.indexOf(
                                order.status,
                            );
                            const stepIdx = statusOrder.indexOf(step.key);
                            const isDone =
                                currentIdx >= stepIdx &&
                                order.status !== 'cancelled';

                            return (
                                <div
                                    key={step.key}
                                    className={`flex flex-col items-center gap-1 py-3 text-center text-[11px] font-bold transition-colors ${
                                        isDone
                                            ? 'text-navy-blue'
                                            : 'text-slate-gray/40'
                                    } ${i < arr.length - 1 ? 'border-r border-slate-gray/10' : ''}`}
                                >
                                    <span
                                        className={`h-2 w-2 rounded-full ${isDone ? 'bg-navy-blue' : 'bg-slate-gray/20'}`}
                                    />
                                    {step.label}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Vehicle card */}
                <div className="mb-5 flex items-center gap-4 rounded-2xl border border-slate-gray/10 bg-base-white p-4 shadow-sm sm:p-5">
                    <div className="flex h-16 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-surface-gray p-2 sm:h-20 sm:w-28">
                        <img
                            src={(() => {
                                const name =
                                    order.vehicle.category.name.toLowerCase();

                                if (name.includes('suv')) {
                                    return '/images/mockup/suv.png';
                                }

                                if (
                                    name.includes('mpv') ||
                                    name.includes('minibus')
                                ) {
                                    return '/images/mockup/mpv.png';
                                }

                                return '/images/mockup/sedan.png';
                            })()}
                            alt={`${order.vehicle.brand} ${order.vehicle.model}`}
                            className="h-full w-full object-contain drop-shadow-md"
                        />
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-bold tracking-wider text-slate-gray uppercase">
                            {order.vehicle.category.name}
                        </p>
                        <h2 className="truncate text-lg font-extrabold text-navy-blue sm:text-xl">
                            {order.vehicle.brand} {order.vehicle.model}
                        </h2>
                        <p className="mt-0.5 flex items-center gap-1.5 text-xs font-semibold text-slate-gray">
                            <CarFront
                                className="h-3.5 w-3.5 shrink-0"
                                aria-hidden="true"
                            />
                            {order.vehicle.plate_number}
                        </p>
                    </div>
                </div>

                {/* Detail grid */}
                <div className="mb-5 rounded-2xl border border-slate-gray/10 bg-base-white p-5 shadow-sm sm:p-6">
                    <h3 className="mb-1 text-xs font-bold tracking-wider text-slate-gray uppercase">
                        Detail Pesanan
                    </h3>
                    <dl>
                        <DetailRow
                            label="Mulai"
                            value={new Date(order.start_at).toLocaleString(
                                'id-ID',
                                {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                },
                            )}
                        />
                        <DetailRow
                            label="Selesai"
                            value={new Date(order.end_at).toLocaleString(
                                'id-ID',
                                {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                },
                            )}
                        />
                        {order.actual_return_at && (
                            <DetailRow
                                label="Dikembalikan"
                                value={new Date(
                                    order.actual_return_at,
                                ).toLocaleString('id-ID', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                })}
                            />
                        )}
                        <DetailRow
                            label="Penjemputan"
                            value={
                                <span className="flex items-center gap-1.5">
                                    <MapPin
                                        className="h-3.5 w-3.5 shrink-0"
                                        aria-hidden="true"
                                    />
                                    {formatPickupOption(order.pickup_option)}
                                </span>
                            }
                        />
                        {order.delivery_address && (
                            <DetailRow
                                label="Alamat Pengantaran"
                                value={order.delivery_address}
                            />
                        )}
                        <DetailRow
                            label="Luar Kota"
                            value={order.is_out_of_town ? 'Ya' : 'Tidak'}
                        />
                    </dl>
                </div>

                {/* Driver card */}
                <div className="mb-5 rounded-2xl border border-slate-gray/10 bg-base-white p-5 shadow-sm sm:p-6">
                    <h3 className="mb-3 text-xs font-bold tracking-wider text-slate-gray uppercase">
                        Pengemudi
                    </h3>
                    {order.driver ? (
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-navy-blue text-lg font-extrabold text-amber-gold">
                                {order.driver.user.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-extrabold text-navy-blue">
                                    {order.driver.user.name}
                                </p>
                                <p className="flex items-center gap-1.5 text-xs text-slate-gray">
                                    <Phone
                                        className="h-3.5 w-3.5 shrink-0"
                                        aria-hidden="true"
                                    />
                                    {order.driver.phone}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3 rounded-xl bg-surface-gray px-4 py-3">
                            <User
                                className="h-5 w-5 shrink-0 text-slate-gray/50"
                                aria-hidden="true"
                            />
                            <p className="text-xs font-semibold text-slate-gray">
                                Pengemudi akan ditugaskan setelah pesanan
                                diproses.
                            </p>
                        </div>
                    )}
                </div>

                {/* Payment action */}
                {pendingPayment && (
                    <div className="mb-5 rounded-2xl border border-amber-gold/30 bg-amber-gold/5 p-5 shadow-sm sm:p-6">
                        <h3 className="mb-1 text-sm font-extrabold text-navy-blue">
                            Lakukan Pembayaran
                        </h3>
                        <p className="mb-4 text-xs text-slate-gray">
                            Transfer sebesar{' '}
                            <span className="font-bold text-navy-blue">
                                {formatCurrency(pendingPayment.amount)}
                            </span>{' '}
                            ke rekening berikut, lalu unggah bukti transfer.
                        </p>
                        <div className="mb-4 flex items-start gap-3 rounded-xl border border-amber-gold/20 bg-base-white px-4 py-3">
                            <Calendar
                                className="mt-0.5 h-4 w-4 shrink-0 text-amber-gold"
                                aria-hidden="true"
                            />
                            <p className="break-all font-mono text-xs font-bold text-navy-blue">
                                BCA: 1234567890 a.n. PT URBAN 8 Indonesia
                            </p>
                        </div>
                        <label className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-navy-blue px-6 py-3.5 text-sm font-bold text-amber-gold shadow-md transition-all hover:-translate-y-0.5 hover:bg-navy-blue/90">
                            <Upload className="h-4 w-4" aria-hidden="true" />
                            Unggah Bukti Transfer
                            <input
                                type="file"
                                accept=".jpg,.jpeg,.png,.pdf"
                                className="hidden"
                                onChange={handleFileChange}
                            />
                        </label>
                    </div>
                )}

                {/* Waiting verification */}
                {waitingVerification && (
                    <div className="mb-5 flex items-start gap-3 rounded-2xl border border-orange-200 bg-orange-50 p-5">
                        <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-orange-400" />
                        <p className="text-sm font-semibold text-orange-700">
                            Bukti transfer sedang diverifikasi oleh admin. Kami
                            akan segera mengkonfirmasi pembayaran Anda.
                        </p>
                    </div>
                )}

                {/* Paid + receipt */}
                {paidPayment?.receipt && (
                    <div className="mb-5 rounded-2xl border border-success-green/20 bg-pale-green p-5 sm:p-6">
                        <p className="mb-3 flex items-center gap-2 text-sm font-extrabold text-success-green">
                            <CheckCircle2
                                className="h-5 w-5 shrink-0"
                                aria-hidden="true"
                            />
                            Pembayaran terverifikasi!
                        </p>
                        <Link
                            href={`/receipts/${paidPayment.receipt.receipt_number}`}
                            className="flex w-full items-center justify-center gap-2 rounded-full bg-success-green px-6 py-3.5 text-sm font-bold text-base-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-success-green/90"
                        >
                            <FileText className="h-4 w-4" aria-hidden="true" />
                            Unduh Kuitansi {paidPayment.receipt.receipt_number}
                        </Link>
                    </div>
                )}
            </div>

            {/* Upload confirmation modal */}
            <Modal
                isOpen={isConfirmModalOpen}
                onClose={() => {
                    if (!isUploading) {
                        setIsConfirmModalOpen(false);
                        setSelectedFile(null);
                    }
                }}
                title="Konfirmasi Bukti Transfer"
                maxWidth="md"
            >
                <div className="space-y-4">
                    <p className="text-sm text-slate-gray">
                        Pastikan gambar yang Anda pilih adalah bukti transfer
                        yang benar dan terbaca dengan jelas.
                    </p>

                    <div className="overflow-hidden rounded-2xl border border-slate-gray/10 bg-surface-gray">
                        {previewUrl ? (
                            <img
                                src={previewUrl}
                                alt="Pratinjau bukti transfer"
                                className="max-h-[300px] w-full object-contain"
                            />
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 text-slate-gray">
                                <FileText
                                    className="mb-2 h-12 w-12 opacity-20"
                                    aria-hidden="true"
                                />
                                <span className="text-xs font-medium">
                                    {selectedFile?.name}
                                </span>
                                <span className="text-[10px] uppercase opacity-50">
                                    {selectedFile?.type.split('/')[1] ??
                                        'Berkas'}
                                </span>
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col gap-3 pt-2">
                        <button
                            onClick={uploadProof}
                            disabled={isUploading}
                            className="flex w-full items-center justify-center gap-2 rounded-full bg-navy-blue py-3 text-sm font-bold text-amber-gold shadow-md transition-all hover:bg-navy-blue/90 disabled:opacity-50"
                        >
                            {isUploading ? (
                                <>
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-amber-gold border-t-transparent" />
                                    Sedang Mengunggah...
                                </>
                            ) : (
                                <>
                                    <Upload
                                        className="h-4 w-4"
                                        aria-hidden="true"
                                    />
                                    Konfirmasi dan Unggah
                                </>
                            )}
                        </button>
                        <button
                            onClick={() => {
                                setIsConfirmModalOpen(false);
                                setSelectedFile(null);
                            }}
                            disabled={isUploading}
                            className="w-full rounded-full bg-surface-gray py-3 text-sm font-bold text-slate-gray transition-all hover:bg-slate-gray/10 disabled:opacity-50"
                        >
                            Batal
                        </button>
                    </div>
                </div>
            </Modal>
        </CustomerLayout>
    );
}
