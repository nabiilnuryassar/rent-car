import { Link, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import Modal from '@/components/ui/Modal';
import { Button } from '@/components/ui/button';
import { useConfirm } from '@/components/ui/confirm-modal';
import { LoadingWrapper } from '@/components/ui/loading-wrapper';
import { SkeletonTable } from '@/components/ui/skeleton';
import { toast } from '@/components/ui/toast';
import AdminLayout from '@/layouts/admin-layout';
import { formatDriverStatus } from '@/lib/labels';
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

type Filters = { status?: string; experience?: string; search?: string };

type Props = {
    drivers: { data: Driver[]; links: { url: string | null; label: string; active: boolean }[] };
    filters: Filters;
};

const statusColors: Record<string, string> = {
    available: 'bg-pale-green text-success-green',
    reserved: 'bg-yellow-100 text-yellow-700',
    on_duty: 'bg-blue-100 text-blue-700',
    off_duty: 'bg-orange-100 text-orange-700',
    inactive: 'bg-red-100 text-red-600',
};

export default function DriverIndex({ drivers, filters }: Props) {
    const confirm = useConfirm();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
    const [isRouteLoading, setIsRouteLoading] = useState(false);
    const [searchInput, setSearchInput] = useState(filters.search ?? '');

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

    function applyFilter(patch: Partial<Filters>) {
        setIsRouteLoading(true);
        router.get(
            admin.drivers.index.url(),
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
            admin.drivers.index.url(),
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

    async function handleDeactivate(driver: Driver) {
        const ok = await confirm({
            title: `Nonaktifkan ${driver.user.name}?`,
            description:
                'Pengemudi tidak akan tersedia untuk pesanan baru sampai diaktifkan kembali.',
            confirmLabel: 'Nonaktifkan',
            variant: 'danger',
        });
        if (!ok) return;

        router.delete(admin.drivers.destroy.url(driver.id), {
            preserveScroll: true,
        });
    }

    function submit(e: React.FormEvent) {
        e.preventDefault();

        if (editingDriver) {
            put(admin.drivers.update.url(editingDriver.id), {
                preserveScroll: true,
                onSuccess: () => closeModal(),
                onError: () => toast.error('Periksa isian formulir.'),
            });
        } else {
            post(admin.drivers.store.url(), {
                preserveScroll: true,
                onSuccess: () => closeModal(),
                onError: () => toast.error('Periksa isian formulir.'),
            });
        }
    }

    const hasFilters = Boolean(
        filters.status || filters.experience || filters.search,
    );

    const headerActions = (
        <Button variant="accent" onClick={openCreateModal}>
            + Tambah Pengemudi
        </Button>
    );

    return (
        <AdminLayout
            title="Pengemudi"
            breadcrumbs={[
                { label: 'Dasbor', href: admin.dashboard.url() },
                { label: 'Pengemudi' },
            ]}
            headerActions={headerActions}
        >
            <div className="mb-4 flex flex-wrap items-center gap-2">
                <form onSubmit={submitSearch} className="flex-1 min-w-[220px]">
                    <input
                        type="search"
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        placeholder="Cari nama, email, atau SIM..."
                        className="w-full rounded-full border border-slate-gray/20 bg-base-white px-4 py-2 text-sm outline-none focus:border-amber-gold"
                    />
                </form>
                <select
                    value={filters.status ?? ''}
                    onChange={(e) => applyFilter({ status: e.target.value || undefined })}
                    className="rounded-full border border-slate-gray/20 bg-base-white px-4 py-2 text-sm outline-none focus:border-amber-gold"
                >
                    <option value="">Semua Status</option>
                    <option value="available">Tersedia</option>
                    <option value="reserved">Dipesan</option>
                    <option value="on_duty">Sedang Bertugas</option>
                    <option value="off_duty">Tidak Bertugas</option>
                    <option value="inactive">Nonaktif</option>
                </select>
                <select
                    value={filters.experience ?? ''}
                    onChange={(e) => applyFilter({ experience: e.target.value || undefined })}
                    className="rounded-full border border-slate-gray/20 bg-base-white px-4 py-2 text-sm outline-none focus:border-amber-gold"
                >
                    <option value="">Pengalaman: Semua</option>
                    <option value="lt2">{'< 2 tahun'}</option>
                    <option value="2to5">2-5 tahun</option>
                    <option value="gt5">{'> 5 tahun'}</option>
                </select>
                {hasFilters && (
                    <Button variant="ghost" size="sm" onClick={resetFilters}>
                        Reset
                    </Button>
                )}
            </div>

            <LoadingWrapper
                loading={isRouteLoading}
                skeleton={<SkeletonTable rows={6} columns={5} />}
            >
                <div className="overflow-hidden rounded-2xl border border-slate-gray/15 bg-base-white shadow-rental">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-slate-gray/15 bg-surface-gray/60 text-left text-xs font-semibold tracking-wide text-slate-gray uppercase">
                                <th className="px-6 py-4">Nama</th>
                                <th className="px-6 py-4">SIM</th>
                                <th className="px-6 py-4">Telepon</th>
                                <th className="px-6 py-4">Pengalaman</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {drivers.data.length === 0 && (
                                <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-gray">Belum ada pengemudi yang cocok.</td></tr>
                            )}
                            {drivers.data.map((d) => (
                                <tr key={d.id} className="border-b border-slate-gray/10 transition-colors hover:bg-surface-gray/40">
                                    <td className="px-6 py-4">
                                        <div className="font-semibold">{d.user.name}</div>
                                        <div className="text-xs text-slate-gray">{d.user.email}</div>
                                    </td>
                                    <td className="px-6 py-4 font-mono">{d.license_number}</td>
                                    <td className="px-6 py-4">{d.phone}</td>
                                    <td className="px-6 py-4">{d.experience_years ?? 0} tahun</td>
                                    <td className="px-6 py-4">
                                        <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${statusColors[d.status] ?? 'bg-slate-gray/20'}`}>
                                            {formatDriverStatus(d.status)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <Button variant="outline" size="sm" onClick={() => openEditModal(d)}>Edit</Button>
                                            {d.status !== 'inactive' && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-red-600 hover:bg-red-50 hover:text-red-700"
                                                    onClick={() => handleDeactivate(d)}
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
                {drivers.links.map((link) => (
                    <Link key={link.label} href={link.url ?? '#'} className={`rounded-full px-4 py-2 text-sm ${link.active ? 'bg-amber-gold font-bold' : 'bg-base-white hover:bg-surface-gray'}`} dangerouslySetInnerHTML={{ __html: link.label }} />
                ))}
            </div>

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
                            <input type="text" value={data.name} onChange={e => setData('name', e.target.value)} className="w-full rounded-lg border border-slate-gray/20 px-4 py-2 outline-none focus:border-amber-gold" placeholder="Contoh: Budi Santoso" required />
                            {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-semibold">Email <span className="text-red-500">*</span></label>
                            <input type="email" value={data.email} onChange={e => setData('email', e.target.value)} className="w-full rounded-lg border border-slate-gray/20 px-4 py-2 outline-none focus:border-amber-gold" placeholder="budi@example.com" required />
                            {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
                        </div>
                    </div>

                    {!editingDriver && (
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="mb-1 block text-sm font-semibold">Kata Sandi <span className="text-red-500">*</span></label>
                                <input type="password" value={data.password} onChange={e => setData('password', e.target.value)} className="w-full rounded-lg border border-slate-gray/20 px-4 py-2 outline-none focus:border-amber-gold" required={!editingDriver} />
                                {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-semibold">Konfirmasi Kata Sandi <span className="text-red-500">*</span></label>
                                <input type="password" value={data.password_confirmation} onChange={e => setData('password_confirmation', e.target.value)} className="w-full rounded-lg border border-slate-gray/20 px-4 py-2 outline-none focus:border-amber-gold" required={!editingDriver} />
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="mb-1 block text-sm font-semibold">Nomor SIM <span className="text-red-500">*</span></label>
                            <input type="text" value={data.license_number} onChange={e => setData('license_number', e.target.value)} className="w-full rounded-lg border border-slate-gray/20 px-4 py-2 outline-none focus:border-amber-gold" placeholder="1234-5678-9012" required />
                            {errors.license_number && <p className="mt-1 text-xs text-red-500">{errors.license_number}</p>}
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-semibold">Telepon <span className="text-red-500">*</span></label>
                            <input type="text" value={data.phone} onChange={e => setData('phone', e.target.value)} className="w-full rounded-lg border border-slate-gray/20 px-4 py-2 outline-none focus:border-amber-gold" placeholder="081234567890" required />
                            {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="mb-1 block text-sm font-semibold">Jabatan Profesional</label>
                            <input type="text" value={data.professional_title} onChange={e => setData('professional_title', e.target.value)} className="w-full rounded-lg border border-slate-gray/20 px-4 py-2 outline-none focus:border-amber-gold" placeholder="Cth: Sopir Berpengalaman" />
                            {errors.professional_title && <p className="mt-1 text-xs text-red-500">{errors.professional_title}</p>}
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-semibold">Pengalaman (Tahun) <span className="text-red-500">*</span></label>
                            <input type="number" min={0} value={data.experience_years} onChange={e => setData('experience_years', parseInt(e.target.value) || 0)} className="w-full rounded-lg border border-slate-gray/20 px-4 py-2 outline-none focus:border-amber-gold" required />
                            {errors.experience_years && <p className="mt-1 text-xs text-red-500">{errors.experience_years}</p>}
                        </div>
                    </div>

                    {editingDriver && (
                        <div>
                            <label className="mb-1 block text-sm font-semibold">Status <span className="text-red-500">*</span></label>
                            <select value={data.status} onChange={e => setData('status', e.target.value)} className="w-full rounded-lg border border-slate-gray/20 px-4 py-2 outline-none focus:border-amber-gold" required>
                                <option value="available">Tersedia</option>
                                <option value="on_duty">Sedang Bertugas</option>
                                <option value="off_duty">Tidak Bertugas</option>
                                <option value="inactive">Nonaktif</option>
                            </select>
                            {errors.status && <p className="mt-1 text-xs text-red-500">{errors.status}</p>}
                        </div>
                    )}

                    <div className="mt-4 flex justify-end gap-2">
                        <Button variant="ghost" onClick={closeModal}>Batal</Button>
                        <Button type="submit" variant="primary" loading={processing}>Simpan</Button>
                    </div>
                </form>
            </Modal>
        </AdminLayout>
    );
}
