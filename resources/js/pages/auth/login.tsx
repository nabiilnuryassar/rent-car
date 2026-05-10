import { Link, useForm } from '@inertiajs/react';
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
            title="Masuk"
            subtitle="Gunakan email dan password untuk membuka dashboard sesuai peran."
            action={
                <Link href={register.url()} className="underline underline-offset-4">
                    Buat akun customer
                </Link>
            }
        >
            <form onSubmit={submit} className="grid gap-5">
                <label className="grid gap-2">
                    <span className="text-sm font-medium">Email</span>
                    <input
                        type="email"
                        value={data.email}
                        onChange={(event) => setData('email', event.target.value)}
                        className="h-12 rounded-2xl border border-slate-gray/20 bg-base-white px-4 outline-none focus:border-navy-blue"
                        autoComplete="email"
                        autoFocus
                    />
                    {errors.email && (
                        <span className="text-sm text-red-700">{errors.email}</span>
                    )}
                </label>

                <label className="grid gap-2">
                    <span className="text-sm font-medium">Password</span>
                    <input
                        type="password"
                        value={data.password}
                        onChange={(event) =>
                            setData('password', event.target.value)
                        }
                        className="h-12 rounded-2xl border border-slate-gray/20 bg-base-white px-4 outline-none focus:border-navy-blue"
                        autoComplete="current-password"
                    />
                    {errors.password && (
                        <span className="text-sm text-red-700">
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
                        className="size-4 rounded border-slate-gray/20"
                    />
                    Ingat sesi
                </label>

                <button
                    type="submit"
                    disabled={processing}
                    className="h-12 rounded-full bg-amber-gold px-8 font-medium text-navy-blue disabled:opacity-60"
                >
                    Masuk
                </button>
            </form>
        </AuthLayout>
    );
}
