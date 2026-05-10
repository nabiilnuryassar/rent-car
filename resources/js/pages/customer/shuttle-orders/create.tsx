import { Head, Link, useForm } from '@inertiajs/react';
import customer from '@/routes/customer';

type ShuttleTariff = { id: number; area_from: string; area_to: string; estimated_distance_km: string; estimated_duration_minutes: number; tariff: number };

export default function ShuttleOrderCreate({ tariffs }: { tariffs: ShuttleTariff[] }) {
    const { data, setData, post, processing, errors } = useForm({
        shuttle_tariff_id: '',
        pickup_address: '',
        destination_address: '',
        scheduled_at: '',
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        post(customer.shuttleOrders.store.url());
    }

    const selected = tariffs.find((t) => String(t.id) === data.shuttle_tariff_id);

    return (
        <>
            <Head title="Pesan Shuttle — URBAN 8" />
            <div className="min-h-screen bg-base-white p-6 text-navy-blue">
                <div className="mx-auto max-w-xl">
                    <div className="mb-6 flex items-center gap-3">
                        <Link href={customer.shuttleOrders.index.url()} className="text-sm text-slate-gray hover:text-navy-blue">← Kembali</Link>
                        <h1 className="text-2xl font-bold">Pesan Shuttle</h1>
                    </div>

                    {/* Tariff Selector */}
                    <div className="mb-6 grid gap-3 sm:grid-cols-2">
                        {tariffs.map((t) => (
                            <button
                                key={t.id}
                                onClick={() => setData('shuttle_tariff_id', String(t.id))}
                                className={`rounded-[16px] border-2 p-4 text-left transition-all ${data.shuttle_tariff_id === String(t.id) ? 'border-amber-gold bg-amber-gold/10' : 'border-slate-gray/20 bg-surface-gray hover:border-amber-gold/50'}`}
                            >
                                <p className="font-bold">{t.area_from} → {t.area_to}</p>
                                <p className="mt-1 text-xs text-slate-gray">{t.estimated_distance_km} km · {t.estimated_duration_minutes} mnt</p>
                                <p className="mt-2 text-lg font-extrabold">Rp {t.tariff.toLocaleString('id-ID')}</p>
                            </button>
                        ))}
                    </div>

                    <div className="rounded-[24px] bg-surface-gray p-8 shadow-rental">
                        <form onSubmit={submit} className="flex flex-col gap-5">
                            <div>
                                <label className="mb-1 block text-sm font-semibold">Alamat Jemput</label>
                                <textarea
                                    value={data.pickup_address}
                                    onChange={(e) => setData('pickup_address', e.target.value)}
                                    rows={2}
                                    className="w-full rounded-[12px] border border-slate-gray/20 bg-base-white px-4 py-2.5 text-sm outline-none focus:border-amber-gold"
                                />
                                {errors.pickup_address && <p className="mt-1 text-xs text-red-600">{errors.pickup_address}</p>}
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-semibold">Alamat Tujuan</label>
                                <textarea
                                    value={data.destination_address}
                                    onChange={(e) => setData('destination_address', e.target.value)}
                                    rows={2}
                                    className="w-full rounded-[12px] border border-slate-gray/20 bg-base-white px-4 py-2.5 text-sm outline-none focus:border-amber-gold"
                                />
                                {errors.destination_address && <p className="mt-1 text-xs text-red-600">{errors.destination_address}</p>}
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-semibold">Jadwal</label>
                                <input
                                    type="datetime-local"
                                    value={data.scheduled_at}
                                    onChange={(e) => setData('scheduled_at', e.target.value)}
                                    className="w-full rounded-full border border-slate-gray/20 bg-base-white px-4 py-2.5 text-sm outline-none focus:border-amber-gold"
                                />
                                {errors.scheduled_at && <p className="mt-1 text-xs text-red-600">{errors.scheduled_at}</p>}
                            </div>

                            {selected && (
                                <div className="rounded-[12px] bg-base-white p-4 text-sm">
                                    <p className="font-semibold">Total Pembayaran</p>
                                    <p className="text-2xl font-extrabold">Rp {selected.tariff.toLocaleString('id-ID')}</p>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={processing || !data.shuttle_tariff_id}
                                className="rounded-full bg-navy-blue py-3 font-bold text-amber-gold transition-opacity hover:opacity-80 disabled:opacity-50"
                            >
                                {processing ? 'Memproses...' : 'Buat Pesanan Shuttle'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}
