import { Link, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { Button } from '@/components/ui/button';
import { useConfirm } from '@/components/ui/confirm-modal';
import { LoadingWrapper } from '@/components/ui/loading-wrapper';
import { SkeletonTable } from '@/components/ui/skeleton';
import { toast } from '@/components/ui/toast';
import AdminLayout from '@/layouts/admin-layout';
import { formatVehicleStatus } from '@/lib/labels';
import admin from '@/routes/admin';

type Vehicle = {
    id: number;
    plate_number: string;
    brand: string;
    model: string;
    year: number;
    status: string;
    images: string[] | null;
    category: { id: number; name: string };
    vehicle_category_id: number;
};

type Category = { id: number; name: string };

type Filters = {
    status?: string;
    category?: string;
    search?: string;
};

type Props = {
    vehicles: { data: Vehicle[]; links: { url: string | null; label: string; active: boolean }[] };
    categories: Category[];
    filters: Filters;
};

const statusColors: Record<string, string> = {
    available: 'bg-pale-green text-success-green',
    reserved: 'bg-yellow-100 text-yellow-700',
    in_use: 'bg-blue-100 text-blue-700',
    maintenance: 'bg-orange-100 text-orange-700',
    inactive: 'bg-red-100 text-red-600',
};

const MAX_IMAGES = 5;

export default function VehicleIndex({ vehicles, categories, filters }: Props) {
    const confirm = useConfirm();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
    const [existingImages, setExistingImages] = useState<string[]>([]);
    const [deletingIndex, setDeletingIndex] = useState<number | null>(null);
    const [isRouteLoading, setIsRouteLoading] = useState(false);
    const [searchInput, setSearchInput] = useState(filters.search ?? '');

    const { data, setData, post, processing, errors, reset, clearErrors, transform } = useForm({
        vehicle_category_id: categories.length > 0 ? categories[0].id : '',
        plate_number: '',
        brand: '',
        model: '',
        year: new Date().getFullYear(),
        status: 'available',
        images: [] as File[],
    });

    function applyFilter(patch: Partial<Filters>) {
        setIsRouteLoading(true);
        router.get(
            admin.vehicles.index.url(),
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
            admin.vehicles.index.url(),
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

    function openCreateModal() {
        setEditingVehicle(null);
        setExistingImages([]);
        reset();
        clearErrors();
        setIsModalOpen(true);
    }

    function openEditModal(vehicle: Vehicle) {
        setEditingVehicle(vehicle);
        setExistingImages(vehicle.images ?? []);
        setData({
            vehicle_category_id: vehicle.vehicle_category_id || vehicle.category.id,
            plate_number: vehicle.plate_number,
            brand: vehicle.brand,
            model: vehicle.model,
            year: vehicle.year,
            status: vehicle.status,
            images: [],
        });
        clearErrors();
        setIsModalOpen(true);
    }

    function closeModal() {
        setIsModalOpen(false);
        setTimeout(() => {
            reset();
            clearErrors();
            setEditingVehicle(null);
            setExistingImages([]);
        }, 300);
    }

    async function handleDeleteImage(index: number) {
        if (!editingVehicle) return;
        const ok = await confirm({
            title: 'Hapus gambar ini?',
            description: 'Gambar akan dihapus permanen dari penyimpanan.',
            confirmLabel: 'Hapus',
            variant: 'danger',
        });
        if (!ok) return;

        setDeletingIndex(index);
        router.delete(admin.vehicles.images.destroy.url({ vehicle: editingVehicle.id, index }), {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                setExistingImages((prev) => prev.filter((_, i) => i !== index));
            },
            onFinish: () => setDeletingIndex(null),
        });
    }

    async function handleDeactivate(vehicle: Vehicle) {
        const ok = await confirm({
            title: `Nonaktifkan ${vehicle.brand} ${vehicle.model}?`,
            description: (
                <span>
                    Kendaraan dengan pelat{' '}
                    <span className="font-mono font-semibold text-navy-blue">
                        {vehicle.plate_number}
                    </span>{' '}
                    akan berstatus nonaktif dan tidak muncul di katalog.
                </span>
            ),
            confirmLabel: 'Nonaktifkan',
            variant: 'danger',
        });
        if (!ok) return;

        router.delete(admin.vehicles.destroy.url(vehicle.id), {
            preserveScroll: true,
        });
    }

    function submit(e: React.FormEvent) {
        e.preventDefault();

        if (editingVehicle) {
            transform((d) => ({ ...d, _method: 'put' }));
            post(admin.vehicles.update.url(editingVehicle.id), {
                preserveScroll: true,
                forceFormData: true,
                onSuccess: () => closeModal(),
                onError: () => toast.error('Periksa isian formulir.'),
                onFinish: () => transform((d) => d),
            });
        } else {
            post(admin.vehicles.store.url(), {
                preserveScroll: true,
                forceFormData: true,
                onSuccess: () => closeModal(),
                onError: () => toast.error('Periksa isian formulir.'),
            });
        }
    }

    const pickedCount = data.images.length;
    const totalImages = existingImages.length + pickedCount;
    const remainingSlots = Math.max(0, MAX_IMAGES - existingImages.length);

    const headerActions = (
        <Button variant="accent" onClick={openCreateModal}>
            + Tambah Kendaraan
        </Button>
    );

    const hasFilters = Boolean(
        filters.status || filters.category || filters.search,
    );

    return (
        <AdminLayout
            title="Kendaraan"
            breadcrumbs={[
                { label: 'Dasbor', href: admin.dashboard.url() },
                { label: 'Kendaraan' },
            ]}
            headerActions={headerActions}
        >
            <div className="mb-4 flex flex-wrap items-center gap-2">
                <form onSubmit={submitSearch} className="flex-1 min-w-[220px]">
                    <input
                        type="search"
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        placeholder="Cari merek, model, atau pelat..."
                        className="w-full rounded-full border border-slate-gray/20 bg-base-white px-4 py-2 text-sm outline-none focus:border-amber-gold"
                    />
                </form>
                <select
                    value={filters.status ?? ''}
                    onChange={(e) =>
                        applyFilter({ status: e.target.value || undefined })
                    }
                    className="rounded-full border border-slate-gray/20 bg-base-white px-4 py-2 text-sm outline-none focus:border-amber-gold"
                >
                    <option value="">Semua Status</option>
                    <option value="available">Tersedia</option>
                    <option value="reserved">Dipesan</option>
                    <option value="in_use">Sedang Digunakan</option>
                    <option value="maintenance">Dalam Perawatan</option>
                    <option value="inactive">Nonaktif</option>
                </select>
                <select
                    value={filters.category ?? ''}
                    onChange={(e) =>
                        applyFilter({ category: e.target.value || undefined })
                    }
                    className="rounded-full border border-slate-gray/20 bg-base-white px-4 py-2 text-sm outline-none focus:border-amber-gold"
                >
                    <option value="">Semua Kategori</option>
                    {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                </select>
                {hasFilters && (
                    <Button variant="ghost" size="sm" onClick={resetFilters}>
                        Reset
                    </Button>
                )}
            </div>

            <LoadingWrapper
                loading={isRouteLoading}
                skeleton={<SkeletonTable rows={6} columns={6} />}
            >
                <div className="overflow-hidden rounded-2xl border border-slate-gray/15 bg-base-white shadow-rental">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-slate-gray/15 bg-surface-gray/60 text-left text-xs font-semibold tracking-wide text-slate-gray uppercase">
                                <th className="px-6 py-4">Nomor Pelat</th>
                                <th className="px-6 py-4">Kendaraan</th>
                                <th className="px-6 py-4">Kategori</th>
                                <th className="px-6 py-4">Tahun</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {vehicles.data.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-slate-gray">
                                        Belum ada kendaraan yang cocok.
                                    </td>
                                </tr>
                            )}
                            {vehicles.data.map((v) => (
                                <tr key={v.id} className="border-b border-slate-gray/10 transition-colors hover:bg-surface-gray/40">
                                    <td className="px-6 py-4 font-mono font-semibold">{v.plate_number}</td>
                                    <td className="px-6 py-4">{v.brand} {v.model}</td>
                                    <td className="px-6 py-4">{v.category.name}</td>
                                    <td className="px-6 py-4">{v.year}</td>
                                    <td className="px-6 py-4">
                                        <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${statusColors[v.status] ?? 'bg-slate-gray/20'}`}>
                                            {formatVehicleStatus(v.status)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <Button variant="outline" size="sm" onClick={() => openEditModal(v)}>
                                                Edit
                                            </Button>
                                            {v.status !== 'inactive' && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-red-600 hover:bg-red-50 hover:text-red-700"
                                                    onClick={() => handleDeactivate(v)}
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
                {vehicles.links.map((link) => (
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
                title={editingVehicle ? 'Edit Kendaraan' : 'Tambah Kendaraan Baru'}
                maxWidth="lg"
            >
                <form onSubmit={submit} className="flex flex-col gap-4">
                    <div>
                        <label className="mb-1 block text-sm font-semibold">Kategori <span className="text-red-500">*</span></label>
                        <select
                            value={data.vehicle_category_id}
                            onChange={e => setData('vehicle_category_id', e.target.value)}
                            className="w-full rounded-lg border border-slate-gray/20 px-4 py-2 outline-none focus:border-amber-gold"
                            required
                        >
                            <option value="" disabled>Pilih Kategori</option>
                            {categories.map((c) => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                        {errors.vehicle_category_id && <p className="mt-1 text-xs text-red-500">{errors.vehicle_category_id}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="mb-1 block text-sm font-semibold">Merek <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                value={data.brand}
                                onChange={e => setData('brand', e.target.value)}
                                className="w-full rounded-lg border border-slate-gray/20 px-4 py-2 outline-none focus:border-amber-gold"
                                placeholder="Contoh: Toyota"
                                required
                            />
                            {errors.brand && <p className="mt-1 text-xs text-red-500">{errors.brand}</p>}
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-semibold">Model <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                value={data.model}
                                onChange={e => setData('model', e.target.value)}
                                className="w-full rounded-lg border border-slate-gray/20 px-4 py-2 outline-none focus:border-amber-gold"
                                placeholder="Contoh: Avanza"
                                required
                            />
                            {errors.model && <p className="mt-1 text-xs text-red-500">{errors.model}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="mb-1 block text-sm font-semibold">Nomor Pelat <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                value={data.plate_number}
                                onChange={e => setData('plate_number', e.target.value.toUpperCase())}
                                className="w-full rounded-lg border border-slate-gray/20 px-4 py-2 font-mono uppercase outline-none focus:border-amber-gold"
                                placeholder="B 1234 ABC"
                                required
                            />
                            {errors.plate_number && <p className="mt-1 text-xs text-red-500">{errors.plate_number}</p>}
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-semibold">Tahun <span className="text-red-500">*</span></label>
                            <input
                                type="number"
                                value={data.year}
                                onChange={e => setData('year', parseInt(e.target.value))}
                                className="w-full rounded-lg border border-slate-gray/20 px-4 py-2 outline-none focus:border-amber-gold"
                                placeholder="Contoh: 2022"
                                min={2000}
                                max={new Date().getFullYear() + 1}
                                required
                            />
                            {errors.year && <p className="mt-1 text-xs text-red-500">{errors.year}</p>}
                        </div>
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-semibold">Status <span className="text-red-500">*</span></label>
                        <select
                            value={data.status}
                            onChange={e => setData('status', e.target.value)}
                            className="w-full rounded-lg border border-slate-gray/20 px-4 py-2 outline-none focus:border-amber-gold"
                            required
                        >
                            <option value="available">Tersedia</option>
                            <option value="maintenance">Dalam Perawatan</option>
                            <option value="inactive">Nonaktif</option>
                        </select>
                        {errors.status && <p className="mt-1 text-xs text-red-500">{errors.status}</p>}
                    </div>

                    {editingVehicle && (
                        <div>
                            <label className="mb-2 block text-sm font-semibold">
                                Gambar Tersimpan
                                <span className="ml-2 text-xs font-normal text-slate-gray">
                                    ({existingImages.length}/{MAX_IMAGES})
                                </span>
                            </label>
                            {existingImages.length === 0 ? (
                                <p className="rounded-lg border border-dashed border-slate-gray/30 px-4 py-6 text-center text-xs text-slate-gray">
                                    Belum ada gambar tersimpan.
                                </p>
                            ) : (
                                <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
                                    {existingImages.map((path, index) => (
                                        <div
                                            key={path}
                                            className="group relative aspect-square overflow-hidden rounded-lg border border-slate-gray/20 bg-surface-gray"
                                        >
                                            <img
                                                src={`/storage/${path}`}
                                                alt={`Gambar kendaraan ${index + 1}`}
                                                className="h-full w-full object-cover"
                                            />
                                            <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-navy-blue/60 opacity-0 transition-opacity group-hover:pointer-events-auto group-hover:opacity-100">
                                                <button
                                                    type="button"
                                                    onClick={() => handleDeleteImage(index)}
                                                    disabled={deletingIndex === index}
                                                    title="Hapus gambar"
                                                    className="inline-flex items-center gap-1 rounded-full bg-red-500 px-3 py-1.5 text-xs font-bold text-base-white shadow hover:bg-red-600 disabled:opacity-50"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                                                    {deletingIndex === index ? 'Menghapus...' : 'Hapus'}
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    <div>
                        <label className="mb-1 block text-sm font-semibold">
                            {editingVehicle ? 'Tambah Gambar Baru' : 'Foto Kendaraan'}
                            <span className="ml-2 text-xs font-normal text-slate-gray">
                                (Total maks. {MAX_IMAGES} gambar, 5MB per file)
                            </span>
                        </label>
                        <input
                            type="file"
                            multiple
                            accept="image/*"
                            disabled={remainingSlots === 0}
                            onChange={e => {
                                if (e.target.files) {
                                    const files = Array.from(e.target.files).slice(0, remainingSlots);
                                    setData('images', files);
                                }
                            }}
                            className="w-full rounded-lg border border-slate-gray/20 px-4 py-2 text-sm outline-none focus:border-amber-gold disabled:cursor-not-allowed disabled:bg-slate-gray/10"
                        />
                        {pickedCount > 0 && (
                            <p className="mt-1 text-xs text-slate-gray">
                                {pickedCount} file dipilih. Total setelah simpan: {totalImages}/{MAX_IMAGES}.
                            </p>
                        )}
                        {remainingSlots === 0 && (
                            <p className="mt-1 text-xs text-orange-600">
                                Hapus salah satu gambar tersimpan dulu untuk menambah yang baru.
                            </p>
                        )}
                        {errors.images && <p className="mt-1 text-xs text-red-500">{errors.images}</p>}
                        {Object.keys(errors)
                            .filter((k) => k.startsWith('images.'))
                            .map((k) => (
                                <p key={k} className="mt-1 text-xs text-red-500">
                                    {(errors as Record<string, string>)[k]}
                                </p>
                            ))}
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
