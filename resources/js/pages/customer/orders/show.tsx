import { Head, Link } from '@inertiajs/react';
import { FileText, Upload, CheckCircle, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import CustomerLayout from '@/layouts/customer-layout';
import customer from '@/routes/customer';

type Receipt = { id: number; receipt_number: string };
type Payment = { id: number; status: string; amount: number; method: string; paid_at: string | null; receipt: Receipt | null };

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
    vehicle: { brand: string; model: string; plate_number: string; category: { name: string } };
    driver: { user: { name: string }; phone: string } | null;
    payments: Payment[];
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

export default function RentalOrderShow({ order }: { order: Order }) {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    const pendingPayment = order.payments.find((p) => p.status === 'unpaid' || p.status === 'rejected');
    const waitingVerification = order.payments.find((p) => p.status === 'waiting_verification');
    const paidPayment = order.payments.find((p) => p.status === 'paid');

    useEffect(() => {
        if (!selectedFile) {
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
        const fd = new FormData();
        fd.append('proof', selectedFile);

        fetch(customer.payments.uploadProof.url(pendingPayment.id), {
            method: 'POST',
            body: fd,
            headers: { 'X-Requested-With': 'XMLHttpRequest' },
        })
            .then(() => {
                setIsUploading(false);
                setIsConfirmModalOpen(false);
                window.location.reload();
            })
            .catch(() => {
                setIsUploading(false);
                alert('Gagal mengunggah bukti transfer. Silakan coba lagi.');
            });
    }

    return (
        <CustomerLayout title={`Order ${order.order_number}`}>
            <div className="mx-auto max-w-3xl">
                <div className="mb-6 flex items-center justify-between">
                    <Link href="/orders" className="inline-flex items-center gap-2 text-sm font-bold text-slate-gray hover:text-navy-blue transition-colors">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                        Kembali ke Pesanan Saya
                    </Link>
                </div>

                {/* Status Banner */}
                <div className="mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 rounded-[24px] bg-base-white border border-slate-gray/10 p-6 sm:p-8 shadow-sm">
                        <div>
                            <p className="font-mono text-xs text-slate-gray">{order.order_number}</p>
                            <p className="mt-1 text-2xl font-extrabold">Rp {order.total_amount.toLocaleString('id-ID')}</p>
                        </div>
                        <span className={`rounded-full px-4 py-2 text-sm font-bold capitalize ${statusColors[order.status] ?? 'bg-gray-100'}`}>
                            {order.status.replace(/_/g, ' ')}
                        </span>
                    </div>

                    {/* Order Details */}
                    <div className="mb-6 rounded-[20px] bg-surface-gray p-6 shadow-rental">
                        <h2 className="mb-4 font-bold">Detail Pesanan</h2>
                        <dl className="flex flex-col gap-2 text-sm">
                            {[
                                ['Kendaraan', `${order.vehicle.brand} ${order.vehicle.model}`],
                                ['Plat', order.vehicle.plate_number],
                                ['Kategori', order.vehicle.category.name],
                                ['Pengemudi', order.driver?.user.name ?? 'Menunggu penugasan'],
                                ['Telp. Pengemudi', order.driver?.phone ?? '-'],
                                ['Mulai', new Date(order.start_at).toLocaleString('id-ID')],
                                ['Selesai (rencana)', new Date(order.end_at).toLocaleString('id-ID')],
                                ['Luar Kota', order.is_out_of_town ? 'Ya' : 'Tidak'],
                                ['Pickup', order.pickup_option.replace(/_/g, ' ')],
                                ...(order.delivery_address ? [['Alamat Antar', order.delivery_address] as [string, string]] : []),
                            ].map(([k, v]) => (
                                <div key={k} className="flex justify-between border-b border-slate-gray/20/50 pb-2">
                                    <dt className="text-slate-gray">{k}</dt>
                                    <dd className="font-medium text-right">{v}</dd>
                                </div>
                            ))}
                        </dl>
                    </div>

                    {/* Payment Actions */}
                    {pendingPayment && (
                        <div className="rounded-[20px] bg-surface-gray p-6 shadow-rental">
                            <h2 className="mb-4 font-bold">Lakukan Pembayaran</h2>
                            <p className="mb-4 text-sm text-slate-gray">
                                Silakan transfer sebesar <strong>Rp {pendingPayment.amount.toLocaleString('id-ID')}</strong> ke rekening URBAN 8, lalu unggah bukti transfer.
                            </p>
                            <p className="mb-3 rounded-[12px] bg-base-white px-4 py-3 text-sm font-mono">BCA: 1234567890 a.n. PT URBAN 8 Indonesia</p>
                            <label className="cursor-pointer rounded-full bg-navy-blue px-6 py-2.5 text-sm font-bold text-amber-gold hover:opacity-80">
                                📎 Upload Bukti Transfer
                                <input
                                    type="file"
                                    accept=".jpg,.jpeg,.png,.pdf"
                                    className="hidden"
                                    onChange={handleFileChange}
                                />
                            </label>
                        </div>
                    )}

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
                                Pastikan gambar yang Anda pilih adalah bukti transfer yang benar dan terbaca dengan jelas.
                            </p>

                            <div className="overflow-hidden rounded-[16px] border border-slate-gray/10 bg-surface-gray">
                                {previewUrl ? (
                                    <img src={previewUrl} alt="Preview" className="h-auto w-full max-h-[300px] object-contain" />
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-12 text-slate-gray">
                                        <FileText className="mb-2 h-12 w-12 opacity-20" />
                                        <span className="text-xs font-medium">{selectedFile?.name}</span>
                                        <span className="text-[10px] uppercase opacity-50">{selectedFile?.type.split('/')[1] || 'File'}</span>
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-col gap-3 pt-2">
                                <button
                                    onClick={uploadProof}
                                    disabled={isUploading}
                                    className="flex w-full items-center justify-center gap-2 rounded-full bg-navy-blue py-3 text-sm font-bold text-amber-gold hover:opacity-90 disabled:opacity-50 transition-all"
                                >
                                    {isUploading ? (
                                        <>
                                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-amber-gold border-t-transparent" />
                                            Sedang Mengunggah...
                                        </>
                                    ) : (
                                        <>
                                            <Upload className="h-4 w-4" />
                                            Konfirmasi & Upload
                                        </>
                                    )}
                                </button>
                                <button
                                    onClick={() => {
                                        setIsConfirmModalOpen(false);
                                        setSelectedFile(null);
                                    }}
                                    disabled={isUploading}
                                    className="w-full rounded-full bg-surface-gray py-3 text-sm font-bold text-slate-gray hover:bg-slate-gray/10 disabled:opacity-50 transition-all"
                                >
                                    Batal
                                </button>
                            </div>
                        </div>
                    </Modal>

                    {waitingVerification && (
                        <div className="rounded-[20px] bg-orange-50 p-6 shadow-rental">
                            <p className="font-semibold text-orange-700">⏳ Bukti transfer sedang diverifikasi oleh admin.</p>
                        </div>
                    )}

                {paidPayment?.receipt && (
                    <div className="rounded-[24px] bg-pale-green p-6 sm:p-8 shadow-sm border border-success-green/20">
                        <p className="mb-2 font-bold text-success-green flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            Pembayaran terverifikasi!
                        </p>
                        <Link href={`/receipts/${paidPayment.receipt.receipt_number}`} className="inline-block mt-2 rounded-full bg-success-green px-6 py-2.5 text-sm font-bold text-base-white hover:bg-success-green/90 transition-colors">
                            Unduh Kwitansi {paidPayment.receipt.receipt_number}
                        </Link>
                    </div>
                )}
            </div>
        </CustomerLayout>
    );
}
