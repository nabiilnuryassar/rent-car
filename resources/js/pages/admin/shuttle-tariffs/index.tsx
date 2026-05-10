import { useForm, router } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin-layout';
import admin from '@/routes/admin';

type Tariff = { id: number; area_from: string; area_to: string; estimated_distance_km: string; estimated_duration_minutes: number; tariff: number };

type Props = {
    tariffs: { data: Tariff[]; links: { url: string | null; label: string; active: boolean }[] };
};

export default function ShuttleTariffIndex({ tariffs }: Props) {
    const { data, setData, post, processing, errors, reset } = useForm({
        area_from: '', area_to: '', estimated_distance_km: '', estimated_duration_minutes: '', tariff: '',
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        post(admin.shuttleTariffs.store.url(), { onSuccess: () => reset() });
    }

    function deleteTariff(id: number) {
        if (confirm('Hapus tarif shuttle ini?')) {
router.delete(admin.shuttleTariffs.destroy.url(id));
}
    }

    return (
        <AdminLayout title="Tarif Shuttle">
            <div className="grid gap-6 lg:grid-cols-3">
                <div className="rounded-[20px] bg-surface-gray p-6 shadow-rental">
                    <h3 className="mb-4 font-semibold">Tambah Tarif</h3>
                    <form onSubmit={submit} className="flex flex-col gap-3">
                        <input type="text" placeholder="Dari (area asal)" value={data.area_from} onChange={(e) => setData('area_from', e.target.value)} className="w-full rounded-full border border-slate-gray/20 bg-base-white px-3 py-2 text-sm" />
                        {errors.area_from && <p className="text-xs text-red-600">{errors.area_from}</p>}
                        <input type="text" placeholder="Ke (area tujuan)" value={data.area_to} onChange={(e) => setData('area_to', e.target.value)} className="w-full rounded-full border border-slate-gray/20 bg-base-white px-3 py-2 text-sm" />
                        <input type="number" step="0.1" placeholder="Jarak (km)" value={data.estimated_distance_km} onChange={(e) => setData('estimated_distance_km', e.target.value)} className="w-full rounded-full border border-slate-gray/20 bg-base-white px-3 py-2 text-sm" />
                        <input type="number" placeholder="Estimasi durasi (menit)" value={data.estimated_duration_minutes} onChange={(e) => setData('estimated_duration_minutes', e.target.value)} className="w-full rounded-full border border-slate-gray/20 bg-base-white px-3 py-2 text-sm" />
                        <input type="number" placeholder="Tarif (Rp)" value={data.tariff} onChange={(e) => setData('tariff', e.target.value)} className="w-full rounded-full border border-slate-gray/20 bg-base-white px-3 py-2 text-sm" />
                        {errors.tariff && <p className="text-xs text-red-600">{errors.tariff}</p>}
                        <button type="submit" disabled={processing} className="rounded-full bg-amber-gold py-2 text-sm font-semibold hover:bg-yellow-300 disabled:opacity-50">Tambah Tarif</button>
                    </form>
                </div>

                <div className="lg:col-span-2 rounded-[20px] bg-surface-gray shadow-rental overflow-hidden">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-slate-gray/20 text-left text-xs font-semibold uppercase tracking-wide text-slate-gray">
                                <th className="px-5 py-4">Rute</th>
                                <th className="px-5 py-4">Jarak</th>
                                <th className="px-5 py-4">Durasi</th>
                                <th className="px-5 py-4">Tarif</th>
                                <th className="px-5 py-4"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {tariffs.data.length === 0 && <tr><td colSpan={5} className="px-5 py-10 text-center text-slate-gray">Belum ada tarif shuttle.</td></tr>}
                            {tariffs.data.map((t) => (
                                <tr key={t.id} className="border-b border-slate-gray/20/50 hover:bg-base-white/40 transition-colors">
                                    <td className="px-5 py-3 font-medium">{t.area_from} → {t.area_to}</td>
                                    <td className="px-5 py-3">{t.estimated_distance_km} km</td>
                                    <td className="px-5 py-3">{t.estimated_duration_minutes} mnt</td>
                                    <td className="px-5 py-3">Rp {t.tariff.toLocaleString('id-ID')}</td>
                                    <td className="px-5 py-3"><button onClick={() => deleteTariff(t.id)} className="text-xs text-red-600 hover:underline">Hapus</button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AdminLayout>
    );
}
