import { Link, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import Modal from '@/components/ui/Modal';
import AdminLayout from '@/layouts/admin-layout';
import admin from '@/routes/admin';

type Vehicle = {
    id: number;
    plate_number: string;
    brand: string;
    model: string;
    year: number;
    status: string;
    category: { id: number; name: string };
    vehicle_category_id: number; // usually needed for edit
};

type Category = { id: number; name: string };

type Props = {
    vehicles: { data: Vehicle[]; links: { url: string | null; label: string; active: boolean }[] };
    categories: Category[];
    filters: { status?: string; category?: string };
};

const statusColors: Record<string, string> = {
    available: 'bg-pale-green text-success-green',
    reserved: 'bg-yellow-100 text-yellow-700',
    in_use: 'bg-blue-100 text-blue-700',
    maintenance: 'bg-orange-100 text-orange-700',
    inactive: 'bg-red-100 text-red-600',
};

export default function VehicleIndex({ vehicles, categories, filters }: Props) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        vehicle_category_id: categories.length > 0 ? categories[0].id : '',
        plate_number: '',
        brand: '',
        model: '',
        year: new Date().getFullYear(),
        status: 'available',
        images: [] as File[],
    });

    function applyFilter(key: string, value: string) {
        router.get(admin.vehicles.index.url(), { ...filters, [key]: value }, { preserveState: true });
    }

    function openCreateModal() {
        setEditingVehicle(null);
        reset();
        clearErrors();
        setIsModalOpen(true);
    }

    function openEditModal(vehicle: Vehicle) {
        setEditingVehicle(vehicle);
        setData({
            vehicle_category_id: vehicle.vehicle_category_id || vehicle.category.id,
            plate_number: vehicle.plate_number,
            brand: vehicle.brand,
            model: vehicle.model,
            year: vehicle.year,
            status: vehicle.status,
            images: [], // reset images on edit
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
        }, 300);
    }

    function submit(e: React.FormEvent) {
        e.preventDefault();
        
        if (editingVehicle) {
            put(admin.vehicles.update.url(editingVehicle.id), {
                preserveScroll: true,
                onSuccess: () => closeModal(),
            });
        } else {
            post(admin.vehicles.store.url(), {
                preserveScroll: true,
                onSuccess: () => closeModal(),
            });
        }
    }

    return (
        <AdminLayout title="Kendaraan">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <div className="flex gap-2">
                    <select
                        value={filters.status ?? ''}
                        onChange={(e) => applyFilter('status', e.target.value)}
                        className="rounded-full border border-slate-gray/20 bg-surface-gray px-4 py-2 text-sm outline-none"
                    >
                        <option value="">Semua Status</option>
                        <option value="available">Tersedia</option>
                        <option value="reserved">Reserved</option>
                        <option value="in_use">Dalam Perjalanan</option>
                        <option value="maintenance">Perawatan</option>
                        <option value="inactive">Nonaktif</option>
                    </select>
                    <select
                        value={filters.category ?? ''}
                        onChange={(e) => applyFilter('category', e.target.value)}
                        className="rounded-full border border-slate-gray/20 bg-surface-gray px-4 py-2 text-sm outline-none"
                    >
                        <option value="">Semua Kategori</option>
                        {categories.map((c) => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                </div>
                <button
                    onClick={openCreateModal}
                    className="rounded-full bg-amber-gold px-5 py-2 text-sm font-semibold text-navy-blue hover:bg-yellow-300 transition-colors"
                >
                    + Tambah Kendaraan
                </button>
            </div>

            <div className="rounded-[20px] bg-surface-gray shadow-rental overflow-hidden">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-slate-gray/20 text-left text-xs font-semibold uppercase tracking-wide text-slate-gray">
                            <th className="px-6 py-4">Plat Nomor</th>
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
                                <td colSpan={6} className="px-6 py-12 text-center text-slate-gray">Belum ada kendaraan.</td>
                            </tr>
                        )}
                        {vehicles.data.map((v) => (
                            <tr key={v.id} className="border-b border-slate-gray/20/50 hover:bg-base-white/40 transition-colors">
                                <td className="px-6 py-4 font-mono font-semibold">{v.plate_number}</td>
                                <td className="px-6 py-4">{v.brand} {v.model}</td>
                                <td className="px-6 py-4">{v.category.name}</td>
                                <td className="px-6 py-4">{v.year}</td>
                                <td className="px-6 py-4">
                                    <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${statusColors[v.status] ?? 'bg-slate-gray/20'}`}>
                                        {v.status.replace('_', ' ')}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <button
                                        onClick={() => openEditModal(v)}
                                        className="rounded-full border border-slate-gray/20 px-3 py-1 text-xs hover:bg-base-white transition-colors"
                                    >
                                        Edit
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="mt-4 flex justify-center gap-1">
                {vehicles.links.map((link) => (
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
                title={editingVehicle ? 'Edit Kendaraan' : 'Tambah Kendaraan Baru'}
                maxWidth="md"
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
                            <label className="mb-1 block text-sm font-semibold">Brand/Merk <span className="text-red-500">*</span></label>
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
                            <label className="mb-1 block text-sm font-semibold">Plat Nomor <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                value={data.plate_number}
                                onChange={e => setData('plate_number', e.target.value.toUpperCase())}
                                className="w-full rounded-lg border border-slate-gray/20 px-4 py-2 outline-none focus:border-amber-gold font-mono uppercase"
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
                            <option value="maintenance">Perawatan</option>
                            <option value="inactive">Nonaktif</option>
                        </select>
                        {errors.status && <p className="mt-1 text-xs text-red-500">{errors.status}</p>}
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-semibold">Foto Kendaraan <span className="text-slate-gray font-normal text-xs">(Max 5 gambar)</span></label>
                        <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={e => {
                                if (e.target.files) {
                                    setData('images', Array.from(e.target.files));
                                }
                            }}
                            className="w-full rounded-lg border border-slate-gray/20 px-4 py-2 outline-none focus:border-amber-gold text-sm"
                        />
                        {/* If using errors for specific array elements, typically it's errors['images.0'] etc., but we'll show generic images error if any */}
                        {errors.images && <p className="mt-1 text-xs text-red-500">{errors.images}</p>}
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
