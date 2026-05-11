import { Link, useForm } from '@inertiajs/react';
import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
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
    const [showPassword, setShowPassword] = useState(false);
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
            title="Buat akun customer"
            subtitle="Akun customer baru akan langsung terhubung ke profil pelanggan."
            action={
                <Link
                    href={login.url()}
                    className="font-semibold text-navy-blue transition-colors hover:text-amber-gold"
                >
                    Sudah punya akun →
                </Link>
            }
        >
            <form onSubmit={submit} className="grid gap-5">
                <label className="grid gap-2">
                    <span className="text-sm font-semibold text-navy-blue">
                        Nama lengkap
                    </span>
                    <input
                        type="text"
                        value={data.name}
                        onChange={(event) =>
                            setData('name', event.target.value)
                        }
                        placeholder="Masukkan nama lengkap"
                        className="h-12 rounded-full border-2 border-slate-gray/15 bg-surface-gray px-5 text-sm font-medium text-navy-blue outline-none transition-all placeholder:text-slate-gray/50 focus:border-navy-blue focus:bg-base-white focus:ring-4 focus:ring-navy-blue/5"
                        autoComplete="name"
                        autoFocus
                    />
                    {errors.name && (
                        <span className="pl-2 text-xs font-medium text-red-600">
                            {errors.name}
                        </span>
                    )}
                </label>

                <label className="grid gap-2">
                    <span className="text-sm font-semibold text-navy-blue">
                        Email
                    </span>
                    <input
                        type="email"
                        value={data.email}
                        onChange={(event) =>
                            setData('email', event.target.value)
                        }
                        placeholder="nama@email.com"
                        className="h-12 rounded-full border-2 border-slate-gray/15 bg-surface-gray px-5 text-sm font-medium text-navy-blue outline-none transition-all placeholder:text-slate-gray/50 focus:border-navy-blue focus:bg-base-white focus:ring-4 focus:ring-navy-blue/5"
                        autoComplete="email"
                    />
                    {errors.email && (
                        <span className="pl-2 text-xs font-medium text-red-600">
                            {errors.email}
                        </span>
                    )}
                </label>

                <label className="grid gap-2">
                    <span className="text-sm font-semibold text-navy-blue">
                        Nomor HP
                    </span>
                    <input
                        type="tel"
                        value={data.phone}
                        onChange={(event) =>
                            setData('phone', event.target.value)
                        }
                        placeholder="08xxxxxxxxxx"
                        className="h-12 rounded-full border-2 border-slate-gray/15 bg-surface-gray px-5 text-sm font-medium text-navy-blue outline-none transition-all placeholder:text-slate-gray/50 focus:border-navy-blue focus:bg-base-white focus:ring-4 focus:ring-navy-blue/5"
                        autoComplete="tel"
                    />
                    {errors.phone && (
                        <span className="pl-2 text-xs font-medium text-red-600">
                            {errors.phone}
                        </span>
                    )}
                </label>

                <div className="grid gap-5 md:grid-cols-2">
                    <label className="grid gap-2">
                        <span className="text-sm font-semibold text-navy-blue">
                            Password
                        </span>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={data.password}
                                onChange={(event) =>
                                    setData('password', event.target.value)
                                }
                                placeholder="Min. 8 karakter"
                                className="h-12 w-full rounded-full border-2 border-slate-gray/15 bg-surface-gray px-5 pr-12 text-sm font-medium text-navy-blue outline-none transition-all placeholder:text-slate-gray/50 focus:border-navy-blue focus:bg-base-white focus:ring-4 focus:ring-navy-blue/5"
                                autoComplete="new-password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-gray transition-colors hover:text-navy-blue"
                                aria-label={
                                    showPassword
                                        ? 'Sembunyikan password'
                                        : 'Tampilkan password'
                                }
                            >
                                {showPassword ? (
                                    <EyeOff className="h-4.5 w-4.5" />
                                ) : (
                                    <Eye className="h-4.5 w-4.5" />
                                )}
                            </button>
                        </div>
                        {errors.password && (
                            <span className="pl-2 text-xs font-medium text-red-600">
                                {errors.password}
                            </span>
                        )}
                    </label>

                    <label className="grid gap-2">
                        <span className="text-sm font-semibold text-navy-blue">
                            Konfirmasi
                        </span>
                        <input
                            type="password"
                            value={data.password_confirmation}
                            onChange={(event) =>
                                setData(
                                    'password_confirmation',
                                    event.target.value,
                                )
                            }
                            placeholder="Ulangi password"
                            className="h-12 rounded-full border-2 border-slate-gray/15 bg-surface-gray px-5 text-sm font-medium text-navy-blue outline-none transition-all placeholder:text-slate-gray/50 focus:border-navy-blue focus:bg-base-white focus:ring-4 focus:ring-navy-blue/5"
                            autoComplete="new-password"
                        />
                    </label>
                </div>

                <button
                    type="submit"
                    disabled={processing}
                    className="mt-2 h-12 rounded-full bg-amber-gold px-8 text-sm font-bold text-navy-blue shadow-rental transition-all hover:-translate-y-0.5 hover:bg-amber-gold/90 hover:shadow-lg disabled:pointer-events-none disabled:opacity-60"
                >
                    {processing ? 'Memproses...' : 'Daftar'}
                </button>
            </form>
        </AuthLayout>
    );
}
