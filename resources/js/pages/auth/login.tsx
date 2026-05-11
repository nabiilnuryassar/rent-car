import { Link, useForm } from '@inertiajs/react';
import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import type { FormEvent } from 'react';

import AuthLayout from '@/layouts/auth-layout';
import { register } from '@/routes';
import { store as loginStore } from '@/routes/login';

type LoginForm = {
    email: string;
    password: string;
    remember: boolean;
};

export default function Login() {
    const [showPassword, setShowPassword] = useState(false);
    const { data, setData, post, processing, errors, reset } =
        useForm<LoginForm>({
            email: '',
            password: '',
            remember: false,
        });

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        post(loginStore.url(), {
            onFinish: () => reset('password'),
        });
    }

    return (
        <AuthLayout
            title="Masuk ke akun Anda"
            subtitle="Gunakan email dan password untuk membuka dashboard sesuai peran."
            action={
                <Link
                    href={register.url()}
                    className="font-semibold text-navy-blue transition-colors hover:text-amber-gold"
                >
                    Buat akun customer →
                </Link>
            }
        >
            <form onSubmit={submit} className="grid gap-5">
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
                        autoFocus
                    />
                    {errors.email && (
                        <span className="pl-2 text-xs font-medium text-red-600">
                            {errors.email}
                        </span>
                    )}
                </label>

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
                            placeholder="••••••••"
                            className="h-12 w-full rounded-full border-2 border-slate-gray/15 bg-surface-gray px-5 pr-12 text-sm font-medium text-navy-blue outline-none transition-all placeholder:text-slate-gray/50 focus:border-navy-blue focus:bg-base-white focus:ring-4 focus:ring-navy-blue/5"
                            autoComplete="current-password"
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

                <label className="flex items-center gap-3 text-sm">
                    <input
                        type="checkbox"
                        checked={data.remember}
                        onChange={(event) =>
                            setData('remember', event.target.checked)
                        }
                        className="h-4.5 w-4.5 rounded-md border-2 border-slate-gray/20 text-navy-blue focus:ring-navy-blue/20"
                    />
                    <span className="font-medium text-slate-gray">
                        Ingat sesi saya
                    </span>
                </label>

                <button
                    type="submit"
                    disabled={processing}
                    className="mt-2 h-12 rounded-full bg-amber-gold px-8 text-sm font-bold text-navy-blue shadow-rental transition-all hover:-translate-y-0.5 hover:bg-amber-gold/90 hover:shadow-lg disabled:pointer-events-none disabled:opacity-60"
                >
                    {processing ? 'Memproses...' : 'Masuk'}
                </button>
            </form>
        </AuthLayout>
    );
}
