import { Link, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';

import AuthLayout from '@/layouts/auth-layout';
import { login } from '@/routes';
import { store as registerStore } from '@/routes/register';

type RegisterForm = {
    name: string;
    email: string;
    phone: string;
    password: string;
    password_confirmation: string;
};

export default function Register() {
    const { data, setData, post, processing, errors, reset } =
        useForm<RegisterForm>({
            name: '',
            email: '',
            phone: '',
            password: '',
            password_confirmation: '',
        });

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        post(registerStore.url(), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    }

    return (
        <AuthLayout
            title="Daftar customer"
            subtitle="Akun customer baru akan langsung terhubung ke profil pelanggan."
            action={
                <Link href={login.url()} className="underline underline-offset-4">
                    Sudah punya akun
                </Link>
            }
        >
            <form onSubmit={submit} className="grid gap-5">
                <label className="grid gap-2">
                    <span className="text-sm font-medium">Nama</span>
                    <input
                        type="text"
                        value={data.name}
                        onChange={(event) => setData('name', event.target.value)}
                        className="h-12 rounded-2xl border border-slate-gray/20 bg-base-white px-4 outline-none focus:border-navy-blue"
                        autoComplete="name"
                        autoFocus
                    />
                    {errors.name && (
                        <span className="text-sm text-red-700">{errors.name}</span>
                    )}
                </label>

                <label className="grid gap-2">
                    <span className="text-sm font-medium">Email</span>
                    <input
                        type="email"
                        value={data.email}
                        onChange={(event) => setData('email', event.target.value)}
                        className="h-12 rounded-2xl border border-slate-gray/20 bg-base-white px-4 outline-none focus:border-navy-blue"
                        autoComplete="email"
                    />
                    {errors.email && (
                        <span className="text-sm text-red-700">{errors.email}</span>
                    )}
                </label>

                <label className="grid gap-2">
                    <span className="text-sm font-medium">Nomor HP</span>
                    <input
                        type="tel"
                        value={data.phone}
                        onChange={(event) => setData('phone', event.target.value)}
                        className="h-12 rounded-2xl border border-slate-gray/20 bg-base-white px-4 outline-none focus:border-navy-blue"
                        autoComplete="tel"
                    />
                    {errors.phone && (
                        <span className="text-sm text-red-700">{errors.phone}</span>
                    )}
                </label>

                <div className="grid gap-5 md:grid-cols-2">
                    <label className="grid gap-2">
                        <span className="text-sm font-medium">Password</span>
                        <input
                            type="password"
                            value={data.password}
                            onChange={(event) =>
                                setData('password', event.target.value)
                            }
                            className="h-12 rounded-2xl border border-slate-gray/20 bg-base-white px-4 outline-none focus:border-navy-blue"
                            autoComplete="new-password"
                        />
                        {errors.password && (
                            <span className="text-sm text-red-700">
                                {errors.password}
                            </span>
                        )}
                    </label>

                    <label className="grid gap-2">
                        <span className="text-sm font-medium">Konfirmasi</span>
                        <input
                            type="password"
                            value={data.password_confirmation}
                            onChange={(event) =>
                                setData(
                                    'password_confirmation',
                                    event.target.value,
                                )
                            }
                            className="h-12 rounded-2xl border border-slate-gray/20 bg-base-white px-4 outline-none focus:border-navy-blue"
                            autoComplete="new-password"
                        />
                    </label>
                </div>

                <button
                    type="submit"
                    disabled={processing}
                    className="h-12 rounded-full bg-amber-gold px-8 font-medium text-navy-blue disabled:opacity-60"
                >
                    Daftar
                </button>
            </form>
        </AuthLayout>
    );
}
