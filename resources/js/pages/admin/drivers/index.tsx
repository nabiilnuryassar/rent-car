import { Link, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import Modal from '@/components/ui/Modal';
import AdminLayout from '@/layouts/admin-layout';
import admin from '@/routes/admin';

type Driver = {
    id: number;
    license_number: string;
    phone: string;
    status: string;
    professional_title?: string;
    experience_years?: number;
    user: { id: number; name: string; email: string };
};

type Props = {
    drivers: { data: Driver[]; links: { url: string | null; label: string; active: boolean }[] };
    filters: { status?: string };
};

const statusColors: Record<string, string> = {
    available: 'bg-pale-green text-success-green',
    reserved: 'bg-yellow-100 text-yellow-700',
    on_duty: 'bg-blue-100 text-blue-700',
    off_duty: 'bg-orange-100 text-orange-700',
    inactive: 'bg-red-100 text-red-600',
};

export default function DriverIndex({ drivers, filters }: Props) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingDriver, setEditingDriver] = useState<Driver | null>(null);

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        license_number: '',
        phone: '',
        status: 'available',
        professional_title: '',
        experience_years: 0,
    });

    function openCreateModal() {
        setEditingDriver(null);
        reset();
        clearErrors();
        setIsModalOpen(true);
    }

    function openEditModal(driver: Driver) {
        setEditingDriver(driver);
        setData({
            name: driver.user.name,
            email: driver.user.email,
            password: '',
            password_confirmation: '',
            license_number: driver.license_number,
            phone: driver.phone,
            status: driver.status,
            professional_title: driver.professional_title || '',
            experience_years: driver.experience_years || 0,
        });
        clearErrors();
        setIsModalOpen(true);
    }

    function closeModal() {
        setIsModalOpen(false);
        setTimeout(() => {
            reset();
            clearErrors();
            setEditingDriver(null);
        }, 300);
    }

    function submit(e: React.FormEvent) {
        e.preventDefault();
        
        if (editingDriver) {
            put(admin.drivers.update.url(editingDriver.id), {
                preserveScroll: true,
                onSuccess: () => closeModal(),
            });
        } else {
            post(admin.drivers.store.url(), {
                preserveScroll: true,
                onSuccess: () => closeModal(),
            });
        }
    }

    return (
        <AdminLayout title="Pengemudi">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <select
                    value={filters.status ?? ''}
                    onChange={(e) => router.get(admin.drivers.index.url(), { status: e.target.value }, { preserveState: true })}
                    className="rounded-full border border-slate-gray/20 bg-surface-gray px-4 py-2 text-sm outline-none"
                >
                    <option value="">Semua Status</option>
                    <option value="available">Tersedia</option>
                    <option value="reserved">Reserved</option>
                    <option value="on_duty">Bertugas</option>
                    <option value="off_duty">Off Duty</option>
                    <option value="inactive">Nonaktif</option>
                </select>
                <button
                    onClick={openCreateModal}
                    className="rounded-full bg-amber-gold px-5 py-2 text-sm font-semibold text-navy-blue hover:bg-yellow-300 transition-colors"
                >
                    + Tambah Pengemudi
                </button>
            </div>

            <div className="rounded-[20px] bg-surface-gray shadow-rental overflow-hidden">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-slate-gray/20 text-left text-xs font-semibold uppercase tracking-wide text-slate-gray">
                            <th className="px-6 py-4">Nama</th>
                            <th className="px-6 py-4">SIM</th>
                            <th className="px-6 py-4">Telepon</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {drivers.data.length === 0 && (
                            <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-gray">Belum ada pengemudi.</td></tr>
                        )}
                        {drivers.data.map((d) => (
                            <tr key={d.id} className="border-b border-slate-gray/20/50 hover:bg-base-white/40 transition-colors">
                                <td className="px-6 py-4 font-semibold">{d.user.name}</td>
                                <td className="px-6 py-4 font-mono">{d.license_number}</td>
                                <td className="px-6 py-4">{d.phone}</td>
                                <td className="px-6 py-4">
                                    <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${statusColors[d.status] ?? 'bg-slate-gray/20'}`}>
                                        {d.status.replace('_', ' ')}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <button onClick={() => openEditModal(d)} className="rounded-full border border-slate-gray/20 px-3 py-1 text-xs hover:bg-base-white transition-colors">
                                        Edit
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="mt-4 flex justify-center gap-1">
                {drivers.links.map((link) => (
                    <Link key={link.label} href={link.url ?? '#'} className={`rounded-full px-4 py-2 text-sm ${link.active ? 'bg-amber-gold font-bold' : 'bg-surface-gray hover:bg-base-white'}`} dangerouslySetInnerHTML={{ __html: link.label }} />
                ))}
            </div>

            {/* Create/Edit Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={closeModal}
                title={editingDriver ? 'Edit Pengemudi' : 'Tambah Pengemudi Baru'}
                maxWidth="md"
            >
                <form onSubmit={submit} className="flex flex-col gap-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="mb-1 block text-sm font-semibold">Nama <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                value={data.name}
                                onChange={e => setData('name', e.target.value)}
                                className="w-full rounded-lg border border-slate-gray/20 px-4 py-2 outline-none focus:border-amber-gold"
                                placeholder="John Doe"
                                required
                            />
                            {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-semibold">Email <span className="text-red-500">*</span></label>
                            <input
                                type="email"
                                value={data.email}
                                onChange={e => setData('email', e.target.value)}
                                className="w-full rounded-lg border border-slate-gray/20 px-4 py-2 outline-none focus:border-amber-gold"
                                placeholder="john@example.com"
                                required
                            />
                            {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
                        </div>
                    </div>

                    {!editingDriver && (
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="mb-1 block text-sm font-semibold">Password <span className="text-red-500">*</span></label>
                                <input
                                    type="password"
                                    value={data.password}
                                    onChange={e => setData('password', e.target.value)}
                                    className="w-full rounded-lg border border-slate-gray/20 px-4 py-2 outline-none focus:border-amber-gold"
                                    required={!editingDriver}
                                />
                                {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-semibold">Konfirmasi Password <span className="text-red-500">*</span></label>
                                <input
                                    type="password"
                                    value={data.password_confirmation}
                                    onChange={e => setData('password_confirmation', e.target.value)}
                                    className="w-full rounded-lg border border-slate-gray/20 px-4 py-2 outline-none focus:border-amber-gold"
                                    required={!editingDriver}
                                />
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="mb-1 block text-sm font-semibold">Nomor SIM <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                value={data.license_number}
                                onChange={e => setData('license_number', e.target.value)}
                                className="w-full rounded-lg border border-slate-gray/20 px-4 py-2 outline-none focus:border-amber-gold"
                                placeholder="1234-5678-9012"
                                required
                            />
                            {errors.license_number && <p className="mt-1 text-xs text-red-500">{errors.license_number}</p>}
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-semibold">Telepon <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                value={data.phone}
                                onChange={e => setData('phone', e.target.value)}
                                className="w-full rounded-lg border border-slate-gray/20 px-4 py-2 outline-none focus:border-amber-gold"
                                placeholder="081234567890"
                                required
                            />
                            {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="mb-1 block text-sm font-semibold">Gelar/Titel</label>
                            <input
                                type="text"
                                value={data.professional_title}
                                onChange={e => setData('professional_title', e.target.value)}
                                className="w-full rounded-lg border border-slate-gray/20 px-4 py-2 outline-none focus:border-amber-gold"
                                placeholder="Cth: Sopir Berpengalaman"
                            />
                            {errors.professional_title && <p className="mt-1 text-xs text-red-500">{errors.professional_title}</p>}
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-semibold">Pengalaman (Tahun) <span className="text-red-500">*</span></label>
                            <input
                                type="number"
                                min={0}
                                value={data.experience_years}
                                onChange={e => setData('experience_years', parseInt(e.target.value) || 0)}
                                className="w-full rounded-lg border border-slate-gray/20 px-4 py-2 outline-none focus:border-amber-gold"
                                required
                            />
                            {errors.experience_years && <p className="mt-1 text-xs text-red-500">{errors.experience_years}</p>}
                        </div>
                    </div>

                    {editingDriver && (
                        <div>
                            <label className="mb-1 block text-sm font-semibold">Status <span className="text-red-500">*</span></label>
                            <select
                                value={data.status}
                                onChange={e => setData('status', e.target.value)}
                                className="w-full rounded-lg border border-slate-gray/20 px-4 py-2 outline-none focus:border-amber-gold"
                                required
                            >
                                <option value="available">Tersedia</option>
                                <option value="on_duty">Bertugas</option>
                                <option value="off_duty">Off Duty</option>
                                <option value="inactive">Nonaktif</option>
                            </select>
                            {errors.status && <p className="mt-1 text-xs text-red-500">{errors.status}</p>}
                        </div>
                    )}

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
