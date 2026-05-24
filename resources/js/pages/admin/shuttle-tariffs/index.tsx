import { router, useForm } from '@inertiajs/react';
import {
    ArrowRight,
    Clock,
    MapPin,
    Pencil,
    Plus,
    Route,
    Search,
    Trash2,
    X,
} from 'lucide-react';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { useConfirm } from '@/components/ui/confirm-modal';
import Modal from '@/components/ui/Modal';
import Pagination from '@/components/ui/pagination';
import { toast } from '@/components/ui/toast';
import AdminLayout from '@/layouts/admin-layout';
import admin from '@/routes/admin';
import type { PaginationLink } from '@/types/pagination';

type Tariff = {
    id: number;
    area_from: string;
    area_to: string;
    estimated_distance_km: string;
    estimated_duration_minutes: number;
    tariff: number;
};

type Filters = {
    search: string;
};

type Props = {
    tariffs: {
        data: Tariff[];
        links: PaginationLink[];
        current_page: number;
        last_page: number;
        from: number | null;
        to: number | null;
        total: number;
    };
    filters: Filters;
};

const inputBase =
    'w-full rounded-2xl border border-slate-gray/20 bg-base-white px-4 py-2.5 text-sm font-medium text-navy-blue transition-all outline-none placeholder:text-slate-gray/50 focus:border-navy-blue focus:ring-4 focus:ring-navy-blue/10';

function rupiah(value: number) {
    return `Rp ${value.toLocaleString('id-ID')}`;
}

export default function ShuttleTariffIndex({ tariffs, filters }: Props) {
    const confirm = useConfirm();

    /* ------------------------------- Filters ------------------------------- */
    const [search, setSearch] = useState(filters.search ?? '');

    useEffect(() => {
        const handle = setTimeout(() => {
            const params: Record<string, string> = {};

            if (search.trim()) {
                params.search = search.trim();
            }

            router.get(admin.shuttleTariffs.index.url(), params, {
                preserveState: true,
                preserveScroll: true,
                replace: true,
                only: ['tariffs', 'filters'],
            });
        }, 300);

        return () => clearTimeout(handle);
    }, [search]);

    const hasActiveFilter = search.trim().length > 0;

    /* ----------------------------- Add tariff ----------------------------- */
    const addForm = useForm({
        area_from: '',
        area_to: '',
        estimated_distance_km: '',
        estimated_duration_minutes: '',
        tariff: '',
    });

    function submitAdd(e: React.FormEvent) {
        e.preventDefault();
        addForm.post(admin.shuttleTariffs.store.url(), {
            preserveScroll: true,
            onSuccess: () => addForm.reset(),
            onError: () => toast.error('Periksa isian formulir.'),
        });
    }

    /* ----------------------------- Edit tariff ----------------------------- */
    const [editing, setEditing] = useState<Tariff | null>(null);
    const editForm = useForm({
        area_from: '',
        area_to: '',
        estimated_distance_km: '',
        estimated_duration_minutes: '',
        tariff: '',
    });

    function openEdit(tariff: Tariff) {
        setEditing(tariff);
        editForm.setData({
            area_from: tariff.area_from,
            area_to: tariff.area_to,
            estimated_distance_km: String(tariff.estimated_distance_km),
            estimated_duration_minutes: String(
                tariff.estimated_duration_minutes,
            ),
            tariff: String(tariff.tariff),
        });
    }

    function submitEdit(e: React.FormEvent) {
        e.preventDefault();

        if (!editing) {
            return;
        }

        router.put(admin.shuttleTariffs.update.url(editing.id), editForm.data, {
            preserveScroll: true,
            onSuccess: () => {
                setEditing(null);
                editForm.reset();
            },
            onError: () => toast.error('Periksa isian formulir.'),
        });
    }

    /* ----------------------------- Delete ----------------------------- */
    async function deleteTariff(tariff: Tariff) {
        const ok = await confirm({
            title: 'Hapus tarif shuttle?',
            description: (
                <span>
                    Rute{' '}
                    <span className="font-semibold text-navy-blue">
                        {tariff.area_from} → {tariff.area_to}
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

        router.delete(admin.shuttleTariffs.destroy.url(tariff.id), {
            preserveScroll: true,
        });
    }

    return (
        <AdminLayout
            title="Tarif Antar-Jemput"
            breadcrumbs={[
                { label: 'Dasbor', href: admin.dashboard.url() },
                { label: 'Antar-Jemput' },
            ]}
        >
            {/* Filter bar */}
            <div className="mb-6 grid gap-3 rounded-3xl border border-slate-gray/15 bg-base-white p-4 shadow-rental md:grid-cols-[1fr_auto] md:items-center">
                <div className="relative">
                    <Search className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-slate-gray" />
                    <input
                        type="search"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Cari berdasarkan area asal atau tujuan..."
                        className={`${inputBase} pl-11`}
                    />
                </div>
                <button
                    type="button"
                    onClick={() => setSearch('')}
                    disabled={!hasActiveFilter}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-slate-gray/20 px-4 text-sm font-semibold text-slate-gray transition hover:border-navy-blue hover:text-navy-blue disabled:pointer-events-none disabled:opacity-40"
                >
                    <X className="h-4 w-4" />
                    Reset
                </button>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Add form */}
                <div className="rounded-3xl border border-slate-gray/15 bg-base-white p-6 shadow-rental">
                    <div className="mb-5 flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-gold/15 text-amber-gold">
                            <Plus className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-navy-blue">
                                Tambah Tarif
                            </h3>
                            <p className="text-xs text-slate-gray">
                                Daftarkan rute baru beserta tarifnya.
                            </p>
                        </div>
                    </div>
                    <form
                        onSubmit={submitAdd}
                        className="flex flex-col gap-3"
                    >
                        <label className="grid gap-1.5">
                            <span className="text-xs font-semibold text-slate-gray uppercase">
                                Area Asal
                            </span>
                            <input
                                type="text"
                                placeholder="cth: Bandara Husein"
                                value={addForm.data.area_from}
                                onChange={(e) =>
                                    addForm.setData(
                                        'area_from',
                                        e.target.value,
                                    )
                                }
                                className={inputBase}
                            />
                            {addForm.errors.area_from && (
                                <p className="text-xs text-red-600">
                                    {addForm.errors.area_from}
                                </p>
                            )}
                        </label>
                        <label className="grid gap-1.5">
                            <span className="text-xs font-semibold text-slate-gray uppercase">
                                Area Tujuan
                            </span>
                            <input
                                type="text"
                                placeholder="cth: Lembang"
                                value={addForm.data.area_to}
                                onChange={(e) =>
                                    addForm.setData('area_to', e.target.value)
                                }
                                className={inputBase}
                            />
                            {addForm.errors.area_to && (
                                <p className="text-xs text-red-600">
                                    {addForm.errors.area_to}
                                </p>
                            )}
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            <label className="grid gap-1.5">
                                <span className="text-xs font-semibold text-slate-gray uppercase">
                                    Jarak (km)
                                </span>
                                <input
                                    type="number"
                                    step="0.1"
                                    placeholder="20"
                                    value={addForm.data.estimated_distance_km}
                                    onChange={(e) =>
                                        addForm.setData(
                                            'estimated_distance_km',
                                            e.target.value,
                                        )
                                    }
                                    className={inputBase}
                                />
                            </label>
                            <label className="grid gap-1.5">
                                <span className="text-xs font-semibold text-slate-gray uppercase">
                                    Durasi (mnt)
                                </span>
                                <input
                                    type="number"
                                    placeholder="45"
                                    value={
                                        addForm.data
                                            .estimated_duration_minutes
                                    }
                                    onChange={(e) =>
                                        addForm.setData(
                                            'estimated_duration_minutes',
                                            e.target.value,
                                        )
                                    }
                                    className={inputBase}
                                />
                            </label>
                        </div>
                        <label className="grid gap-1.5">
                            <span className="text-xs font-semibold text-slate-gray uppercase">
                                Tarif (Rp)
                            </span>
                            <input
                                type="number"
                                placeholder="150000"
                                value={addForm.data.tariff}
                                onChange={(e) =>
                                    addForm.setData('tariff', e.target.value)
                                }
                                className={inputBase}
                            />
                            {addForm.errors.tariff && (
                                <p className="text-xs text-red-600">
                                    {addForm.errors.tariff}
                                </p>
                            )}
                        </label>
                        <Button
                            type="submit"
                            variant="accent"
                            loading={addForm.processing}
                            leadingIcon={<Plus className="h-4 w-4" />}
                        >
                            Tambah Tarif
                        </Button>
                    </form>
                </div>

                {/* Table */}
                <div className="overflow-hidden rounded-3xl border border-slate-gray/15 bg-base-white shadow-rental lg:col-span-2">
                    <div className="flex items-center justify-between border-b border-slate-gray/10 px-6 py-4">
                        <div>
                            <h3 className="text-base font-bold text-navy-blue">
                                Daftar Tarif
                            </h3>
                            <p className="text-xs text-slate-gray">
                                {tariffs.total} rute terdaftar
                                {hasActiveFilter && ' · sedang difilter'}
                            </p>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-slate-gray/10 bg-surface-gray/40 text-left text-xs font-semibold tracking-wide text-slate-gray uppercase">
                                    <th className="px-6 py-3.5">Rute</th>
                                    <th className="px-6 py-3.5">Jarak</th>
                                    <th className="px-6 py-3.5">Durasi</th>
                                    <th className="px-6 py-3.5">Tarif</th>
                                    <th className="px-6 py-3.5 text-right">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {tariffs.data.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={5}
                                            className="px-6 py-12 text-center text-slate-gray"
                                        >
                                            {hasActiveFilter
                                                ? 'Tidak ada rute yang cocok dengan pencarian.'
                                                : 'Belum ada tarif antar-jemput.'}
                                        </td>
                                    </tr>
                                )}
                                {tariffs.data.map((t) => (
                                    <tr
                                        key={t.id}
                                        className="border-b border-slate-gray/10 transition-colors last:border-0 hover:bg-surface-gray/30"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 font-semibold text-navy-blue">
                                                <MapPin className="h-3.5 w-3.5 text-amber-gold" />
                                                <span>{t.area_from}</span>
                                                <ArrowRight className="h-3.5 w-3.5 text-slate-gray" />
                                                <span>{t.area_to}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center gap-1 text-slate-gray">
                                                <Route className="h-3.5 w-3.5" />
                                                {t.estimated_distance_km} km
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center gap-1 text-slate-gray">
                                                <Clock className="h-3.5 w-3.5" />
                                                {t.estimated_duration_minutes}{' '}
                                                mnt
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-bold text-navy-blue">
                                            {rupiah(t.tariff)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => openEdit(t)}
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
                                                        deleteTariff(t)
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
                    {tariffs.last_page > 1 && (
                        <div className="border-t border-slate-gray/10 px-6 py-4">
                            <Pagination
                                links={tariffs.links}
                                currentPage={tariffs.current_page}
                                lastPage={tariffs.last_page}
                                className="!mt-0"
                            />
                        </div>
                    )}
                </div>
            </div>

            <Modal
                isOpen={editing !== null}
                onClose={() => setEditing(null)}
                title="Edit Tarif Antar-Jemput"
                maxWidth="lg"
            >
                <form onSubmit={submitEdit} className="grid gap-4">
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        <label className="grid gap-1.5">
                            <span className="text-xs font-semibold text-slate-gray uppercase">
                                Area Asal
                            </span>
                            <input
                                type="text"
                                value={editForm.data.area_from}
                                onChange={(e) =>
                                    editForm.setData(
                                        'area_from',
                                        e.target.value,
                                    )
                                }
                                className={inputBase}
                            />
                        </label>
                        <label className="grid gap-1.5">
                            <span className="text-xs font-semibold text-slate-gray uppercase">
                                Area Tujuan
                            </span>
                            <input
                                type="text"
                                value={editForm.data.area_to}
                                onChange={(e) =>
                                    editForm.setData(
                                        'area_to',
                                        e.target.value,
                                    )
                                }
                                className={inputBase}
                            />
                        </label>
                    </div>
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        <label className="grid gap-1.5">
                            <span className="text-xs font-semibold text-slate-gray uppercase">
                                Jarak (km)
                            </span>
                            <input
                                type="number"
                                step="0.1"
                                value={editForm.data.estimated_distance_km}
                                onChange={(e) =>
                                    editForm.setData(
                                        'estimated_distance_km',
                                        e.target.value,
                                    )
                                }
                                className={inputBase}
                            />
                        </label>
                        <label className="grid gap-1.5">
                            <span className="text-xs font-semibold text-slate-gray uppercase">
                                Durasi (mnt)
                            </span>
                            <input
                                type="number"
                                value={
                                    editForm.data.estimated_duration_minutes
                                }
                                onChange={(e) =>
                                    editForm.setData(
                                        'estimated_duration_minutes',
                                        e.target.value,
                                    )
                                }
                                className={inputBase}
                            />
                        </label>
                    </div>
                    <label className="grid gap-1.5">
                        <span className="text-xs font-semibold text-slate-gray uppercase">
                            Tarif (Rp)
                        </span>
                        <input
                            type="number"
                            value={editForm.data.tariff}
                            onChange={(e) =>
                                editForm.setData('tariff', e.target.value)
                            }
                            className={inputBase}
                        />
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
        </AdminLayout>
    );
}
