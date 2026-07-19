<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" @class(['dark' => ($appearance ?? 'system') == 'dark'])>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        {{-- Blitz brand defaults (page-level Inertia Head can override) --}}
        <meta name="application-name" content="{{ config('app.name', 'Blitz') }}">
        <meta name="theme-color" content="#0F6B66" media="(prefers-color-scheme: light)">
        <meta name="theme-color" content="#0A4F4B" media="(prefers-color-scheme: dark)">
        <meta name="description" content="Blitz is modern personal and small-business banking—multi-account balances, instant transfers, and bank-grade security in one clear app.">
        <meta name="keywords" content="personal banking, small business banking, SME banking, multi-account, money transfers, digital bank, Blitz">

        <meta property="og:site_name" content="{{ config('app.name', 'Blitz') }}">
        <meta property="og:type" content="website">
        <meta property="og:locale" content="{{ str_replace('_', '-', app()->getLocale()) }}">
        <meta property="og:title" content="{{ config('app.name', 'Blitz') }} — Banking for people who run something">
        <meta property="og:description" content="Personal &amp; SME banking with multi-account control, instant transfers, and bank-grade security.">
        <meta property="og:image" content="{{ url('/images/og-default.svg') }}">
        <meta property="og:image:width" content="1200">
        <meta property="og:image:height" content="630">
        <meta property="og:url" content="{{ url()->current() }}">

        <meta name="twitter:card" content="summary_large_image">
        <meta name="twitter:title" content="{{ config('app.name', 'Blitz') }} — Banking for people who run something">
        <meta name="twitter:description" content="Personal &amp; SME banking with multi-account control, instant transfers, and bank-grade security.">
        <meta name="twitter:image" content="{{ url('/images/og-default.svg') }}">

        {{-- Inline script to detect system dark mode preference and apply it immediately --}}
        <script>
            (function() {
                const appearance = '{{ $appearance ?? "system" }}';

                if (appearance === 'system') {
                    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

                    if (prefersDark) {
                        document.documentElement.classList.add('dark');
                    }
                }
            })();
        </script>

        {{-- Brand-aligned document background (matches app.css tokens) --}}
        <style>
            html {
                background-color: oklch(0.995 0.002 100);
            }

            html.dark {
                background-color: oklch(0.16 0.02 250);
            }
        </style>

        <link rel="icon" href="/favicon.svg" type="image/svg+xml">
        <link rel="icon" href="/favicon-32x32.png" type="image/png" sizes="32x32">
        <link rel="icon" href="/favicon-16x16.png" type="image/png" sizes="16x16">
        <link rel="shortcut icon" href="/favicon.ico">
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" sizes="180x180">
        <link rel="mask-icon" href="/images/brand-mark.svg" color="#0F6B66">
        <link rel="manifest" href="/site.webmanifest">

        @fonts

        @viteReactRefresh
        @vite(['resources/css/app.css', 'resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
        <x-inertia::head>
            <title>{{ config('app.name', 'Blitz') }}</title>
        </x-inertia::head>
    </head>
    <body class="font-sans antialiased">
        <x-inertia::app />
    </body>
</html>
