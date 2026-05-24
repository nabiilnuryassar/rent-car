import { Head, Link, useForm } from '@inertiajs/react';
import { MapPin } from 'lucide-react';
import CustomerLayout from '@/layouts/customer-layout';
import customer from '@/routes/customer';

type ShuttleTariff = {
    id: number;
    area_from: string;
    area_to: string;
    estimated_distance_km: string;
    estimated_duration_minutes: number;
    tariff: number;
};

export default function ShuttleOrderCreate({
    tariffs,
}: {
    tariffs: ShuttleTariff[];
}) {
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

    const selected = tariffs.find(
        (t) => String(t.id) === data.shuttle_tariff_id,
    );

    return (
        <CustomerLayout title="Pesan Antar-Jemput">
            <div className="mx-auto max-w-5xl">
                {/* Header section */}
                <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-extrabold tracking-tight text-navy-blue sm:text-3xl">
                            Pesan Antar-Jemput
                        </h1>
                        <p className="mt-1 text-sm text-slate-gray">
                            Layanan shuttle premium ke berbagai wilayah operasional URBAN 8.
                        </p>
                    </div>
                    <Link
                        href={customer.shuttleOrders.index.url()}
                        className="inline-flex shrink-0 items-center gap-2 rounded-full border border-slate-gray/20 bg-base-white px-5 py-2.5 text-xs font-bold text-navy-blue transition-all hover:bg-surface-gray"
                    >
                        Riwayat Pesanan
                    </Link>
                </div>

                <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                    {/* Left Column: Route Selection Card */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="rounded-[24px] border border-slate-gray/10 bg-base-white p-6 shadow-sm sm:p-8">
                            <h2 className="mb-5 text-xs font-bold tracking-wider text-slate-gray uppercase">
                                Pilih Rute Perjalanan
                            </h2>

                            {tariffs.length === 0 ? (
                                <div className="rounded-2xl border border-dashed border-slate-gray/25 p-8 text-center text-sm text-slate-gray">
                                    Belum ada rute shuttle yang tersedia.
                                </div>
                            ) : (
                                <div className="grid gap-4 sm:grid-cols-2">
                                    {tariffs.map((t) => {
                                        const isSelected =
                                            String(t.id) ===
                                            data.shuttle_tariff_id;
                                        return (
                                            <button
                                                key={t.id}
                                                type="button"
                                                onClick={() =>
                                                    setData(
                                                        'shuttle_tariff_id',
                                                        String(t.id),
                                                    )
                                                }
                                                className={`group relative rounded-[20px] border-2 p-5 text-left transition-all ${
                                                    isSelected
                                                        ? 'border-amber-gold bg-amber-gold/5 ring-4 ring-amber-gold/10'
                                                        : 'border-slate-gray/10 bg-base-white hover:border-navy-blue/30 hover:shadow-md'
                                                }`}
                                            >
                                                <div className="mb-4 flex items-center justify-between">
                                                    <span
                                                        className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
                                                            isSelected
                                                                ? 'bg-amber-gold/20 text-navy-blue'
                                                                : 'bg-surface-gray text-slate-gray'
                                                        }`}
                                                    >
                                                        <MapPin className="h-4 w-4" />
                                                    </span>
                                                    {isSelected && (
                                                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-gold text-[10px] font-bold text-navy-blue ring-2 ring-base-white">
                                                            ✓
                                                        </span>
                                                    )}
                                                </div>
                                                <h3 className="text-sm font-extrabold text-navy-blue leading-snug">
                                                    {t.area_from} &rarr; {t.area_to}
                                                </h3>
                                                <p className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-slate-gray">
                                                    <span>
                                                        {t.estimated_distance_km} km
                                                    </span>
                                                    <span className="text-slate-gray/30">
                                                        •
                                                    </span>
                                                    <span>
                                                        {t.estimated_duration_minutes} menit
                                                    </span>
                                                </p>
                                                <p className="mt-4 text-lg font-extrabold text-navy-blue">
                                                    Rp {t.tariff.toLocaleString('id-ID')}
                                                </p>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}

                            {errors.shuttle_tariff_id && (
                                <p className="mt-3 text-xs font-semibold text-red-600">
                                    {errors.shuttle_tariff_id}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Reservation Form */}
                    <div className="space-y-6">
                        <div className="rounded-[24px] border border-slate-gray/10 bg-base-white p-6 shadow-sm sm:p-8">
                            <h2 className="mb-5 text-xs font-bold tracking-wider text-slate-gray uppercase">
                                Detail Formulir
                            </h2>

                            <form
                                onSubmit={submit}
                                className="flex flex-col gap-5"
                            >
                                <div className="space-y-1.5">
                                    <label className="block text-xs font-bold text-navy-blue uppercase tracking-wider">
                                        Alamat Penjemputan
                                    </label>
                                    <textarea
                                        value={data.pickup_address}
                                        onChange={(e) =>
                                            setData(
                                                'pickup_address',
                                                e.target.value,
                                            )
                                        }
                                        rows={2}
                                        placeholder="Masukkan alamat penjemputan lengkap..."
                                        className="w-full rounded-[16px] border border-slate-gray/20 bg-surface-gray px-4 py-3 text-sm outline-none transition-all focus:border-navy-blue focus:bg-base-white focus:ring-4 focus:ring-navy-blue/5"
                                    />
                                    {errors.pickup_address && (
                                        <p className="text-xs font-semibold text-red-600">
                                            {errors.pickup_address}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-1.5">
                                    <label className="block text-xs font-bold text-navy-blue uppercase tracking-wider">
                                        Alamat Tujuan
                                    </label>
                                    <textarea
                                        value={data.destination_address}
                                        onChange={(e) =>
                                            setData(
                                                'destination_address',
                                                e.target.value,
                                            )
                                        }
                                        rows={2}
                                        placeholder="Masukkan alamat tujuan lengkap..."
                                        className="w-full rounded-[16px] border border-slate-gray/20 bg-surface-gray px-4 py-3 text-sm outline-none transition-all focus:border-navy-blue focus:bg-base-white focus:ring-4 focus:ring-navy-blue/5"
                                    />
                                    {errors.destination_address && (
                                        <p className="text-xs font-semibold text-red-600">
                                            {errors.destination_address}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-1.5">
                                    <label className="block text-xs font-bold text-navy-blue uppercase tracking-wider">
                                        Jadwal Keberangkatan
                                    </label>
                                    <input
                                        type="datetime-local"
                                        value={data.scheduled_at}
                                        onChange={(e) =>
                                            setData(
                                                'scheduled_at',
                                                e.target.value,
                                            )
                                        }
                                        className="w-full rounded-full border border-slate-gray/20 bg-surface-gray px-4 py-3 text-sm outline-none transition-all focus:border-navy-blue focus:bg-base-white focus:ring-4 focus:ring-navy-blue/5"
                                    />
                                    {errors.scheduled_at && (
                                        <p className="text-xs font-semibold text-red-600">
                                            {errors.scheduled_at}
                                        </p>
                                    )}
                                </div>

                                {selected && (
                                    <div className="rounded-[16px] border border-slate-gray/10 bg-surface-gray p-4 space-y-2.5">
                                        <div className="flex justify-between text-xs font-bold text-slate-gray">
                                            <span>Tarif Dasar</span>
                                            <span>
                                                Rp {selected.tariff.toLocaleString('id-ID')}
                                            </span>
                                        </div>
                                        <div className="h-px bg-slate-gray/15" />
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-extrabold text-navy-blue uppercase tracking-wide">
                                                Total Pembayaran
                                            </span>
                                            <span className="text-xl font-extrabold text-navy-blue">
                                                Rp {selected.tariff.toLocaleString('id-ID')}
                                            </span>
                                        </div>
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={
                                        processing || !data.shuttle_tariff_id
                                    }
                                    className="flex w-full min-h-[48px] items-center justify-center gap-2 rounded-full bg-navy-blue py-3.5 text-sm font-bold text-amber-gold shadow-md transition-all hover:bg-navy-blue/90 hover:shadow-lg disabled:opacity-50"
                                >
                                    {processing
                                        ? 'Memproses...'
                                        : 'Buat Pesanan Shuttle'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </CustomerLayout>
    );
}
