import { Head, usePage } from '@inertiajs/react';

type Receipt = { id: number; receipt_number: string; issued_at: string };
type Payment = { id: number; amount: number; method: string; paid_at: string | null };

type Props = {
    receipt: Receipt;
    payment: Payment;
    orderable: Record<string, unknown> & {
        order_number?: string;
        vehicle?: { brand: string; model: string; plate_number?: string };
        customer?: { user: { name: string } };
        tariff?: { area_from: string; area_to: string };
        driver?: { user: { name: string }; phone?: string };
    };
};

export default function ReceiptShow({ receipt, payment, orderable }: Props) {
    const { settings } = usePage<{ settings: Record<string, string> }>().props;
    const defaultName = 'FleetGo Rental';
    const defaultAddress = 'Sistem Rental Kendaraan Terpercaya';
    const defaultPhone = '';
    const logoUrl = settings?.company_logo ? `/storage/${settings.company_logo}` : null;
    return (
        <>
            <Head title={`Kwitansi ${receipt.receipt_number} — FleetGo`} />
            <div className="min-h-screen bg-base-white p-6 print:bg-white">
                <div className="mx-auto max-w-lg">
                    <div className="rounded-[24px] bg-surface-gray p-10 shadow-rental print:shadow-none">
                        {/* Header */}
                        <div className="mb-8 flex items-start justify-between border-b border-slate-gray/20 pb-6">
                            <div className="flex gap-4">
                                {logoUrl ? (
                                    <img src={logoUrl} alt="Logo" className="h-12 w-auto object-contain" />
                                ) : (
                                    <div className="text-3xl">🚗</div>
                                )}
                                <div>
                                    <p className="text-2xl font-extrabold text-navy-blue">{settings?.company_name || defaultName}</p>
                                    <p className="text-xs text-slate-gray">{settings?.company_address || defaultAddress}</p>
                                    {settings?.company_phone && (
                                        <p className="text-xs text-slate-gray">Telp: {settings.company_phone}</p>
                                    )}
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-slate-gray">KWITANSI</p>
                                <p className="font-mono text-sm font-bold">{receipt.receipt_number}</p>
                                <p className="text-xs text-slate-gray">{new Date(receipt.issued_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                            </div>
                        </div>

                        {/* Customer + Order */}
                        <div className="mb-6 flex flex-col gap-3 text-sm">
                            {orderable.customer && (
                                <div className="flex justify-between">
                                    <span className="text-slate-gray">Nama</span>
                                    <span className="font-semibold">{orderable.customer.user.name}</span>
                                </div>
                            )}
                            {orderable.order_number && (
                                <div className="flex justify-between">
                                    <span className="text-slate-gray">No. Order</span>
                                    <span className="font-mono font-semibold">{orderable.order_number as string}</span>
                                </div>
                            )}
                            {orderable.vehicle && (
                                <div className="flex justify-between">
                                    <span className="text-slate-gray">Kendaraan</span>
                                    <span className="font-semibold text-right">
                                        {orderable.vehicle.brand} {orderable.vehicle.model}
                                        {orderable.vehicle.plate_number && <><br/><span className="text-xs font-mono">{orderable.vehicle.plate_number}</span></>}
                                    </span>
                                </div>
                            )}
                            {orderable.driver && (
                                <div className="flex justify-between">
                                    <span className="text-slate-gray">Pengemudi</span>
                                    <span className="font-semibold text-right">
                                        {orderable.driver.user.name}
                                        {orderable.driver.phone && <><br/><span className="text-xs">{orderable.driver.phone}</span></>}
                                    </span>
                                </div>
                            )}
                            {orderable.tariff && (
                                <div className="flex justify-between">
                                    <span className="text-slate-gray">Rute Shuttle</span>
                                    <span className="font-semibold">{orderable.tariff.area_from} → {orderable.tariff.area_to}</span>
                                </div>
                            )}
                            <div className="flex justify-between">
                                <span className="text-slate-gray">Metode Bayar</span>
                                <span className="capitalize font-semibold">{payment.method?.replace('_', ' ')}</span>
                            </div>
                            {payment.paid_at && (
                                <div className="flex justify-between">
                                    <span className="text-slate-gray">Tanggal Bayar</span>
                                    <span className="font-semibold">{new Date(payment.paid_at).toLocaleDateString('id-ID')}</span>
                                </div>
                            )}
                        </div>

                        {/* Total */}
                        <div className="rounded-[16px] bg-amber-gold/20 p-5">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-semibold">Total Pembayaran</span>
                                <span className="text-3xl font-extrabold">Rp {payment.amount.toLocaleString('id-ID')}</span>
                            </div>
                        </div>

                        <div className="mt-8 flex items-center justify-between">
                            <p className="text-xs text-slate-gray">Terima kasih atas kepercayaan Anda!</p>
                            <button onClick={() => window.print()} className="rounded-full border border-slate-gray/20 px-4 py-1.5 text-xs hover:bg-base-white print:hidden">
                                🖨️ Cetak
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
