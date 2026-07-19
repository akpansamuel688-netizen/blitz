import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    Building2,
    CheckCircle2,
    Lock,
    Menu,
    ShieldCheck,
    Sparkles,
    TrendingUp,
    UserRound,
    Wallet,
    X,
    Zap,
} from 'lucide-react';
import { useState } from 'react';
import BrandWordmark from '@/components/brand-wordmark';
import { Button } from '@/components/ui/button';
import { brand } from '@/lib/brand';
import { dashboard, login } from '@/routes';
/* @chisel-registration */
import { register } from '@/routes';
/* @end-chisel-registration */

/**
 * Curated Unsplash assets — free under the Unsplash License.
 * https://unsplash.com
 */
const images = {
    hero: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=2000&q=80',
    dashboard: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1600&q=80',
    transfer: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1200&q=80',
    security: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=1200&q=80',
    team: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=1400&q=80',
    city: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&w=1600&q=80',
    lifestyle: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1200&q=80',
    office: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1400&q=80',
    founder: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1400&q=80',
} as const;

const stats = [
    { value: 'Minutes', label: 'To open your first account' },
    { value: 'Multi', label: 'Personal & business accounts' },
    { value: 'Instant', label: 'Transfers between your accounts' },
    { value: '2FA', label: 'Passkeys & recovery built in' },
] as const;

const features = [
    {
        icon: Wallet,
        title: 'One view of every account',
        description:
            'Keep personal checking, business operating, and savings side by side. See net worth and balances without juggling five bank apps.',
        image: images.dashboard,
        imageAlt: 'Financial analytics dashboard on a laptop',
    },
    {
        icon: Zap,
        title: 'Move money when work demands it',
        description:
            'Pay yourself, fund payroll, or shift cash to reserves in a few taps—with a full history you can actually reconcile later.',
        image: images.transfer,
        imageAlt: 'Person managing finances on a smartphone',
    },
    {
        icon: ShieldCheck,
        title: 'Security that fits real life',
        description:
            'Passkeys, two-factor authentication, and recovery codes—the same habits security teams expect, without enterprise friction.',
        image: images.security,
        imageAlt: 'Secure digital lock concept',
    },
] as const;

const pillars = [
    {
        icon: UserRound,
        title: 'For individuals who earn independently',
        body: 'Freelancers and creators get clean personal accounts, transparent activity, and tools that don’t treat you like a branch brochure.',
    },
    {
        icon: Building2,
        title: 'For SMEs that outgrew spreadsheets',
        body: 'Founders and small operators track operating cash, move funds between accounts, and stay audit-ready without a finance department.',
    },
    {
        icon: TrendingUp,
        title: 'Clarity over complexity',
        body: 'Editorial-clear hierarchy: balances first, actions second, clutter never. Built for people who check money between real work.',
    },
    {
        icon: Lock,
        title: 'Trust you can complete',
        body: 'Security flows that people finish—passkeys, 2FA, and session hygiene—so protection isn’t abandoned after setup day.',
    },
] as const;

const steps = [
    {
        step: '01',
        title: 'Create your Blitz profile',
        description: 'Sign up in minutes with modern authentication. Add passkeys when you’re ready.',
    },
    {
        step: '02',
        title: 'Add personal or business accounts',
        description: 'Name accounts the way you work—day-to-day, tax reserve, client float—and watch balances unify.',
    },
    {
        step: '03',
        title: 'Transfer, track, and stay in control',
        description: 'Move money between accounts, review history, and know exactly where cash sits.',
    },
] as const;

const testimonials = [
    {
        quote: 'I finally stopped using one app for personal and another for the studio. Blitz shows both without feeling like “enterprise software.”',
        name: 'Jordan Hale',
        role: 'Independent designer & studio owner',
    },
    {
        quote: 'As a founder, I need to pay myself, park tax money, and see runway. Transfers are instant and the history is clean enough for my bookkeeper.',
        name: 'Priya Nair',
        role: 'Founder, Northwind Supply Co.',
    },
    {
        quote: 'Passkeys and 2FA were painless. That mattered more than another flashy dashboard—we handle client payments every week.',
        name: 'Diego Morales',
        role: 'Ops lead, Harbor Agency',
    },
] as const;

const audiences = [
    'Freelancers & sole props',
    'Founder-led SMEs',
    'Local operators',
    'Households with side businesses',
] as const;

const trustPoints = [
    'Personal + business accounts',
    'Instant internal transfers',
    'Passkeys & 2FA',
    'Full transaction history',
] as const;

function absoluteUrl(path: string): string {
    if (typeof window === 'undefined') {
        return path;
    }

    return new URL(path, window.location.origin).toString();
}

export default function Welcome() {
    const { auth } = usePage().props;
    const [mobileOpen, setMobileOpen] = useState(false);

    const primaryHref = auth.user ? dashboard() : register();
    const primaryLabel = auth.user ? 'Open dashboard' : 'Open an account';
    const pageTitle = brand.seo.titleDefault;
    const pageDescription = brand.description;
    const ogImage = absoluteUrl(brand.images.og);

    return (
        <>
            <Head title={pageTitle}>
                <meta head-key="description" name="description" content={pageDescription} />
                <meta head-key="og:title" property="og:title" content={pageTitle} />
                <meta head-key="og:description" property="og:description" content={brand.shortDescription} />
                <meta head-key="og:image" property="og:image" content={ogImage} />
                <meta head-key="og:type" property="og:type" content="website" />
                <meta head-key="twitter:card" name="twitter:card" content="summary_large_image" />
                <meta head-key="twitter:title" name="twitter:title" content={pageTitle} />
                <meta head-key="twitter:description" name="twitter:description" content={brand.shortDescription} />
                <meta head-key="twitter:image" name="twitter:image" content={ogImage} />
            </Head>

            <div className="min-h-screen bg-background text-foreground antialiased">
                {/* ─── Navigation ─── */}
                <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
                    <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                        <BrandWordmark size="sm" />

                        <nav className="hidden items-center gap-8 text-sm font-medium text-muted-foreground md:flex">
                            <a href="#platform" className="transition-colors hover:text-foreground">
                                Platform
                            </a>
                            <a href="#who" className="transition-colors hover:text-foreground">
                                Who it’s for
                            </a>
                            <a href="#how-it-works" className="transition-colors hover:text-foreground">
                                How it works
                            </a>
                            <a href="#customers" className="transition-colors hover:text-foreground">
                                Stories
                            </a>
                        </nav>

                        <div className="hidden items-center gap-2 md:flex">
                            {auth.user ? (
                                <Button asChild>
                                    <Link href={dashboard()}>
                                        Dashboard
                                        <ArrowRight className="size-4" />
                                    </Link>
                                </Button>
                            ) : (
                                <>
                                    <Button variant="ghost" asChild>
                                        <Link href={login()}>Log in</Link>
                                    </Button>
                                    {/* @chisel-registration */}
                                    <Button asChild>
                                        <Link href={register()}>
                                            Get started
                                            <ArrowRight className="size-4" />
                                        </Link>
                                    </Button>
                                    {/* @end-chisel-registration */}
                                </>
                            )}
                        </div>

                        <button
                            type="button"
                            className="inline-flex size-10 items-center justify-center rounded-md border border-border md:hidden"
                            onClick={() => setMobileOpen((open) => !open)}
                            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
                        >
                            {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
                        </button>
                    </div>

                    {mobileOpen && (
                        <div className="border-t border-border bg-background px-4 py-4 md:hidden">
                            <nav className="flex flex-col gap-3 text-sm font-medium">
                                <a href="#platform" onClick={() => setMobileOpen(false)}>
                                    Platform
                                </a>
                                <a href="#who" onClick={() => setMobileOpen(false)}>
                                    Who it’s for
                                </a>
                                <a href="#how-it-works" onClick={() => setMobileOpen(false)}>
                                    How it works
                                </a>
                                <a href="#customers" onClick={() => setMobileOpen(false)}>
                                    Stories
                                </a>
                                <div className="mt-2 flex flex-col gap-2 border-t border-border pt-4">
                                    {auth.user ? (
                                        <Button asChild className="w-full">
                                            <Link href={dashboard()}>Dashboard</Link>
                                        </Button>
                                    ) : (
                                        <>
                                            <Button variant="outline" asChild className="w-full">
                                                <Link href={login()}>Log in</Link>
                                            </Button>
                                            {/* @chisel-registration */}
                                            <Button asChild className="w-full">
                                                <Link href={register()}>Get started</Link>
                                            </Button>
                                            {/* @end-chisel-registration */}
                                        </>
                                    )}
                                </div>
                            </nav>
                        </div>
                    )}
                </header>

                <main>
                    {/* ─── Hero ─── */}
                    <section className="relative overflow-hidden">
                        <div className="absolute inset-0">
                            <img
                                src={images.hero}
                                alt="Modern glass architecture representing modern banking"
                                className="h-full w-full object-cover"
                                fetchPriority="high"
                            />
                            <div className="absolute inset-0 bg-gradient-to-r from-[oklch(0.18_0.04_195)]/95 via-[oklch(0.22_0.05_190)]/80 to-[oklch(0.3_0.06_190)]/45" />
                            <div className="absolute inset-0 bg-gradient-to-t from-[oklch(0.16_0.03_250)]/70 via-transparent to-black/25" />
                        </div>

                        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8 lg:py-40">
                            <div className="max-w-3xl">
                                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium tracking-wide text-white/90 backdrop-blur-sm">
                                    <Sparkles className="size-3.5 text-teal-300" />
                                    Personal & SME banking
                                </div>

                                <h1 className="font-display text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl lg:leading-[1.08]">
                                    {brand.tagline.split(' who ')[0]} who
                                    <span className="block text-teal-200/90">run something.</span>
                                </h1>

                                <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/75 sm:text-xl">
                                    Blitz is the account hub for freelancers, founders, and small businesses—personal and
                                    operating balances together, transfers when cash needs to move, security you will
                                    actually use.
                                </p>

                                <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
                                    <Button
                                        size="lg"
                                        asChild
                                        className="h-12 bg-white px-7 text-base text-[oklch(0.22_0.05_195)] hover:bg-white/90"
                                    >
                                        <Link href={primaryHref}>
                                            {primaryLabel}
                                            <ArrowRight className="size-4" />
                                        </Link>
                                    </Button>
                                    <Button
                                        size="lg"
                                        variant="outline"
                                        asChild
                                        className="h-12 border-white/30 bg-transparent px-7 text-base text-white hover:bg-white/10 hover:text-white"
                                    >
                                        <a href="#platform">See how it works</a>
                                    </Button>
                                </div>

                                <ul className="mt-10 flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/65">
                                    {trustPoints.map((point) => (
                                        <li key={point} className="flex items-center gap-2">
                                            <CheckCircle2 className="size-4 text-teal-300" />
                                            {point}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </section>

                    {/* ─── Stats ─── */}
                    <section className="border-b border-border bg-brand-subtle/80 dark:bg-brand-subtle/40">
                        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-px sm:grid-cols-4 lg:divide-x lg:divide-border">
                            {stats.map((stat) => (
                                <div key={stat.label} className="px-6 py-10 text-center sm:px-8">
                                    <p className="text-2xl font-semibold tracking-tight text-brand sm:text-3xl dark:text-brand">
                                        {stat.value}
                                    </p>
                                    <p className="mt-2 text-sm text-muted-foreground">{stat.label}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* ─── Audience strip ─── */}
                    <section className="border-b border-border">
                        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-4 px-4 py-6 sm:flex-row sm:items-center sm:px-6 lg:px-8">
                            <p className="text-sm font-medium text-muted-foreground">Built for</p>
                            <div className="flex flex-wrap gap-2">
                                {audiences.map((label) => (
                                    <span
                                        key={label}
                                        className="rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-foreground/80 sm:text-sm"
                                    >
                                        {label}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* ─── Editorial intro ─── */}
                    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
                        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
                            <div className="lg:col-span-5">
                                <p className="text-sm font-semibold tracking-widest text-brand uppercase">
                                    Why Blitz exists
                                </p>
                                <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl lg:text-[2.75rem] lg:leading-tight">
                                    Consumer simple. Operator clear.
                                </h2>
                                <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
                                    Big banks bury small operators in products. Pure consumer apps ignore business cash.
                                    Blitz sits in the middle: everyday banking for people who also run a P&amp;L—even if
                                    that P&amp;L is just you.
                                </p>
                                <div className="mt-8 space-y-4">
                                    {[
                                        'Separate personal and business money without losing the big picture',
                                        'Transfer between your accounts without waiting on batch windows',
                                        'Security defaults that freelancers and SMEs will finish setting up',
                                    ].map((item) => (
                                        <div key={item} className="flex items-start gap-3">
                                            <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-brand" />
                                            <p className="text-base leading-snug">{item}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="relative lg:col-span-7">
                                <div className="overflow-hidden rounded-2xl border border-border shadow-2xl shadow-brand/10">
                                    <img
                                        src={images.dashboard}
                                        alt="Analytics and performance charts on a desktop display"
                                        className="aspect-[16/10] w-full object-cover"
                                        loading="lazy"
                                    />
                                </div>
                                <div className="absolute -bottom-6 -left-4 hidden max-w-xs rounded-xl border border-border bg-card p-5 shadow-xl sm:block lg:-left-8">
                                    <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                                        Your money, named
                                    </p>
                                    <p className="mt-1 text-2xl font-semibold tracking-tight text-brand">
                                        Operating · Tax · Life
                                    </p>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        Accounts labeled for how you actually spend
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* ─── Platform features ─── */}
                    <section id="platform" className="scroll-mt-20 border-y border-border bg-muted/40">
                        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
                            <div className="mx-auto max-w-2xl text-center">
                                <p className="text-sm font-semibold tracking-widest text-brand uppercase">Platform</p>
                                <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
                                    The banking surface small teams actually finish using.
                                </h2>
                                <p className="mt-4 text-lg text-muted-foreground">
                                    Accounts, transfers, and history—composed so a solo founder and a five-person
                                    shop get the same clarity.
                                </p>
                            </div>

                            <div className="mt-16 grid gap-8 lg:grid-cols-3">
                                {features.map((feature) => (
                                    <article
                                        key={feature.title}
                                        className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-shadow hover:shadow-lg hover:shadow-brand/5"
                                    >
                                        <div className="aspect-[16/10] overflow-hidden">
                                            <img
                                                src={feature.image}
                                                alt={feature.imageAlt}
                                                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                                                loading="lazy"
                                            />
                                        </div>
                                        <div className="flex flex-1 flex-col p-6 sm:p-7">
                                            <div className="mb-4 flex size-10 items-center justify-center rounded-lg bg-brand text-brand-foreground">
                                                <feature.icon className="size-5" />
                                            </div>
                                            <h3 className="text-xl font-semibold tracking-tight">{feature.title}</h3>
                                            <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground sm:text-base">
                                                {feature.description}
                                            </p>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* ─── Who it's for ─── */}
                    <section id="who" className="scroll-mt-20">
                        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
                            <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
                                <div>
                                    <p className="text-sm font-semibold tracking-widest text-brand uppercase">
                                        Who it’s for
                                    </p>
                                    <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
                                        Not Wall Street. Not a toy wallet.
                                    </h2>
                                    <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
                                        Blitz is for people whose money has both a life and a livelihood—household
                                        spending next to client revenue, savings next to vendor payments.
                                    </p>

                                    <div className="mt-10 grid gap-6 sm:grid-cols-2">
                                        {pillars.map((pillar) => (
                                            <div
                                                key={pillar.title}
                                                className="rounded-xl border border-border bg-card p-5 transition-colors hover:border-brand/30"
                                            >
                                                <pillar.icon className="size-5 text-brand" />
                                                <h3 className="mt-3 text-base font-semibold">{pillar.title}</h3>
                                                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                                                    {pillar.body}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="relative">
                                    <div className="grid grid-cols-2 gap-4">
                                        <img
                                            src={images.founder}
                                            alt="Small team collaborating on a laptop"
                                            className="aspect-[3/4] rounded-2xl object-cover shadow-lg"
                                            loading="lazy"
                                        />
                                        <div className="flex flex-col gap-4 pt-10">
                                            <img
                                                src={images.lifestyle}
                                                alt="Contactless payment at a retail counter"
                                                className="aspect-square rounded-2xl object-cover shadow-lg"
                                                loading="lazy"
                                            />
                                            <img
                                                src={images.office}
                                                alt="Bright modern workspace"
                                                className="aspect-[4/3] rounded-2xl object-cover shadow-lg"
                                                loading="lazy"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* ─── How it works ─── */}
                    <section
                        id="how-it-works"
                        className="scroll-mt-20 bg-[oklch(0.22_0.05_195)] text-white dark:bg-[oklch(0.2_0.04_200)]"
                    >
                        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
                            <div className="grid gap-12 lg:grid-cols-12">
                                <div className="lg:col-span-4">
                                    <p className="text-sm font-semibold tracking-widest text-teal-300/80 uppercase">
                                        How it works
                                    </p>
                                    <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
                                        Live before lunch.
                                    </h2>
                                    <p className="mt-4 text-white/65">
                                        No multi-week “implementation.” Open Blitz, add the accounts you already think
                                        in, and start moving money with a trail you can trust.
                                    </p>
                                    <Button
                                        size="lg"
                                        asChild
                                        className="mt-8 h-12 bg-white px-7 text-[oklch(0.22_0.05_195)] hover:bg-white/90"
                                    >
                                        <Link href={primaryHref}>
                                            {primaryLabel}
                                            <ArrowRight className="size-4" />
                                        </Link>
                                    </Button>
                                </div>

                                <ol className="grid gap-6 sm:grid-cols-3 lg:col-span-8">
                                    {steps.map((item) => (
                                        <li
                                            key={item.step}
                                            className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm"
                                        >
                                            <span className="font-mono text-sm text-teal-300/70">{item.step}</span>
                                            <h3 className="mt-4 text-lg font-semibold">{item.title}</h3>
                                            <p className="mt-2 text-sm leading-relaxed text-white/65">
                                                {item.description}
                                            </p>
                                        </li>
                                    ))}
                                </ol>
                            </div>
                        </div>
                    </section>

                    {/* ─── Customers ─── */}
                    <section id="customers" className="scroll-mt-20">
                        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
                            <div className="grid items-end gap-8 lg:grid-cols-12">
                                <div className="lg:col-span-5">
                                    <p className="text-sm font-semibold tracking-widest text-brand uppercase">
                                        Customer stories
                                    </p>
                                    <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
                                        From side hustle to small company.
                                    </h2>
                                </div>
                                <p className="text-lg text-muted-foreground lg:col-span-6 lg:col-start-7">
                                    Real operators choose Blitz when personal and business cash have to coexist—without
                                    pretending they are a multinational treasury desk.
                                </p>
                            </div>

                            <div className="mt-14 grid gap-6 lg:grid-cols-3">
                                {testimonials.map((item) => (
                                    <blockquote
                                        key={item.name}
                                        className="flex flex-col rounded-2xl border border-border bg-card p-7 shadow-sm"
                                    >
                                        <p className="flex-1 text-base leading-relaxed text-foreground/90">
                                            “{item.quote}”
                                        </p>
                                        <footer className="mt-8 border-t border-border pt-5">
                                            <p className="font-semibold">{item.name}</p>
                                            <p className="mt-0.5 text-sm text-muted-foreground">{item.role}</p>
                                        </footer>
                                    </blockquote>
                                ))}
                            </div>

                            <div className="relative mt-16 overflow-hidden rounded-3xl">
                                <img
                                    src={images.city}
                                    alt="City skyline at dusk"
                                    className="aspect-[21/9] w-full object-cover"
                                    loading="lazy"
                                />
                                <div className="absolute inset-0 bg-gradient-to-r from-[oklch(0.2_0.05_195)]/90 via-[oklch(0.25_0.05_190)]/55 to-transparent" />
                                <div className="absolute inset-0 flex items-center">
                                    <div className="max-w-lg px-8 py-10 sm:px-12">
                                        <p className="text-sm font-medium tracking-wide text-teal-200/80 uppercase">
                                            Wherever you operate
                                        </p>
                                        <p className="mt-3 text-2xl font-semibold text-white sm:text-3xl">
                                            One ledger for the money that funds your work and your life.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* ─── Final CTA ─── */}
                    <section className="border-t border-border bg-brand-subtle/60 dark:bg-muted/30">
                        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
                            <div className="relative overflow-hidden rounded-3xl border border-border bg-card">
                                <div className="absolute inset-0 opacity-30">
                                    <img
                                        src={images.hero}
                                        alt=""
                                        className="h-full w-full object-cover"
                                        loading="lazy"
                                        aria-hidden
                                    />
                                    <div className="absolute inset-0 bg-background/92 dark:bg-background/90" />
                                </div>

                                <div className="relative mx-auto max-w-3xl px-6 py-16 text-center sm:px-10 sm:py-20">
                                    <p className="text-sm font-semibold tracking-widest text-brand uppercase">
                                        Get started
                                    </p>
                                    <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                                        Ready to bank like an operator?
                                    </h2>
                                    <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
                                        Open Blitz, add your first accounts, and keep personal and business cash in one
                                        clear place—with security built for people who move real money every week.
                                    </p>
                                    <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                                        <Button size="lg" asChild className="h-12 px-8 text-base">
                                            <Link href={primaryHref}>
                                                {primaryLabel}
                                                <ArrowRight className="size-4" />
                                            </Link>
                                        </Button>
                                        {!auth.user && (
                                            <Button size="lg" variant="outline" asChild className="h-12 px-8 text-base">
                                                <Link href={login()}>Log in to your account</Link>
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </main>

                {/* ─── Footer ─── */}
                <footer className="border-t border-border bg-background">
                    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
                        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
                            <div className="lg:col-span-2">
                                <BrandWordmark size="sm" />
                                <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
                                    {brand.description}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm font-semibold">Product</p>
                                <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                                    <li>
                                        <a href="#platform" className="hover:text-foreground">
                                            Platform
                                        </a>
                                    </li>
                                    <li>
                                        <a href="#who" className="hover:text-foreground">
                                            Who it’s for
                                        </a>
                                    </li>
                                    <li>
                                        <a href="#how-it-works" className="hover:text-foreground">
                                            How it works
                                        </a>
                                    </li>
                                </ul>
                            </div>

                            <div>
                                <p className="text-sm font-semibold">Account</p>
                                <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                                    {auth.user ? (
                                        <li>
                                            <Link href={dashboard()} className="hover:text-foreground">
                                                Dashboard
                                            </Link>
                                        </li>
                                    ) : (
                                        <>
                                            <li>
                                                <Link href={login()} className="hover:text-foreground">
                                                    Log in
                                                </Link>
                                            </li>
                                            {/* @chisel-registration */}
                                            <li>
                                                <Link href={register()} className="hover:text-foreground">
                                                    Register
                                                </Link>
                                            </li>
                                            {/* @end-chisel-registration */}
                                        </>
                                    )}
                                </ul>
                            </div>
                        </div>

                        <div className="mt-12 flex flex-col gap-3 border-t border-border pt-8 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
                            <p>
                                © {new Date().getFullYear()} {brand.legalName}. All rights reserved.
                            </p>
                            <p>
                                Photography via{' '}
                                <a
                                    href="https://unsplash.com"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="underline underline-offset-2 hover:text-foreground"
                                >
                                    Unsplash
                                </a>
                            </p>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
