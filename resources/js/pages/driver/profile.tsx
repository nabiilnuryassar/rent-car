import { useForm } from '@inertiajs/react';
import { Award, IdCard, Lock, Mail, Phone, User } from 'lucide-react';
import type { FormEventHandler } from 'react';
import DriverLayout from '@/layouts/driver-layout';
import driver from '@/routes/driver';

type Profile = {
    name: string;
    email: string;
    license_number: string | null;
    phone: string | null;
    professional_title: string | null;
    experience_years: number | null;
    status: string | null;
};

type Props = {
    profile: Profile;
};

export default function DriverProfilePage({ profile }: Props) {
    const profileForm = useForm({
        name: profile.name,
        email: profile.email,
        phone: profile.phone ?? '',
    });

    const passwordForm = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const submitProfile: FormEventHandler = (e) => {
        e.preventDefault();
        profileForm.put(driver.profile.update.url(), {
            preserveScroll: true,
        });
    };

    const submitPassword: FormEventHandler = (e) => {
        e.preventDefault();
        passwordForm.put(driver.profile.password.url(), {
            preserveScroll: true,
            onSuccess: () => passwordForm.reset(),
        });
    };

    return (
        <DriverLayout title="Profil" headline="Profil Saya">
            {/* Read-only summary */}
            <section className="mb-5 rounded-2xl bg-base-white p-5 shadow-sm">
                <div className="space-y-3">
                    <Row
                        icon={<IdCard className="h-4 w-4 text-amber-gold" />}
                        label="Nomor SIM"
                        value={profile.license_number ?? '-'}
                    />
                    <Row
                        icon={<Award className="h-4 w-4 text-amber-gold" />}
                        label="Pengalaman"
                        value={
                            profile.experience_years
                                ? `${profile.experience_years} tahun`
                                : '-'
                        }
                    />
                    <Row
                        icon={<User className="h-4 w-4 text-amber-gold" />}
                        label="Title"
                        value={profile.professional_title ?? '-'}
                    />
                </div>
            </section>

            {/* Editable profile */}
            <form
                onSubmit={submitProfile}
                className="mb-5 rounded-2xl bg-base-white p-5 shadow-sm"
            >
                <h2 className="mb-4 text-sm font-bold text-navy-blue">
                    Informasi Akun
                </h2>

                <Field
                    icon={<User className="h-4 w-4" />}
                    label="Nama"
                    error={profileForm.errors.name}
                >
                    <input
                        type="text"
                        value={profileForm.data.name}
                        onChange={(e) =>
                            profileForm.setData('name', e.target.value)
                        }
                        className="w-full rounded-xl border border-slate-gray/20 bg-surface-gray px-4 py-2.5 text-sm outline-none focus:border-amber-gold"
                    />
                </Field>
                <Field
                    icon={<Mail className="h-4 w-4" />}
                    label="Email"
                    error={profileForm.errors.email}
                >
                    <input
                        type="email"
                        value={profileForm.data.email}
                        onChange={(e) =>
                            profileForm.setData('email', e.target.value)
                        }
                        className="w-full rounded-xl border border-slate-gray/20 bg-surface-gray px-4 py-2.5 text-sm outline-none focus:border-amber-gold"
                    />
                </Field>
                <Field
                    icon={<Phone className="h-4 w-4" />}
                    label="Nomor Telepon"
                    error={profileForm.errors.phone}
                >
                    <input
                        type="tel"
                        value={profileForm.data.phone}
                        onChange={(e) =>
                            profileForm.setData('phone', e.target.value)
                        }
                        className="w-full rounded-xl border border-slate-gray/20 bg-surface-gray px-4 py-2.5 text-sm outline-none focus:border-amber-gold"
                    />
                </Field>

                <button
                    type="submit"
                    disabled={profileForm.processing}
                    className="mt-2 w-full rounded-full bg-amber-gold py-3 text-sm font-bold text-navy-blue shadow-sm transition-transform active:scale-[0.98] disabled:opacity-50"
                >
                    {profileForm.processing ? 'Menyimpan...' : 'Simpan Profil'}
                </button>
            </form>

            {/* Password change */}
            <form
                onSubmit={submitPassword}
                className="rounded-2xl bg-base-white p-5 shadow-sm"
            >
                <h2 className="mb-4 flex items-center gap-2 text-sm font-bold text-navy-blue">
                    <Lock className="h-4 w-4 text-amber-gold" />
                    Ubah Kata Sandi
                </h2>

                <Field
                    label="Kata Sandi Saat Ini"
                    error={passwordForm.errors.current_password}
                >
                    <input
                        type="password"
                        value={passwordForm.data.current_password}
                        onChange={(e) =>
                            passwordForm.setData(
                                'current_password',
                                e.target.value,
                            )
                        }
                        className="w-full rounded-xl border border-slate-gray/20 bg-surface-gray px-4 py-2.5 text-sm outline-none focus:border-amber-gold"
                    />
                </Field>
                <Field
                    label="Kata Sandi Baru"
                    error={passwordForm.errors.password}
                >
                    <input
                        type="password"
                        value={passwordForm.data.password}
                        onChange={(e) =>
                            passwordForm.setData('password', e.target.value)
                        }
                        className="w-full rounded-xl border border-slate-gray/20 bg-surface-gray px-4 py-2.5 text-sm outline-none focus:border-amber-gold"
                    />
                </Field>
                <Field label="Konfirmasi Kata Sandi">
                    <input
                        type="password"
                        value={passwordForm.data.password_confirmation}
                        onChange={(e) =>
                            passwordForm.setData(
                                'password_confirmation',
                                e.target.value,
                            )
                        }
                        className="w-full rounded-xl border border-slate-gray/20 bg-surface-gray px-4 py-2.5 text-sm outline-none focus:border-amber-gold"
                    />
                </Field>

                <button
                    type="submit"
                    disabled={passwordForm.processing}
                    className="mt-2 w-full rounded-full bg-navy-blue py-3 text-sm font-bold text-base-white shadow-sm transition-transform active:scale-[0.98] disabled:opacity-50"
                >
                    {passwordForm.processing
                        ? 'Memperbarui...'
                        : 'Ubah Kata Sandi'}
                </button>
            </form>
        </DriverLayout>
    );
}

function Row({
    icon,
    label,
    value,
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
}) {
    return (
        <div className="flex items-center justify-between gap-3 text-xs">
            <span className="flex items-center gap-2 text-slate-gray">
                {icon}
                {label}
            </span>
            <span className="font-bold text-navy-blue">{value}</span>
        </div>
    );
}

function Field({
    icon,
    label,
    error,
    children,
}: {
    icon?: React.ReactNode;
    label: string;
    error?: string;
    children: React.ReactNode;
}) {
    return (
        <label className="mb-3 block">
            <span className="mb-1.5 flex items-center gap-1 text-[11px] font-bold tracking-wide text-slate-gray uppercase">
                {icon}
                {label}
            </span>
            {children}
            {error && (
                <span className="mt-1 block text-[11px] font-semibold text-red-600">
                    {error}
                </span>
            )}
        </label>
    );
}
