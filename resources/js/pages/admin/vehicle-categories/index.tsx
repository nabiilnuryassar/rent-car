import { Link, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import Modal from '@/components/ui/Modal';
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

type Props = {
    categories: {
        data: Category[];
        links: { url: string | null; label: string; active: boolean }[];
    };
};

export default function VehicleCategoryIndex({ categories }: Props) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        name: '',
        class_level: 1,
        description: '',
    });

    function toggleActive(category: Category) {
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
            });
        } else {
            post(admin.vehicleCategories.store.url(), {
                preserveScroll: true,
                onSuccess: () => closeModal(),
            });
        }
    }

    return (
        <AdminLayout title="Kategori Kendaraan">
            <div className="mb-6 flex items-center justify-between">
                <p className="text-sm text-slate-gray">{categories.data.length} kategori ditemukan</p>
                <button
                    onClick={openCreateModal}
                    className="rounded-full bg-amber-gold px-5 py-2 text-sm font-semibold text-navy-blue hover:bg-yellow-300 transition-colors"
                >
                    + Tambah Kategori
                </button>
            </div>

            <div className="rounded-[20px] bg-surface-gray shadow-rental overflow-hidden">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-slate-gray/20 text-left text-xs font-semibold uppercase tracking-wide text-slate-gray">
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
                            <tr key={cat.id} className="border-b border-slate-gray/20/50 hover:bg-base-white/40 transition-colors">
                                <td className="px-6 py-4 font-semibold">{cat.name}</td>
                                <td className="px-6 py-4">
                                    <span className="rounded-full bg-amber-gold/20 px-3 py-1 text-xs font-bold">
                                        Level {cat.class_level}
                                    </span>
                                </td>
                                <td className="px-6 py-4">{cat.vehicles_count}</td>
                                <td className="px-6 py-4 text-slate-gray max-w-xs truncate">{cat.description ?? '-'}</td>
                                <td className="px-6 py-4">
                                    <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${cat.is_active ? 'bg-pale-green text-success-green' : 'bg-red-100 text-red-600'}`}>
                                        {cat.is_active ? 'Aktif' : 'Nonaktif'}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => openEditModal(cat)}
                                            className="rounded-full border border-slate-gray/20 px-3 py-1 text-xs hover:bg-base-white transition-colors"
                                        >
                                            Edit
                                        </button>
                                        {cat.is_active && (
                                            <button
                                                onClick={() => toggleActive(cat)}
                                                className="rounded-full border border-red-200 px-3 py-1 text-xs text-red-600 hover:bg-red-50 transition-colors"
                                            >
                                                Nonaktifkan
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="mt-4 flex justify-center gap-1">
                {categories.links.map((link) => (
                    <Link
                        key={link.label}
                        href={link.url ?? '#'}
                        className={`rounded-full px-4 py-2 text-sm ${link.active ? 'bg-amber-gold font-bold' : 'bg-surface-gray hover:bg-base-white'}`}
                        dangerouslySetInnerHTML={{ __html: link.label }}
                    />
                ))}
            </div>

            {/* Create/Edit Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={closeModal}
                title={editingCategory ? 'Edit Kategori' : 'Tambah Kategori Baru'}
                maxWidth="lg"
            >
                <form onSubmit={submit} className="flex flex-col gap-4">
                    <div>
                        <label className="mb-1 block text-sm font-semibold">Nama Kategori <span className="text-red-500">*</span></label>
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
                        <label className="mb-1 block text-sm font-semibold">Tingkat Kelas <span className="text-red-500">*</span></label>
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
                        <p className="mt-1 text-xs text-slate-gray">Semakin tinggi tingkat kelas, semakin eksklusif kendaraannya.</p>
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
                        <button
                            type="button"
                            onClick={closeModal}
                            className="rounded-full px-5 py-2 text-sm font-bold text-slate-gray hover:bg-slate-gray/10"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="rounded-full bg-navy-blue px-6 py-2 text-sm font-bold text-base-white disabled:opacity-50 hover:bg-navy-blue/90"
                        >
                            {processing ? 'Menyimpan...' : 'Simpan'}
                        </button>
                    </div>
                </form>
            </Modal>
        </AdminLayout>
    );
}
