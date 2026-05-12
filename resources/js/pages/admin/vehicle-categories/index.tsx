import { Link, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import Modal from '@/components/ui/Modal';
import { Button } from '@/components/ui/button';
import { useConfirm } from '@/components/ui/confirm-modal';
import { LoadingWrapper } from '@/components/ui/loading-wrapper';
import { SkeletonTable } from '@/components/ui/skeleton';
import { toast } from '@/components/ui/toast';
import AdminLayout from '@/layouts/admin-layout';
import admin from '@/routes/admin';

type Category = {
    id: number;
    name: string;
    class_level: number;
    description: string | null;
    is_active: boolean;
    vehicles_count: number;
};

type Filters = { search?: string; active?: string };

type Props = {
    categories: {
        data: Category[];
        links: { url: string | null; label: string; active: boolean }[];
    };
    filters: Filters;
};

export default function VehicleCategoryIndex({ categories, filters }: Props) {
    const confirm = useConfirm();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [isRouteLoading, setIsRouteLoading] = useState(false);
    const [searchInput, setSearchInput] = useState(filters.search ?? '');

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        name: '',
        class_level: 1,
        description: '',
    });

    function applyFilter(patch: Partial<Filters>) {
        setIsRouteLoading(true);
        router.get(
            admin.vehicleCategories.index.url(),
            { ...filters, ...patch },
            {
                preserveState: true,
                preserveScroll: true,
                onFinish: () => setIsRouteLoading(false),
            },
        );
    }

    function resetFilters() {
        setSearchInput('');
        setIsRouteLoading(true);
        router.get(
            admin.vehicleCategories.index.url(),
            {},
            {
                preserveState: true,
                preserveScroll: true,
                onFinish: () => setIsRouteLoading(false),
            },
        );
    }

    function submitSearch(e: React.FormEvent) {
        e.preventDefault();
        applyFilter({ search: searchInput || undefined });
    }

    async function toggleActive(category: Category) {
        const ok = await confirm({
            title: `Nonaktifkan kategori ${category.name}?`,
            description:
                'Kategori yang nonaktif tidak akan tampil di katalog untuk pesanan baru.',
            confirmLabel: 'Nonaktifkan',
            variant: 'danger',
        });
        if (!ok) return;
        router.delete(admin.vehicleCategories.destroy.url(category.id));
    }

    function openCreateModal() {
        setEditingCategory(null);
        reset();
        clearErrors();
        setIsModalOpen(true);
    }

    function openEditModal(category: Category) {
        setEditingCategory(category);
        setData({
            name: category.name,
            class_level: category.class_level,
            description: category.description || '',
        });
        clearErrors();
        setIsModalOpen(true);
    }

    function closeModal() {
        setIsModalOpen(false);
        setTimeout(() => {
            reset();
            clearErrors();
            setEditingCategory(null);
        }, 300);
    }

    function submit(e: React.FormEvent) {
        e.preventDefault();

        if (editingCategory) {
            put(admin.vehicleCategories.update.url(editingCategory.id), {
                preserveScroll: true,
                onSuccess: () => closeModal(),
                onError: () => toast.error('Periksa isian formulir.'),
            });
        } else {
            post(admin.vehicleCategories.store.url(), {
                preserveScroll: true,
                onSuccess: () => closeModal(),
                onError: () => toast.error('Periksa isian formulir.'),
            });
        }
    }

    const hasFilters = Boolean(filters.search || filters.active);

    return (
        <AdminLayout
            title="Kategori Kendaraan"
            breadcrumbs={[
                { label: 'Dasbor', href: admin.dashboard.url() },
                { label: 'Kategori' },
            ]}
            headerActions={
                <Button variant="accent" onClick={openCreateModal}>
                    + Tambah Kategori
                </Button>
            }
        >
            <div className="mb-4 flex flex-wrap items-center gap-2">
                <form onSubmit={submitSearch} className="flex-1 min-w-[220px]">
                    <input
                        type="search"
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        placeholder="Cari nama kategori..."
                        className="w-full rounded-full border border-slate-gray/20 bg-base-white px-4 py-2 text-sm outline-none focus:border-amber-gold"
                    />
                </form>
                <select
                    value={filters.active ?? ''}
                    onChange={(e) => applyFilter({ active: e.target.value || undefined })}
                    className="rounded-full border border-slate-gray/20 bg-base-white px-4 py-2 text-sm outline-none focus:border-amber-gold"
                >
                    <option value="">Semua Status</option>
                    <option value="1">Aktif</option>
                    <option value="0">Nonaktif</option>
                </select>
                {hasFilters && (
                    <Button variant="ghost" size="sm" onClick={resetFilters}>
                        Reset
                    </Button>
                )}
            </div>

            <LoadingWrapper
                loading={isRouteLoading}
                skeleton={<SkeletonTable rows={5} columns={6} />}
            >
                <div className="overflow-hidden rounded-2xl border border-slate-gray/15 bg-base-white shadow-rental">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-slate-gray/15 bg-surface-gray/60 text-left text-xs font-semibold tracking-wide text-slate-gray uppercase">
                                <th className="px-6 py-4">Nama</th>
                                <th className="px-6 py-4">Tingkat Kelas</th>
                                <th className="px-6 py-4">Kendaraan</th>
                                <th className="px-6 py-4">Deskripsi</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {categories.data.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-slate-gray">
                                        Belum ada kategori kendaraan.
                                    </td>
                                </tr>
                            )}
                            {categories.data.map((cat) => (
                                <tr key={cat.id} className="border-b border-slate-gray/10 transition-colors hover:bg-surface-gray/40">
                                    <td className="px-6 py-4 font-semibold">{cat.name}</td>
                                    <td className="px-6 py-4">
                                        <span className="rounded-full bg-amber-gold/20 px-3 py-1 text-xs font-bold">
                                            Level {cat.class_level}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">{cat.vehicles_count}</td>
                                    <td className="max-w-xs truncate px-6 py-4 text-slate-gray">
                                        {cat.description ?? '-'}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${cat.is_active ? 'bg-pale-green text-success-green' : 'bg-red-100 text-red-600'}`}>
                                            {cat.is_active ? 'Aktif' : 'Nonaktif'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <Button variant="outline" size="sm" onClick={() => openEditModal(cat)}>
                                                Edit
                                            </Button>
                                            {cat.is_active && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-red-600 hover:bg-red-50 hover:text-red-700"
                                                    onClick={() => toggleActive(cat)}
                                                >
                                                    Nonaktifkan
                                                </Button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </LoadingWrapper>

            <div className="mt-4 flex justify-center gap-1">
                {categories.links.map((link) => (
                    <Link
                        key={link.label}
                        href={link.url ?? '#'}
                        className={`rounded-full px-4 py-2 text-sm ${link.active ? 'bg-amber-gold font-bold' : 'bg-base-white hover:bg-surface-gray'}`}
                        dangerouslySetInnerHTML={{ __html: link.label }}
                    />
                ))}
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={closeModal}
                title={editingCategory ? 'Edit Kategori' : 'Tambah Kategori Baru'}
                maxWidth="lg"
            >
                <form onSubmit={submit} className="flex flex-col gap-4">
                    <div>
                        <label className="mb-1 block text-sm font-semibold">
                            Nama Kategori <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={data.name}
                            onChange={e => setData('name', e.target.value)}
                            className="w-full rounded-lg border border-slate-gray/20 px-4 py-2 outline-none focus:border-amber-gold"
                            placeholder="Contoh: MPV Premium"
                            required
                        />
                        {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-semibold">
                            Tingkat Kelas <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={data.class_level}
                            onChange={e => setData('class_level', parseInt(e.target.value))}
                            className="w-full rounded-lg border border-slate-gray/20 px-4 py-2 outline-none focus:border-amber-gold"
                            required
                        >
                            <option value={1}>Level 1 (Entry / LCGC)</option>
                            <option value={2}>Level 2 (Standard)</option>
                            <option value={3}>Level 3 (Premium)</option>
                            <option value={4}>Level 4 (Luxury)</option>
                        </select>
                        <p className="mt-1 text-xs text-slate-gray">
                            Semakin tinggi tingkat kelas, semakin eksklusif kendaraannya.
                        </p>
                        {errors.class_level && <p className="mt-1 text-xs text-red-500">{errors.class_level}</p>}
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-semibold">Deskripsi Singkat</label>
                        <textarea
                            value={data.description}
                            onChange={e => setData('description', e.target.value)}
                            rows={3}
                            className="w-full rounded-lg border border-slate-gray/20 px-4 py-2 outline-none focus:border-amber-gold"
                            placeholder="Deskripsikan kategori ini..."
                        />
                        {errors.description && <p className="mt-1 text-xs text-red-500">{errors.description}</p>}
                    </div>

                    <div className="mt-4 flex justify-end gap-2">
                        <Button variant="ghost" onClick={closeModal}>Batal</Button>
                        <Button type="submit" variant="primary" loading={processing}>Simpan</Button>
                    </div>
                </form>
            </Modal>
        </AdminLayout>
    );
}
