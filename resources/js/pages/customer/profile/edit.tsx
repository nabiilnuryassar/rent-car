import { Head, useForm, usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import { Mail, Phone, MapPin, Lock, Save, User as UserIcon } from 'lucide-react';
import CustomerLayout from '@/layouts/customer-layout';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/toast';

type Profile = {
    name: string;
    email: string;
    phone: string;
    address: string;
    customer_type?: string;
    total_completed_orders: number;
};

type Flash = {
    success?: string;
};

type Props = {
    profile: Profile;
};

export default function CustomerProfileEdit({ profile }: Props) {
    const { props } = usePage<{ flash?: Flash }>();
    const flashSuccess = props.flash?.success;

    const profileForm = useForm({
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
        address: profile.address,
    });

    const passwordForm = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    useEffect(() => {
        if (flashSuccess) {
            toast.success(flashSuccess);
        }
    }, [flashSuccess]);

    const submitProfile = (e: React.FormEvent) => {
        e.preventDefault();
        profileForm.put('/profile', {
            preserveScroll: true,
            onSuccess: () => toast.success('Profil diperbarui'),
            onError: () => toast.error('Gagal memperbarui profil'),
        });
    };

    const submitPassword = (e: React.FormEvent) => {
        e.preventDefault();
        passwordForm.put('/profile/password', {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Password berhasil diperbarui');
                passwordForm.reset();
            },
            onError: () => toast.error('Gagal memperbarui password'),
        });
    };

    const initials = profile.name
        .split(' ')
        .map((w) => w.charAt(0))
        .slice(0, 2)
        .join('')
        .toUpperCase();

    return (
        <CustomerLayout title="Profil Saya">
            <Head title="Profil Saya" />

            {/* Hero */}
            <section className="mb-10 overflow-hidden rounded-2xl border border-slate-gray/10 bg-gradient-to-br from-navy-blue via-navy-blue/95 to-navy-blue/85 p-6 shadow-rental md:p-8">
                <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-6">
                    <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-amber-gold text-2xl font-extrabold text-navy-blue shadow-lg ring-4 ring-base-white/10">
                        {initials || <UserIcon className="h-8 w-8" />}
                    </div>
                    <div className="flex-1 text-base-white">
                        <p className="text-xs font-semibold uppercase tracking-wider text-amber-gold/90">
                            Profil Saya
                        </p>
                        <h1 className="mt-1 text-2xl font-extrabold leading-tight md:text-3xl">
                            {profile.name}
                        </h1>
                        <p className="mt-1 text-sm text-base-white/70">{profile.email}</p>
                    </div>
                    <div className="flex items-center gap-3 rounded-2xl bg-base-white/10 px-4 py-3 backdrop-blur-md">
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-base-white/70">
                                Total Pesanan
                            </p>
                            <p className="text-lg font-extrabold text-base-white">
                                {profile.total_completed_orders}
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <div className="grid gap-6 lg:grid-cols-5">
                {/* Profile info */}
                <section className="rounded-2xl border border-slate-gray/10 bg-base-white p-6 shadow-sm lg:col-span-3">
                    <header className="mb-6">
                        <h2 className="text-lg font-extrabold text-navy-blue">
                            Informasi Profil
                        </h2>
                        <p className="mt-1 text-xs text-slate-gray">
                            Perbarui data pribadi dan kontak Anda.
                        </p>
                    </header>

                    <form onSubmit={submitProfile} className="flex flex-col gap-5">
                        <Field
                            label="Nama Lengkap"
                            icon={<UserIcon className="h-4 w-4" />}
                            error={profileForm.errors.name}
                        >
                            <input
                                type="text"
                                value={profileForm.data.name}
                                onChange={(e) => profileForm.setData('name', e.target.value)}
                                className="w-full rounded-2xl border border-slate-gray/20 bg-surface-gray px-4 py-3 text-sm text-navy-blue outline-none transition-colors focus:border-amber-gold focus:ring-2 focus:ring-amber-gold/20"
                                autoComplete="name"
                            />
                        </Field>

                        <Field
                            label="Email"
                            icon={<Mail className="h-4 w-4" />}
                            error={profileForm.errors.email}
                        >
                            <input
                                type="email"
                                value={profileForm.data.email}
                                onChange={(e) => profileForm.setData('email', e.target.value)}
                                className="w-full rounded-2xl border border-slate-gray/20 bg-surface-gray px-4 py-3 text-sm text-navy-blue outline-none transition-colors focus:border-amber-gold focus:ring-2 focus:ring-amber-gold/20"
                                autoComplete="email"
                            />
                        </Field>

                        <Field
                            label="Nomor Telepon"
                            icon={<Phone className="h-4 w-4" />}
                            error={profileForm.errors.phone}
                        >
                            <input
                                type="tel"
                                value={profileForm.data.phone}
                                onChange={(e) => profileForm.setData('phone', e.target.value)}
                                placeholder="cth. 0812-3456-7890"
                                className="w-full rounded-2xl border border-slate-gray/20 bg-surface-gray px-4 py-3 text-sm text-navy-blue outline-none transition-colors focus:border-amber-gold focus:ring-2 focus:ring-amber-gold/20"
                                autoComplete="tel"
                            />
                        </Field>

                        <Field
                            label="Alamat"
                            icon={<MapPin className="h-4 w-4" />}
                            error={profileForm.errors.address}
                        >
                            <textarea
                                value={profileForm.data.address}
                                onChange={(e) => profileForm.setData('address', e.target.value)}
                                rows={3}
                                placeholder="Alamat lengkap untuk pengiriman"
                                className="w-full rounded-2xl border border-slate-gray/20 bg-surface-gray px-4 py-3 text-sm text-navy-blue outline-none transition-colors focus:border-amber-gold focus:ring-2 focus:ring-amber-gold/20"
                                autoComplete="street-address"
                            />
                        </Field>

                        <div className="flex justify-end">
                            <Button
                                type="submit"
                                loading={profileForm.processing}
                                leadingIcon={<Save className="h-4 w-4" />}
                            >
                                Simpan Perubahan
                            </Button>
                        </div>
                    </form>
                </section>

                {/* Password */}
                <section className="rounded-2xl border border-slate-gray/10 bg-base-white p-6 shadow-sm lg:col-span-2">
                    <header className="mb-6">
                        <h2 className="text-lg font-extrabold text-navy-blue">Keamanan</h2>
                        <p className="mt-1 text-xs text-slate-gray">
                            Gunakan password yang kuat untuk melindungi akun Anda.
                        </p>
                    </header>

                    <form onSubmit={submitPassword} className="flex flex-col gap-5">
                        <Field
                            label="Password Saat Ini"
                            icon={<Lock className="h-4 w-4" />}
                            error={passwordForm.errors.current_password}
                        >
                            <input
                                type="password"
                                value={passwordForm.data.current_password}
                                onChange={(e) =>
                                    passwordForm.setData('current_password', e.target.value)
                                }
                                className="w-full rounded-2xl border border-slate-gray/20 bg-surface-gray px-4 py-3 text-sm text-navy-blue outline-none transition-colors focus:border-amber-gold focus:ring-2 focus:ring-amber-gold/20"
                                autoComplete="current-password"
                            />
                        </Field>

                        <Field
                            label="Password Baru"
                            icon={<Lock className="h-4 w-4" />}
                            error={passwordForm.errors.password}
                        >
                            <input
                                type="password"
                                value={passwordForm.data.password}
                                onChange={(e) => passwordForm.setData('password', e.target.value)}
                                className="w-full rounded-2xl border border-slate-gray/20 bg-surface-gray px-4 py-3 text-sm text-navy-blue outline-none transition-colors focus:border-amber-gold focus:ring-2 focus:ring-amber-gold/20"
                                autoComplete="new-password"
                            />
                        </Field>

                        <Field
                            label="Konfirmasi Password"
                            icon={<Lock className="h-4 w-4" />}
                        >
                            <input
                                type="password"
                                value={passwordForm.data.password_confirmation}
                                onChange={(e) =>
                                    passwordForm.setData('password_confirmation', e.target.value)
                                }
                                className="w-full rounded-2xl border border-slate-gray/20 bg-surface-gray px-4 py-3 text-sm text-navy-blue outline-none transition-colors focus:border-amber-gold focus:ring-2 focus:ring-amber-gold/20"
                                autoComplete="new-password"
                            />
                        </Field>

                        <div className="flex justify-end">
                            <Button
                                type="submit"
                                loading={passwordForm.processing}
                                variant="accent"
                                leadingIcon={<Lock className="h-4 w-4" />}
                            >
                                Perbarui Password
                            </Button>
                        </div>
                    </form>
                </section>
            </div>
        </CustomerLayout>
    );
}

function Field({
    label,
    icon,
    error,
    children,
}: {
    label: string;
    icon?: React.ReactNode;
    error?: string;
    children: React.ReactNode;
}) {
    return (
        <div>
            <label className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-navy-blue">
                {icon && <span className="text-slate-gray">{icon}</span>}
                {label}
            </label>
            {children}
            {error && (
                <p className="mt-1 text-xs font-medium text-red-500">{error}</p>
            )}
        </div>
    );
}
