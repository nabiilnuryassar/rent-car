import { useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/toast';
import AdminLayout from '@/layouts/admin-layout';
import admin from '@/routes/admin';

type Props = {
    settings: {
        company_name?: string;
        company_phone?: string;
        company_address?: string;
        company_logo?: string;
    };
};

export default function SettingsIndex({ settings }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        company_name: settings.company_name || '',
        company_phone: settings.company_phone || '',
        company_address: settings.company_address || '',
        company_logo: null as File | null,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(admin.settings.store.url(), {
            preserveScroll: true,
            forceFormData: true,
            onError: () => toast.error('Periksa isian formulir.'),
        });
    };

    return (
        <AdminLayout
            title="Pengaturan"
            breadcrumbs={[
                { label: 'Dasbor', href: admin.dashboard.url() },
                { label: 'Pengaturan' },
            ]}
        >
            <div className="mx-auto max-w-2xl rounded-2xl border border-slate-gray/15 bg-base-white p-8 shadow-rental">
                <h2 className="mb-6 text-xl font-bold text-navy-blue">
                    Pengaturan Perusahaan
                </h2>

                <form
                    onSubmit={submit}
                    className="flex flex-col gap-6"
                    encType="multipart/form-data"
                >
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-bold text-navy-blue">
                            Logo Perusahaan
                        </label>
                        {settings.company_logo && (
                            <img
                                src={`/storage/${settings.company_logo}`}
                                alt="Logo Perusahaan"
                                className="mb-2 h-16 w-auto rounded-md bg-surface-gray object-contain p-2"
                            />
                        )}
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setData('company_logo', e.target.files?.[0] || null)}
                            className="block w-full rounded-[12px] border border-slate-gray/20 text-sm file:mr-4 file:rounded-l-[12px] file:border-0 file:bg-navy-blue file:px-4 file:py-2.5 file:font-semibold file:text-base-white hover:file:bg-navy-blue/90"
                        />
                        {errors.company_logo && (
                            <p className="text-xs font-medium text-red-500">
                                {errors.company_logo}
                            </p>
                        )}
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-bold text-navy-blue">Nama Perusahaan</label>
                        <input
                            type="text"
                            value={data.company_name}
                            onChange={(e) => setData('company_name', e.target.value)}
                            placeholder="URBAN 8 Penyewaan"
                            className="w-full rounded-full border border-slate-gray/20 bg-surface-gray px-4 py-2.5 text-sm outline-none focus:border-amber-gold focus:ring-1 focus:ring-amber-gold"
                        />
                        {errors.company_name && (
                            <p className="text-xs font-medium text-red-500">
                                {errors.company_name}
                            </p>
                        )}
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-bold text-navy-blue">Nomor Telepon</label>
                        <input
                            type="text"
                            value={data.company_phone}
                            onChange={(e) => setData('company_phone', e.target.value)}
                            placeholder="08123456789"
                            className="w-full rounded-full border border-slate-gray/20 bg-surface-gray px-4 py-2.5 text-sm outline-none focus:border-amber-gold focus:ring-1 focus:ring-amber-gold"
                        />
                        {errors.company_phone && (
                            <p className="text-xs font-medium text-red-500">
                                {errors.company_phone}
                            </p>
                        )}
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-bold text-navy-blue">Alamat</label>
                        <textarea
                            value={data.company_address}
                            onChange={(e) => setData('company_address', e.target.value)}
                            rows={3}
                            placeholder="Jl. Raya Utama No. 123..."
                            className="w-full rounded-[16px] border border-slate-gray/20 bg-surface-gray px-4 py-2.5 text-sm outline-none focus:border-amber-gold focus:ring-1 focus:ring-amber-gold"
                        />
                        {errors.company_address && (
                            <p className="text-xs font-medium text-red-500">
                                {errors.company_address}
                            </p>
                        )}
                    </div>

                    <div className="mt-4 border-t border-slate-gray/10 pt-6">
                        <Button type="submit" variant="primary" size="lg" loading={processing}>
                            Simpan Pengaturan
                        </Button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
