import { Head, Link } from '@inertiajs/react';
import {
    ArrowDownLeft,
    ArrowRight,
    ArrowUpRight,
    ListChecks,
    Plus,
    Sparkles,
    TrendingDown,
    TrendingUp,
    Wallet,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { ActivityDay, DashboardAccount, DashboardTransaction, UserDashboardStats } from '@/lib/dashboard';
import { formatCurrency, formatDateTime, maskAccountNumber } from '@/lib/money';
import { cn } from '@/lib/utils';
import accounts from '@/routes/accounts';
import { dashboard } from '@/routes';
import transactions from '@/routes/transactions';

type Props = {
    accounts: DashboardAccount[];
    stats: UserDashboardStats;
    recentTransactions: DashboardTransaction[];
    activityByDay: ActivityDay[];
    userName: string;
};

function greetingForHour(hour: number): string {
    if (hour < 12) {
        return 'Good morning';
    }
    if (hour < 17) {
        return 'Good afternoon';
    }
    return 'Good evening';
}

export default function Dashboard({
    accounts: userAccounts,
    stats,
    recentTransactions,
    activityByDay,
    userName,
}: Props) {
    const firstName = userName.split(' ')[0] || userName;
    const greeting = greetingForHour(new Date().getHours());
    const maxBar = Math.max(
        ...activityByDay.flatMap((day) => [Number(day.credits), Number(day.debits), 1]),
    );

    return (
        <>
            <Head title="Dashboard" />

            <div className="space-y-8">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="text-sm font-medium text-brand">{greeting}</p>
                        <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
                            {firstName}, here’s your money at a glance
                        </h1>
                        <p className="mt-2 max-w-xl text-sm text-muted-foreground sm:text-base">
                            Balances, recent movement, and the accounts that fund your work and life.
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Button variant="outline" asChild>
                            <Link href={accounts.index()}>
                                <Plus className="size-4" />
                                New account
                            </Link>
                        </Button>
                        <Button asChild>
                            <Link href={transactions.index()}>
                                <ListChecks className="size-4" />
                                Transactions
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* KPI strip */}
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    <Card className="relative overflow-hidden border-brand/20 bg-gradient-to-br from-brand-subtle to-card shadow-sm">
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                                <CardDescription>Net worth</CardDescription>
                                <span className="flex size-9 items-center justify-center rounded-lg bg-brand text-brand-foreground">
                                    <Wallet className="size-4" />
                                </span>
                            </div>
                            <CardTitle className="text-3xl font-semibold tracking-tight">
                                {formatCurrency(stats.totalBalance)}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-xs text-muted-foreground">
                                Across {stats.accountCount} account{stats.accountCount === 1 ? '' : 's'}
                            </p>
                        </CardContent>
                    </Card>

                    <Link href={transactions.index({ query: { type: 'Credit' } })} className="block">
                    <Card className="border shadow-sm transition-all hover:border-emerald-500/50 hover:shadow-md">
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                                <CardDescription>Money in · all time</CardDescription>
                                <span className="flex size-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                                    <TrendingUp className="size-4" />
                                </span>
                            </div>
                            <CardTitle className="text-3xl font-semibold tracking-tight text-emerald-700 dark:text-emerald-400">
                                {formatCurrency(stats.moneyIn)}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-xs text-muted-foreground">Credits into your accounts · Review history</p>
                        </CardContent>
                    </Card>
                    </Link>

                    <Link href={transactions.index({ query: { type: 'Debit' } })} className="block">
                    <Card className="border shadow-sm transition-all hover:border-rose-500/50 hover:shadow-md">
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                                <CardDescription>Money out · all time</CardDescription>
                                <span className="flex size-9 items-center justify-center rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400">
                                    <TrendingDown className="size-4" />
                                </span>
                            </div>
                            <CardTitle className="text-3xl font-semibold tracking-tight text-rose-700 dark:text-rose-400">
                                {formatCurrency(stats.moneyOut)}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-xs text-muted-foreground">Debits from your accounts · Review history</p>
                        </CardContent>
                    </Card>
                    </Link>

                </div>

                <div className="grid gap-6 xl:grid-cols-5">
                    {/* Accounts */}
                    <Card className="border shadow-sm xl:col-span-3">
                        <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
                            <div>
                                <CardTitle>Your accounts</CardTitle>
                                <CardDescription>Checking and savings that make up your net worth.</CardDescription>
                            </div>
                            <Button variant="ghost" size="sm" asChild>
                                <Link href={accounts.index()}>
                                    View all
                                    <ArrowRight className="size-4" />
                                </Link>
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {userAccounts.length === 0 ? (
                                <div className="rounded-2xl border border-dashed border-border bg-muted/40 px-6 py-12 text-center">
                                    <Sparkles className="mx-auto size-8 text-brand" />
                                    <p className="mt-3 font-medium">No accounts yet</p>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        Open a checking or savings account to start tracking balances.
                                    </p>
                                    <Button className="mt-5" asChild>
                                        <Link href={accounts.index()}>
                                            <Plus className="size-4" />
                                            Create account
                                        </Link>
                                    </Button>
                                </div>
                            ) : (
                                userAccounts.map((item) => (
                                    <Link
                                        key={item.id}
                                        href={accounts.show(item.id)}
                                        className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-4 transition-all hover:border-brand/40 hover:shadow-md hover:shadow-brand/5"
                                    >
                                        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand">
                                            <Wallet className="size-5" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <p className="truncate font-semibold">{item.name}</p>
                                                <Badge variant="secondary" className="font-normal">
                                                    {item.type}
                                                </Badge>
                                            </div>
                                            <p className="mt-0.5 text-sm text-muted-foreground">
                                                {maskAccountNumber(item.account_number)}
                                            </p>
                                            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
                                                <div
                                                    className="h-full rounded-full bg-brand transition-all"
                                                    style={{ width: `${Math.min(item.share, 100)}%` }}
                                                />
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-lg font-semibold tracking-tight">
                                                {formatCurrency(item.balance, item.currency)}
                                            </p>
                                            <p className="text-xs text-muted-foreground">{item.share}% of total</p>
                                        </div>
                                    </Link>
                                ))
                            )}

                            {userAccounts.length > 0 && (
                                <div className="grid gap-3 pt-2 sm:grid-cols-2">
                                    <div className="rounded-xl border border-border bg-muted/30 px-4 py-3">
                                        <p className="text-xs text-muted-foreground">Checking</p>
                                        <p className="mt-1 text-lg font-semibold">
                                            {formatCurrency(stats.checkingBalance)}
                                        </p>
                                    </div>
                                    <div className="rounded-xl border border-border bg-muted/30 px-4 py-3">
                                        <p className="text-xs text-muted-foreground">Savings</p>
                                        <p className="mt-1 text-lg font-semibold">
                                            {formatCurrency(stats.savingsBalance)}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Activity chart */}
                    <Card className="border shadow-sm xl:col-span-2">
                        <CardHeader>
                            <CardTitle>7-day activity</CardTitle>
                            <CardDescription>Credits vs debits across your accounts.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex h-48 items-end justify-between gap-2">
                                {activityByDay.map((day) => {
                                    const creditH = (Number(day.credits) / maxBar) * 100;
                                    const debitH = (Number(day.debits) / maxBar) * 100;

                                    return (
                                        <div key={day.date} className="flex flex-1 flex-col items-center gap-2">
                                            <div className="flex h-36 w-full items-end justify-center gap-1">
                                                <div
                                                    className="w-2.5 rounded-t-sm bg-emerald-500/80 sm:w-3"
                                                    style={{ height: `${Math.max(creditH, day.count ? 4 : 0)}%` }}
                                                    title={`In ${formatCurrency(day.credits)}`}
                                                />
                                                <div
                                                    className="w-2.5 rounded-t-sm bg-rose-400/80 sm:w-3"
                                                    style={{ height: `${Math.max(debitH, day.count ? 4 : 0)}%` }}
                                                    title={`Out ${formatCurrency(day.debits)}`}
                                                />
                                            </div>
                                            <span className="text-[11px] font-medium text-muted-foreground">
                                                {day.label}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="mt-4 flex items-center justify-center gap-4 text-xs text-muted-foreground">
                                <span className="inline-flex items-center gap-1.5">
                                    <span className="size-2 rounded-full bg-emerald-500" /> In
                                </span>
                                <span className="inline-flex items-center gap-1.5">
                                    <span className="size-2 rounded-full bg-rose-400" /> Out
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Recent transactions + quick actions */}
                <div>
                    <Card className="border shadow-sm">
                        <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
                            <div>
                                <CardTitle>Recent transactions</CardTitle>
                                <CardDescription>Latest credits and debits across all accounts.</CardDescription>
                            </div>
                            <Button variant="ghost" size="sm" asChild>
                                <Link href={transactions.index()}>
                                    Full history
                                    <ArrowRight className="size-4" />
                                </Link>
                            </Button>
                        </CardHeader>
                        <CardContent>
                            {recentTransactions.length === 0 ? (
                                <div className="rounded-xl border border-dashed border-border px-4 py-10 text-center text-sm text-muted-foreground">
                                    No transactions yet. Transfers and deposits will show up here.
                                </div>
                            ) : (
                                <ul className="divide-y divide-border">
                                    {recentTransactions.map((tx) => {
                                        const isCredit = tx.transaction_type === 'Credit';

                                        return (
                                            <li
                                                key={tx.id}
                                                className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
                                            >
                                                <span
                                                    className={cn(
                                                        'flex size-9 shrink-0 items-center justify-center rounded-full',
                                                        isCredit
                                                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                                            : 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
                                                    )}
                                                >
                                                    {isCredit ? (
                                                        <ArrowDownLeft className="size-4" />
                                                    ) : (
                                                        <ArrowUpRight className="size-4" />
                                                    )}
                                                </span>
                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate font-medium">
                                                        {tx.description || tx.transaction_type}
                                                    </p>
                                                    <p className="truncate text-xs text-muted-foreground">
                                                        {tx.account_name} · {formatDateTime(tx.created_at)}
                                                    </p>
                                                </div>
                                                <p
                                                    className={cn(
                                                        'shrink-0 text-sm font-semibold tabular-nums',
                                                        isCredit
                                                            ? 'text-emerald-700 dark:text-emerald-400'
                                                            : 'text-rose-700 dark:text-rose-400',
                                                    )}
                                                >
                                                    {isCredit ? '+' : '−'}
                                                    {formatCurrency(tx.amount, tx.currency)}
                                                </p>
                                            </li>
                                        );
                                    })}
                                </ul>
                            )}
                        </CardContent>
                    </Card>

                </div>
            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
    ],
};
