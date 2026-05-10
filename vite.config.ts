import { existsSync } from 'node:fs';
import inertia from '@inertiajs/vite';
import { wayfinder } from '@laravel/vite-plugin-wayfinder';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import laravel from 'laravel-vite-plugin';
import { bunny } from 'laravel-vite-plugin/fonts';
import { defineConfig } from 'vite';

const phpBinary =
    process.env.PHP_BINARY ??
    (existsSync('C:/laragon/bin/php/php-8.4.20-nts-Win32-vs17-x64/php.exe')
        ? 'C:/laragon/bin/php/php-8.4.20-nts-Win32-vs17-x64/php.exe'
        : 'php');

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.tsx'],
            refresh: true,
            fonts: [
                bunny('Instrument Sans', {
                    weights: [400, 500, 600],
                }),
            ],
        }),
        inertia(),
        react({
            babel: {
                plugins: ['babel-plugin-react-compiler'],
            },
        }),
        tailwindcss(),
        wayfinder({
            command: `"${phpBinary}" artisan wayfinder:generate`,
            formVariants: true,
        }),
    ],
});
