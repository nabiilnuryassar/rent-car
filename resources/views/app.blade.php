<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" @class(['dark' => ($appearance ?? 'system') == 'dark'])>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="description" content="URBAN 8 adalah sistem penyewaan kendaraan berbasis web untuk mengelola katalog armada, pemesanan, pengemudi, pembayaran, kuitansi, dan layanan antar-jemput secara terpadu.">
        <meta name="theme-color" content="#0b1838">
        <meta property="og:locale" content="id_ID">
        <meta property="og:type" content="website">
        <meta property="og:title" content="URBAN 8 - Sistem Penyewaan Kendaraan Terpadu">
        <meta property="og:description" content="Kelola penyewaan kendaraan, armada, pengemudi, pembayaran, dan layanan antar-jemput dalam satu sistem operasional yang tertata.">
        <meta property="og:url" content="{{ url()->current() }}">
        <meta property="og:image" content="{{ url('/images/share/urban8-share-banner.png') }}">
        <meta property="og:image:width" content="1200">
        <meta property="og:image:height" content="630">
        <meta property="og:image:alt" content="Banner URBAN 8 Sistem Penyewaan Kendaraan Terpadu">
        <meta name="twitter:card" content="summary_large_image">
        <meta name="twitter:title" content="URBAN 8 - Sistem Penyewaan Kendaraan Terpadu">
        <meta name="twitter:description" content="Sistem penyewaan kendaraan berbasis web untuk katalog armada, pemesanan, pengemudi, pembayaran, kuitansi, dan antar-jemput.">
        <meta name="twitter:image" content="{{ url('/images/share/urban8-share-banner.png') }}">

        <link rel="icon" href="/images/logo/logo-urban8.png" type="image/png">
        <link rel="apple-touch-icon" href="/images/logo/logo-urban8.png">

        @fonts

        @viteReactRefresh
        @vite(['resources/css/app.css', 'resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
        <x-inertia::head>
            <title>{{ config('app.name', 'URBAN 8') }}</title>
        </x-inertia::head>
    </head>
    <body class="font-sans antialiased">
        <x-inertia::app />
    </body>
</html>
