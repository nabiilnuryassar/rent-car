import { useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useConfirm } from '@/components/ui/confirm-modal';
import { toast } from '@/components/ui/toast';
import AdminLayout from '@/layouts/admin-layout';
import admin from '@/routes/admin';

type PricingRule = {
    id: number;
    vehicle_category_id: number;
    rental_unit: string;
    min_duration: number;
    max_duration: number;
    base_rate: number;
    discount_rate: number | null;
    category: { name: string };
};
type OvertimePenalty = {
    id: number;
    vehicle_category_id: number;
    hourly_rate: number;
    category: { name: string };
};
type Category = { id: number; name: string };

type Props = {
    pricingRules: PricingRule[];
    overtimePenalties: OvertimePenalty[];
    categories: Category[];
};

const rentalUnits = ['hour', 'day', 'week', 'month'];
const unitLabels: Record<string, string> = {
    hour: 'Per Jam',
    day: 'Per Hari',
    week: 'Per Minggu',
    month: 'Per Bulan',
};

export default function PricingIndex({
    pricingRules,
    overtimePenalties,
    categories,
}: Props) {
    const confirm = useConfirm();
    const [activeTab, setActiveTab] = useState<'pricing' | 'overtime'>('pricing');

    const addForm = useForm({
        vehicle_category_id: '',
        rental_unit: 'day',
        min_duration: '1',
        max_duration: '30',
        base_rate: '',
        discount_rate: '',
    });
    const penaltyForm = useForm({ vehicle_category_id: '', hourly_rate: '' });

    function submitRule(e: React.FormEvent) {
        e.preventDefault();
        addForm.post(admin.pricingRules.store.url(), {
            onSuccess: () => addForm.reset(),
            onError: () => toast.error('Periksa isian formulir.'),
        });
    }

    function submitPenalty(e: React.FormEvent) {
        e.preventDefault();
        penaltyForm.post(admin.overtimePenalties.store.url(), {
            onSuccess: () => penaltyForm.reset(),
            onError: () => toast.error('Periksa isian formulir.'),
        });
    }

    async function deleteRule(rule: PricingRule) {
        const ok = await confirm({
            title: 'Hapus aturan harga?',
            description: (
                <span>
                    Aturan untuk kategori{' '}
                    <span className="font-semibold text-navy-blue">
                        {rule.category.name}
                    </span>{' '}
                    ({unitLabels[rule.rental_unit]}) akan dihapus permanen.
                </span>
            ),
            confirmLabel: 'Hapus',
            variant: 'danger',
        });
        if (!ok) return;
        router.delete(admin.pricingRules.destroy.url(rule.id));
    }

    async function deletePenalty(penalty: OvertimePenalty) {
        const ok = await confirm({
            title: 'Hapus denda kelebihan waktu?',
            description: (
                <span>
                    Denda untuk kategori{' '}
                    <span className="font-semibold text-navy-blue">
                        {penalty.category.name}
                    </span>{' '}
                    akan dihapus permanen.
                </span>
            ),
            confirmLabel: 'Hapus',
            variant: 'danger',
        });
        if (!ok) return;
        router.delete(admin.overtimePenalties.destroy.url(penalty.id));
    }

    return (
        <AdminLayout
            title="Harga dan Tarif"
            breadcrumbs={[
                { label: 'Dasbor', href: admin.dashboard.url() },
                { label: 'Harga dan Tarif' },
            ]}
        >
            <div className="mb-6 flex w-fit gap-1 rounded-full bg-base-white p-1 shadow-rental">
                {(['pricing', 'overtime'] as const).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`rounded-full px-6 py-2 text-sm font-semibold transition-colors ${activeTab === tab ? 'bg-amber-gold text-navy-blue' : 'text-slate-gray hover:text-navy-blue'}`}
                    >
                        {tab === 'pricing' ? 'Aturan Harga' : 'Denda Kelebihan Waktu'}
                    </button>
                ))}
            </div>

            {activeTab === 'pricing' && (
                <div className="grid gap-6 lg:grid-cols-3">
                    <div className="rounded-2xl border border-slate-gray/15 bg-base-white p-6 shadow-rental">
                        <h3 className="mb-4 font-semibold">Tambah Aturan Harga</h3>
                        <form onSubmit={submitRule} className="flex flex-col gap-3">
                            <select
                                value={addForm.data.vehicle_category_id}
                                onChange={(e) => addForm.setData('vehicle_category_id', e.target.value)}
                                className="w-full rounded-full border border-slate-gray/20 bg-base-white px-3 py-2 text-sm"
                            >
                                <option value="">Pilih Kategori</option>
                                {categories.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.name}
                                    </option>
                                ))}
                            </select>
                            <select
                                value={addForm.data.rental_unit}
                                onChange={(e) => addForm.setData('rental_unit', e.target.value)}
                                className="w-full rounded-full border border-slate-gray/20 bg-base-white px-3 py-2 text-sm"
                            >
                                {rentalUnits.map((u) => (
                                    <option key={u} value={u}>
                                        {unitLabels[u]}
                                    </option>
                                ))}
                            </select>
                            <div className="flex gap-2">
                                <input
                                    type="number"
                                    placeholder="Minimum"
                                    value={addForm.data.min_duration}
                                    onChange={(e) => addForm.setData('min_duration', e.target.value)}
                                    className="w-full rounded-full border border-slate-gray/20 bg-base-white px-3 py-2 text-sm"
                                />
                                <input
                                    type="number"
                                    placeholder="Maksimum"
                                    value={addForm.data.max_duration}
                                    onChange={(e) => addForm.setData('max_duration', e.target.value)}
                                    className="w-full rounded-full border border-slate-gray/20 bg-base-white px-3 py-2 text-sm"
                                />
                            </div>
                            <input
                                type="number"
                                placeholder="Harga dasar (Rp)"
                                value={addForm.data.base_rate}
                                onChange={(e) => addForm.setData('base_rate', e.target.value)}
                                className="w-full rounded-full border border-slate-gray/20 bg-base-white px-3 py-2 text-sm"
                            />
                            <Button type="submit" variant="accent" loading={addForm.processing}>
                                Tambah
                            </Button>
                        </form>
                    </div>

                    <div className="overflow-hidden rounded-2xl border border-slate-gray/15 bg-base-white shadow-rental lg:col-span-2">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-slate-gray/15 bg-surface-gray/60 text-left text-xs font-semibold tracking-wide text-slate-gray uppercase">
                                    <th className="px-5 py-4">Kategori</th>
                                    <th className="px-5 py-4">Unit</th>
                                    <th className="px-5 py-4">Durasi</th>
                                    <th className="px-5 py-4">Harga per Unit</th>
                                    <th className="px-5 py-4"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {pricingRules.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-5 py-10 text-center text-slate-gray">
                                            Belum ada aturan harga.
                                        </td>
                                    </tr>
                                )}
                                {pricingRules.map((r) => (
                                    <tr key={r.id} className="border-b border-slate-gray/10 transition-colors hover:bg-surface-gray/40">
                                        <td className="px-5 py-3">{r.category.name}</td>
                                        <td className="px-5 py-3">{unitLabels[r.rental_unit]}</td>
                                        <td className="px-5 py-3">{r.min_duration}-{r.max_duration}</td>
                                        <td className="px-5 py-3">Rp {r.base_rate.toLocaleString('id-ID')}</td>
                                        <td className="px-5 py-3">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-red-600 hover:bg-red-50 hover:text-red-700"
                                                onClick={() => deleteRule(r)}
                                            >
                                                Hapus
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'overtime' && (
                <div className="grid gap-6 lg:grid-cols-3">
                    <div className="rounded-2xl border border-slate-gray/15 bg-base-white p-6 shadow-rental">
                        <h3 className="mb-4 font-semibold">Tambah Denda Kelebihan Waktu</h3>
                        <form onSubmit={submitPenalty} className="flex flex-col gap-3">
                            <select
                                value={penaltyForm.data.vehicle_category_id}
                                onChange={(e) => penaltyForm.setData('vehicle_category_id', e.target.value)}
                                className="w-full rounded-full border border-slate-gray/20 bg-base-white px-3 py-2 text-sm"
                            >
                                <option value="">Pilih Kategori</option>
                                {categories.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.name}
                                    </option>
                                ))}
                            </select>
                            <input
                                type="number"
                                placeholder="Tarif per jam (Rp)"
                                value={penaltyForm.data.hourly_rate}
                                onChange={(e) => penaltyForm.setData('hourly_rate', e.target.value)}
                                className="w-full rounded-full border border-slate-gray/20 bg-base-white px-3 py-2 text-sm"
                            />
                            <Button type="submit" variant="accent" loading={penaltyForm.processing}>
                                Tambah
                            </Button>
                        </form>
                    </div>
                    <div className="overflow-hidden rounded-2xl border border-slate-gray/15 bg-base-white shadow-rental lg:col-span-2">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-slate-gray/15 bg-surface-gray/60 text-left text-xs font-semibold tracking-wide text-slate-gray uppercase">
                                    <th className="px-5 py-4">Kategori</th>
                                    <th className="px-5 py-4">Tarif per Jam</th>
                                    <th className="px-5 py-4"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {overtimePenalties.length === 0 && (
                                    <tr>
                                        <td colSpan={3} className="px-5 py-10 text-center text-slate-gray">
                                            Belum ada denda kelebihan waktu.
                                        </td>
                                    </tr>
                                )}
                                {overtimePenalties.map((p) => (
                                    <tr key={p.id} className="border-b border-slate-gray/10 transition-colors hover:bg-surface-gray/40">
                                        <td className="px-5 py-3">{p.category.name}</td>
                                        <td className="px-5 py-3">Rp {p.hourly_rate.toLocaleString('id-ID')}</td>
                                        <td className="px-5 py-3">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-red-600 hover:bg-red-50 hover:text-red-700"
                                                onClick={() => deletePenalty(p)}
                                            >
                                                Hapus
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
