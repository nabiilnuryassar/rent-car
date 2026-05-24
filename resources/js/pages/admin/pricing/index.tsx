import { router, useForm } from '@inertiajs/react';
import { Pencil, Plus, Search, Trash2, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { useConfirm } from '@/components/ui/confirm-modal';
import Modal from '@/components/ui/Modal';
import Pagination from '@/components/ui/pagination';
import { toast } from '@/components/ui/toast';
import AdminLayout from '@/layouts/admin-layout';
import admin from '@/routes/admin';
import type { PaginationLink } from '@/types/pagination';

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

type Filters = {
    search: string;
    category_id: number | null;
    rental_unit: string | null;
};

type Paginated<T> = {
    data: T[];
    links: PaginationLink[];
    current_page: number;
    last_page: number;
    total: number;
};

type Props = {
    pricingRules: Paginated<PricingRule>;
    overtimePenalties: Paginated<OvertimePenalty>;
    categories: Category[];
    filters: Filters;
};

const rentalUnits = ['hour', 'day', 'week', 'month'] as const;
const unitLabels: Record<string, string> = {
    hour: 'Per Jam',
    day: 'Per Hari',
    week: 'Per Minggu',
    month: 'Per Bulan',
};

const inputBase =
    'w-full rounded-2xl border border-slate-gray/20 bg-base-white px-4 py-2.5 text-sm font-medium text-navy-blue transition-all outline-none placeholder:text-slate-gray/50 focus:border-navy-blue focus:ring-4 focus:ring-navy-blue/10';

function rupiah(value: number) {
    return `Rp ${value.toLocaleString('id-ID')}`;
}

export default function PricingIndex({
    pricingRules,
    overtimePenalties,
    categories,
    filters,
}: Props) {
    const confirm = useConfirm();
    const [activeTab, setActiveTab] = useState<'pricing' | 'overtime'>(
        'pricing',
    );

    // Local filter state — debounced into the URL.
    const [search, setSearch] = useState(filters.search ?? '');
    const [categoryId, setCategoryId] = useState<string>(
        filters.category_id ? String(filters.category_id) : '',
    );
    const [rentalUnit, setRentalUnit] = useState<string>(
        filters.rental_unit ?? '',
    );

    useEffect(() => {
        const handle = setTimeout(() => {
            const params: Record<string, string> = {};

            if (search.trim()) {
                params.search = search.trim();
            }

            if (categoryId) {
                params.category_id = categoryId;
            }

            if (rentalUnit) {
                params.rental_unit = rentalUnit;
            }

            router.get(admin.pricingRules.index.url(), params, {
                preserveState: true,
                preserveScroll: true,
                replace: true,
                only: ['pricingRules', 'overtimePenalties', 'filters'],
            });
        }, 300);

        return () => clearTimeout(handle);
    }, [search, categoryId, rentalUnit]);

    const hasActiveFilter =
        search.trim().length > 0 || categoryId !== '' || rentalUnit !== '';

    function clearFilters() {
        setSearch('');
        setCategoryId('');
        setRentalUnit('');
    }

    /* ---------------------------- Add pricing rule ---------------------------- */
    const addForm = useForm({
        vehicle_category_id: '',
        rental_unit: 'day',
        min_duration: '1',
        max_duration: '30',
        base_rate: '',
        discount_rate: '',
    });

    function submitRule(e: React.FormEvent) {
        e.preventDefault();
        const discountPct = parseFloat(addForm.data.discount_rate);
        const discountDecimal =
            addForm.data.discount_rate !== '' &&
            !isNaN(discountPct) &&
            discountPct > 0
                ? discountPct / 100
                : null;
        router.post(
            admin.pricingRules.store.url(),
            {
                vehicle_category_id: addForm.data.vehicle_category_id,
                rental_unit: addForm.data.rental_unit,
                min_duration: addForm.data.min_duration,
                max_duration: addForm.data.max_duration,
                base_rate: addForm.data.base_rate,
                discount_rate: discountDecimal !== null ? discountDecimal : '',
            },
            {
                onSuccess: () => addForm.reset(),
                onError: () => toast.error('Periksa isian formulir.'),
            },
        );
    }

    /* ---------------------------- Edit pricing rule --------------------------- */
    const [editing, setEditing] = useState<PricingRule | null>(null);
    const editForm = useForm({
        vehicle_category_id: '',
        rental_unit: 'day',
        min_duration: '1',
        max_duration: '30',
        base_rate: '',
        discount_rate: '',
    });

    function openEdit(rule: PricingRule) {
        setEditing(rule);
        const discountPct = rule.discount_rate
            ? Math.round(rule.discount_rate * 100)
            : 0;
        editForm.setData({
            vehicle_category_id: String(rule.vehicle_category_id),
            rental_unit: rule.rental_unit,
            min_duration: String(rule.min_duration),
            max_duration: String(rule.max_duration),
            base_rate: String(rule.base_rate),
            discount_rate: discountPct > 0 ? String(discountPct) : '',
        });
    }

    function submitEdit(e: React.FormEvent) {
        e.preventDefault();

        if (!editing) {
            return;
        }

        const discountPct = parseFloat(editForm.data.discount_rate);
        const discountDecimal =
            editForm.data.discount_rate !== '' &&
            !isNaN(discountPct) &&
            discountPct > 0
                ? discountPct / 100
                : 0;
        router.put(
            admin.pricingRules.update.url(editing.id),
            {
                vehicle_category_id: editForm.data.vehicle_category_id,
                rental_unit: editForm.data.rental_unit,
                min_duration: editForm.data.min_duration,
                max_duration: editForm.data.max_duration,
                base_rate: editForm.data.base_rate,
                discount_rate: discountDecimal,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setEditing(null);
                    editForm.reset();
                },
                onError: () => toast.error('Periksa isian formulir.'),
            },
        );
    }

    /* ---------------------------- Add overtime ----------------------------- */
    const penaltyForm = useForm({ vehicle_category_id: '', hourly_rate: '' });

    function submitPenalty(e: React.FormEvent) {
        e.preventDefault();
        penaltyForm.post(admin.overtimePenalties.store.url(), {
            onSuccess: () => penaltyForm.reset(),
            onError: () => toast.error('Periksa isian formulir.'),
        });
    }

    /* ---------------------------- Edit overtime ----------------------------- */
    const [editingPenalty, setEditingPenalty] =
        useState<OvertimePenalty | null>(null);
    const penaltyEditForm = useForm({
        vehicle_category_id: '',
        hourly_rate: '',
    });

    function openEditPenalty(penalty: OvertimePenalty) {
        setEditingPenalty(penalty);
        penaltyEditForm.setData({
            vehicle_category_id: String(penalty.vehicle_category_id),
            hourly_rate: String(penalty.hourly_rate),
        });
    }

    function submitEditPenalty(e: React.FormEvent) {
        e.preventDefault();

        if (!editingPenalty) {
            return;
        }

        router.put(
            admin.overtimePenalties.update.url(editingPenalty.id),
            penaltyEditForm.data,
            {
                preserveScroll: true,
                onSuccess: () => {
                    setEditingPenalty(null);
                    penaltyEditForm.reset();
                },
                onError: () => toast.error('Periksa isian formulir.'),
            },
        );
    }

    /* ---------------------------- Delete handlers ---------------------------- */
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

        if (!ok) {
            return;
        }

        router.delete(admin.pricingRules.destroy.url(rule.id), {
            preserveScroll: true,
        });
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

        if (!ok) {
            return;
        }

        router.delete(admin.overtimePenalties.destroy.url(penalty.id), {
            preserveScroll: true,
        });
    }

    const previewActual = useMemo(() => {
        const base = parseFloat(addForm.data.base_rate);
        const disc = parseFloat(addForm.data.discount_rate);

        if (!base || isNaN(base)) {
            return null;
        }

        if (!disc || isNaN(disc) || disc <= 0) {
            return null;
        }

        return Math.round(base * (1 - disc / 100));
    }, [addForm.data.base_rate, addForm.data.discount_rate]);

    return (
        <AdminLayout
            title="Harga dan Tarif"
            breadcrumbs={[
                { label: 'Dasbor', href: admin.dashboard.url() },
                { label: 'Harga dan Tarif' },
            ]}
        >
            {/* Tabs */}
            <div className="mb-6 flex w-fit gap-1 rounded-full bg-base-white p-1 shadow-rental">
                {(['pricing', 'overtime'] as const).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`rounded-full px-6 py-2 text-sm font-semibold transition-colors ${
                            activeTab === tab
                                ? 'bg-amber-gold text-navy-blue'
                                : 'text-slate-gray hover:text-navy-blue'
                        }`}
                    >
                        {tab === 'pricing'
                            ? 'Aturan Harga'
                            : 'Denda Kelebihan Waktu'}
                    </button>
                ))}
            </div>

            {/* Filter bar */}
            <div className="mb-6 grid gap-3 rounded-3xl border border-slate-gray/15 bg-base-white p-4 shadow-rental md:grid-cols-[1fr_auto_auto_auto] md:items-center">
                <div className="relative">
                    <Search className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-slate-gray" />
                    <input
                        type="search"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Cari berdasarkan nama kategori..."
                        className={`${inputBase} pl-11`}
                    />
                </div>
                <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className={`${inputBase} md:w-56`}
                >
                    <option value="">Semua Kategori</option>
                    {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                            {c.name}
                        </option>
                    ))}
                </select>
                {activeTab === 'pricing' ? (
                    <select
                        value={rentalUnit}
                        onChange={(e) => setRentalUnit(e.target.value)}
                        className={`${inputBase} md:w-44`}
                    >
                        <option value="">Semua Unit</option>
                        {rentalUnits.map((u) => (
                            <option key={u} value={u}>
                                {unitLabels[u]}
                            </option>
                        ))}
                    </select>
                ) : (
                    <div />
                )}
                <button
                    type="button"
                    onClick={clearFilters}
                    disabled={!hasActiveFilter}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-slate-gray/20 px-4 text-sm font-semibold text-slate-gray transition hover:border-navy-blue hover:text-navy-blue disabled:pointer-events-none disabled:opacity-40"
                >
                    <X className="h-4 w-4" />
                    Reset
                </button>
            </div>

            {activeTab === 'pricing' && (
                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Add form */}
                    <div className="rounded-3xl border border-slate-gray/15 bg-base-white p-6 shadow-rental">
                        <div className="mb-5 flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-gold/15 text-amber-gold">
                                <Plus className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-navy-blue">
                                    Tambah Aturan Harga
                                </h3>
                                <p className="text-xs text-slate-gray">
                                    Tetapkan tarif sewa per kategori &amp; unit.
                                </p>
                            </div>
                        </div>
                        <form
                            onSubmit={submitRule}
                            className="flex flex-col gap-3"
                        >
                            <select
                                value={addForm.data.vehicle_category_id}
                                onChange={(e) =>
                                    addForm.setData(
                                        'vehicle_category_id',
                                        e.target.value,
                                    )
                                }
                                className={inputBase}
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
                                onChange={(e) =>
                                    addForm.setData(
                                        'rental_unit',
                                        e.target.value,
                                    )
                                }
                                className={inputBase}
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
                                    placeholder="Min"
                                    value={addForm.data.min_duration}
                                    onChange={(e) =>
                                        addForm.setData(
                                            'min_duration',
                                            e.target.value,
                                        )
                                    }
                                    className={inputBase}
                                />
                                <input
                                    type="number"
                                    placeholder="Max"
                                    value={addForm.data.max_duration}
                                    onChange={(e) =>
                                        addForm.setData(
                                            'max_duration',
                                            e.target.value,
                                        )
                                    }
                                    className={inputBase}
                                />
                            </div>
                            <input
                                type="number"
                                placeholder="Harga dasar (Rp)"
                                value={addForm.data.base_rate}
                                onChange={(e) =>
                                    addForm.setData('base_rate', e.target.value)
                                }
                                className={inputBase}
                            />
                            <div className="relative">
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    step="1"
                                    placeholder="Diskon % (opsional)"
                                    value={addForm.data.discount_rate}
                                    onChange={(e) =>
                                        addForm.setData(
                                            'discount_rate',
                                            e.target.value,
                                        )
                                    }
                                    className={`${inputBase} pr-10`}
                                />
                                <span className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-xs font-bold text-slate-gray">
                                    %
                                </span>
                            </div>
                            {previewActual !== null && (
                                <div className="flex items-center justify-between rounded-2xl border border-success-green/20 bg-success-green/5 px-4 py-2.5 text-xs">
                                    <span className="font-semibold text-success-green">
                                        Setelah diskon
                                    </span>
                                    <span className="font-bold text-navy-blue">
                                        {rupiah(previewActual)}
                                    </span>
                                </div>
                            )}
                            <Button
                                type="submit"
                                variant="accent"
                                loading={addForm.processing}
                                leadingIcon={<Plus className="h-4 w-4" />}
                            >
                                Tambah Aturan
                            </Button>
                        </form>
                    </div>

                    {/* Table */}
                    <div className="overflow-hidden rounded-3xl border border-slate-gray/15 bg-base-white shadow-rental lg:col-span-2">
                        <div className="flex items-center justify-between border-b border-slate-gray/10 px-6 py-4">
                            <div>
                                <h3 className="text-base font-bold text-navy-blue">
                                    Daftar Aturan Harga
                                </h3>
                                <p className="text-xs text-slate-gray">
                                    {pricingRules.total} aturan terdaftar
                                    {hasActiveFilter && ' · sedang difilter'}
                                </p>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-slate-gray/10 bg-surface-gray/40 text-left text-xs font-semibold tracking-wide text-slate-gray uppercase">
                                        <th className="px-6 py-3.5">
                                            Kategori
                                        </th>
                                        <th className="px-6 py-3.5">Unit</th>
                                        <th className="px-6 py-3.5">Durasi</th>
                                        <th className="px-6 py-3.5">
                                            Harga Dasar
                                        </th>
                                        <th className="px-6 py-3.5">Diskon</th>
                                        <th className="px-6 py-3.5">Aktual</th>
                                        <th className="px-6 py-3.5 text-right">
                                            Aksi
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pricingRules.data.length === 0 && (
                                        <tr>
                                            <td
                                                colSpan={7}
                                                className="px-6 py-12 text-center text-slate-gray"
                                            >
                                                {hasActiveFilter
                                                    ? 'Tidak ada aturan yang cocok dengan filter.'
                                                    : 'Belum ada aturan harga.'}
                                            </td>
                                        </tr>
                                    )}
                                    {pricingRules.data.map((r) => {
                                        const discountRate =
                                            r.discount_rate ?? 0;
                                        const discountPct = Math.round(
                                            discountRate * 100,
                                        );
                                        const actualRate = Math.round(
                                            r.base_rate * (1 - discountRate),
                                        );

                                        return (
                                            <tr
                                                key={r.id}
                                                className="border-b border-slate-gray/10 transition-colors last:border-0 hover:bg-surface-gray/30"
                                            >
                                                <td className="px-6 py-4 font-semibold text-navy-blue">
                                                    {r.category.name}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="inline-flex items-center rounded-full bg-navy-blue/5 px-2.5 py-1 text-xs font-semibold text-navy-blue">
                                                        {
                                                            unitLabels[
                                                                r.rental_unit
                                                            ]
                                                        }
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-slate-gray">
                                                    {r.min_duration}–
                                                    {r.max_duration}
                                                </td>
                                                <td className="px-6 py-4 text-slate-gray">
                                                    {discountPct > 0 ? (
                                                        <span className="line-through">
                                                            {rupiah(
                                                                r.base_rate,
                                                            )}
                                                        </span>
                                                    ) : (
                                                        <span>
                                                            {rupiah(
                                                                r.base_rate,
                                                            )}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {discountPct > 0 ? (
                                                        <span className="inline-flex items-center rounded-full bg-success-green/10 px-2.5 py-1 text-xs font-bold text-success-green">
                                                            -{discountPct}%
                                                        </span>
                                                    ) : (
                                                        <span className="text-xs text-slate-gray/40">
                                                            —
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 font-bold text-navy-blue">
                                                    {rupiah(actualRate)}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() =>
                                                                openEdit(r)
                                                            }
                                                            leadingIcon={
                                                                <Pencil className="h-3.5 w-3.5" />
                                                            }
                                                            className="text-navy-blue hover:bg-navy-blue/10"
                                                        >
                                                            Edit
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() =>
                                                                deleteRule(r)
                                                            }
                                                            leadingIcon={
                                                                <Trash2 className="h-3.5 w-3.5" />
                                                            }
                                                            className="text-red-600 hover:bg-red-50 hover:text-red-700"
                                                        >
                                                            Hapus
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                        {pricingRules.last_page > 1 && (
                            <div className="border-t border-slate-gray/10 px-6 py-4">
                                <Pagination
                                    links={pricingRules.links}
                                    currentPage={pricingRules.current_page}
                                    lastPage={pricingRules.last_page}
                                    className="!mt-0"
                                />
                            </div>
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'overtime' && (
                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Add form */}
                    <div className="rounded-3xl border border-slate-gray/15 bg-base-white p-6 shadow-rental">
                        <div className="mb-5 flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-gold/15 text-amber-gold">
                                <Plus className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-navy-blue">
                                    Tambah Denda
                                </h3>
                                <p className="text-xs text-slate-gray">
                                    Tarif per jam untuk keterlambatan.
                                </p>
                            </div>
                        </div>
                        <form
                            onSubmit={submitPenalty}
                            className="flex flex-col gap-3"
                        >
                            <select
                                value={penaltyForm.data.vehicle_category_id}
                                onChange={(e) =>
                                    penaltyForm.setData(
                                        'vehicle_category_id',
                                        e.target.value,
                                    )
                                }
                                className={inputBase}
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
                                onChange={(e) =>
                                    penaltyForm.setData(
                                        'hourly_rate',
                                        e.target.value,
                                    )
                                }
                                className={inputBase}
                            />
                            <Button
                                type="submit"
                                variant="accent"
                                loading={penaltyForm.processing}
                                leadingIcon={<Plus className="h-4 w-4" />}
                            >
                                Tambah Denda
                            </Button>
                        </form>
                    </div>
                    <div className="overflow-hidden rounded-3xl border border-slate-gray/15 bg-base-white shadow-rental lg:col-span-2">
                        <div className="flex items-center justify-between border-b border-slate-gray/10 px-6 py-4">
                            <div>
                                <h3 className="text-base font-bold text-navy-blue">
                                    Daftar Denda
                                </h3>
                                <p className="text-xs text-slate-gray">
                                    {overtimePenalties.total} item terdaftar
                                    {hasActiveFilter && ' · sedang difilter'}
                                </p>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-slate-gray/10 bg-surface-gray/40 text-left text-xs font-semibold tracking-wide text-slate-gray uppercase">
                                        <th className="px-6 py-3.5">
                                            Kategori
                                        </th>
                                        <th className="px-6 py-3.5">
                                            Tarif per Jam
                                        </th>
                                        <th className="px-6 py-3.5 text-right">
                                            Aksi
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {overtimePenalties.data.length === 0 && (
                                        <tr>
                                            <td
                                                colSpan={3}
                                                className="px-6 py-12 text-center text-slate-gray"
                                            >
                                                {hasActiveFilter
                                                    ? 'Tidak ada denda yang cocok dengan filter.'
                                                    : 'Belum ada denda kelebihan waktu.'}
                                            </td>
                                        </tr>
                                    )}
                                    {overtimePenalties.data.map((p) => (
                                        <tr
                                            key={p.id}
                                            className="border-b border-slate-gray/10 transition-colors last:border-0 hover:bg-surface-gray/30"
                                        >
                                            <td className="px-6 py-4 font-semibold text-navy-blue">
                                                {p.category.name}
                                            </td>
                                            <td className="px-6 py-4 font-bold text-navy-blue">
                                                {rupiah(p.hourly_rate)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-end gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() =>
                                                            openEditPenalty(p)
                                                        }
                                                        leadingIcon={
                                                            <Pencil className="h-3.5 w-3.5" />
                                                        }
                                                        className="text-navy-blue hover:bg-navy-blue/10"
                                                    >
                                                        Edit
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() =>
                                                            deletePenalty(p)
                                                        }
                                                        leadingIcon={
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                        }
                                                        className="text-red-600 hover:bg-red-50 hover:text-red-700"
                                                    >
                                                        Hapus
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {overtimePenalties.last_page > 1 && (
                            <div className="border-t border-slate-gray/10 px-6 py-4">
                                <Pagination
                                    links={overtimePenalties.links}
                                    currentPage={overtimePenalties.current_page}
                                    lastPage={overtimePenalties.last_page}
                                    className="!mt-0"
                                />
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Edit pricing rule modal */}
            <Modal
                isOpen={editing !== null}
                onClose={() => setEditing(null)}
                title="Edit Aturan Harga"
                maxWidth="lg"
            >
                <form onSubmit={submitEdit} className="grid gap-4">
                    <label className="grid gap-1.5">
                        <span className="text-xs font-semibold text-slate-gray uppercase">
                            Kategori
                        </span>
                        <select
                            value={editForm.data.vehicle_category_id}
                            onChange={(e) =>
                                editForm.setData(
                                    'vehicle_category_id',
                                    e.target.value,
                                )
                            }
                            className={inputBase}
                        >
                            <option value="">Pilih Kategori</option>
                            {categories.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.name}
                                </option>
                            ))}
                        </select>
                    </label>
                    <label className="grid gap-1.5">
                        <span className="text-xs font-semibold text-slate-gray uppercase">
                            Unit Sewa
                        </span>
                        <select
                            value={editForm.data.rental_unit}
                            onChange={(e) =>
                                editForm.setData('rental_unit', e.target.value)
                            }
                            className={inputBase}
                        >
                            {rentalUnits.map((u) => (
                                <option key={u} value={u}>
                                    {unitLabels[u]}
                                </option>
                            ))}
                        </select>
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                        <label className="grid gap-1.5">
                            <span className="text-xs font-semibold text-slate-gray uppercase">
                                Durasi Min
                            </span>
                            <input
                                type="number"
                                value={editForm.data.min_duration}
                                onChange={(e) =>
                                    editForm.setData(
                                        'min_duration',
                                        e.target.value,
                                    )
                                }
                                className={inputBase}
                            />
                        </label>
                        <label className="grid gap-1.5">
                            <span className="text-xs font-semibold text-slate-gray uppercase">
                                Durasi Max
                            </span>
                            <input
                                type="number"
                                value={editForm.data.max_duration}
                                onChange={(e) =>
                                    editForm.setData(
                                        'max_duration',
                                        e.target.value,
                                    )
                                }
                                className={inputBase}
                            />
                        </label>
                    </div>
                    <label className="grid gap-1.5">
                        <span className="text-xs font-semibold text-slate-gray uppercase">
                            Harga Dasar
                        </span>
                        <input
                            type="number"
                            value={editForm.data.base_rate}
                            onChange={(e) =>
                                editForm.setData('base_rate', e.target.value)
                            }
                            className={inputBase}
                        />
                    </label>
                    <label className="grid gap-1.5">
                        <span className="text-xs font-semibold text-slate-gray uppercase">
                            Diskon (%)
                        </span>
                        <div className="relative">
                            <input
                                type="number"
                                min="0"
                                max="100"
                                value={editForm.data.discount_rate}
                                onChange={(e) =>
                                    editForm.setData(
                                        'discount_rate',
                                        e.target.value,
                                    )
                                }
                                className={`${inputBase} pr-10`}
                            />
                            <span className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-xs font-bold text-slate-gray">
                                %
                            </span>
                        </div>
                    </label>
                    <div className="flex justify-end gap-2 pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setEditing(null)}
                        >
                            Batal
                        </Button>
                        <Button
                            type="submit"
                            variant="accent"
                            loading={editForm.processing}
                        >
                            Simpan Perubahan
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Edit overtime penalty modal */}
            <Modal
                isOpen={editingPenalty !== null}
                onClose={() => setEditingPenalty(null)}
                title="Edit Denda Kelebihan Waktu"
            >
                <form onSubmit={submitEditPenalty} className="grid gap-4">
                    <label className="grid gap-1.5">
                        <span className="text-xs font-semibold text-slate-gray uppercase">
                            Kategori
                        </span>
                        <select
                            value={penaltyEditForm.data.vehicle_category_id}
                            onChange={(e) =>
                                penaltyEditForm.setData(
                                    'vehicle_category_id',
                                    e.target.value,
                                )
                            }
                            className={inputBase}
                        >
                            <option value="">Pilih Kategori</option>
                            {categories.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.name}
                                </option>
                            ))}
                        </select>
                    </label>
                    <label className="grid gap-1.5">
                        <span className="text-xs font-semibold text-slate-gray uppercase">
                            Tarif per Jam (Rp)
                        </span>
                        <input
                            type="number"
                            value={penaltyEditForm.data.hourly_rate}
                            onChange={(e) =>
                                penaltyEditForm.setData(
                                    'hourly_rate',
                                    e.target.value,
                                )
                            }
                            className={inputBase}
                        />
                    </label>
                    <div className="flex justify-end gap-2 pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setEditingPenalty(null)}
                        >
                            Batal
                        </Button>
                        <Button
                            type="submit"
                            variant="accent"
                            loading={penaltyEditForm.processing}
                        >
                            Simpan Perubahan
                        </Button>
                    </div>
                </form>
            </Modal>
        </AdminLayout>
    );
}
