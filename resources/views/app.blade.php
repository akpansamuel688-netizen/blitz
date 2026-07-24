<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" @class(['dark' => ($appearance ?? 'system') == 'dark'])>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        {{-- NovaTrust Bank defaults (page-level Inertia Head can override) --}}
        <meta name="application-name" content="{{ config('app.name', 'NovaTrust Bank') }}">
        <meta name="theme-color" content="#1557C0" media="(prefers-color-scheme: light)">
        <meta name="theme-color" content="#082B5C" media="(prefers-color-scheme: dark)">
        <meta name="description" content="NovaTrust Bank brings personal and business accounts, fast transfers, savings tools, and robust security together in one clear digital banking experience.">
        <meta name="keywords" content="personal banking, business banking, secure payments, savings, money transfers, digital bank, NovaTrust Bank">

        <meta property="og:site_name" content="{{ config('app.name', 'NovaTrust Bank') }}">
        <meta property="og:type" content="website">
        <meta property="og:locale" content="{{ str_replace('_', '-', app()->getLocale()) }}">
        <meta property="og:title" content="{{ config('app.name', 'NovaTrust Bank') }} — Confidence in every financial move">
        <meta property="og:description" content="Modern personal and business banking with clear financial control and bank-grade security.">
        <meta property="og:image" content="{{ url('/images/og-default.svg') }}">
        <meta property="og:image:width" content="1200">
        <meta property="og:image:height" content="630">
        <meta property="og:url" content="{{ url()->current() }}">

        <meta name="twitter:card" content="summary_large_image">
        <meta name="twitter:title" content="{{ config('app.name', 'NovaTrust Bank') }} — Confidence in every financial move">
        <meta name="twitter:description" content="Modern personal and business banking with clear financial control and bank-grade security.">
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
        <link rel="shortcut icon" href="/favicon.svg">
        <link rel="apple-touch-icon" href="/favicon.svg">
        <link rel="mask-icon" href="/images/brand-mark.svg" color="#1557C0">
        <link rel="manifest" href="/site.webmanifest">

        @fonts

        @viteReactRefresh
        @vite(['resources/css/app.css', 'resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
        <x-inertia::head>
            <title>{{ config('app.name', 'NovaTrust Bank') }}</title>
        </x-inertia::head>
    </head>
    <body class="font-sans antialiased">
        <x-inertia::app />
    </body>
</html>
