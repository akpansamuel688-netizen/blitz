import { Head, Link } from '@inertiajs/react';
import {
    ArrowDownLeft,
    ArrowRight,
    ArrowUpRight,
    Building2,
    Landmark,
    ListChecks,
    Shield,
    UserPlus,
    Users,
    Wallet,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type {
    AdminAccountRow,
    AdminStats,
    AdminTransactionRow,
    AdminUserRow,
} from '@/lib/dashboard';
import { formatCurrency, formatDateTime } from '@/lib/money';
import { cn } from '@/lib/utils';
import admin from '@/routes/admin';
import { dashboard } from '@/routes';

type Props = {
    stats: AdminStats;
    recentUsers: AdminUserRow[];
    recentTransactions: AdminTransactionRow[];
    topAccounts: AdminAccountRow[];
    accountsByType: {
        Checking: number;
        Savings: number;
    };
};

export default function AdminDashboard({
    stats,
    recentUsers,
    recentTransactions,
    topAccounts,
    accountsByType,
}: Props) {
    const typeTotal = accountsByType.Checking + accountsByType.Savings || 1;

    return (
        <>
            <Head title="Admin · Console" />

            <div className="space-y-8">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <div className="inline-flex items-center gap-2 rounded-full border border-brand/20 bg-brand-subtle px-3 py-1 text-xs font-medium text-brand">
                            <Shield className="size-3.5" />
                            Administrator
                        </div>
                        <h1 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
                            Platform console
                        </h1>
                        <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
                            Monitor customers, accounts, and money movement across NovaTrust Bank.
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Button asChild>
                            <Link href="/admin/users/create">
                                <UserPlus className="size-4" />
                                New customer
                            </Link>
                        </Button>
                        <Button variant="outline" asChild>
                            <Link href={admin.users.index()}>
                                <Users className="size-4" />
                                All users
                            </Link>
                        </Button>
                        <Button asChild>
                            <Link href={admin.accounts.index()}>
                                <Wallet className="size-4" />
                                All accounts
                            </Link>
                        </Button>
                        <Button variant="outline" asChild>
                            <Link href="/admin/transfers">
                                <ListChecks className="size-4" />
                                Transfer ledger
                            </Link>
                        </Button>
                    </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <Card className="border shadow-sm">
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                                <CardDescription>Customers</CardDescription>
                                <Users className="size-4 text-brand" />
                            </div>
                            <CardTitle className="text-3xl font-semibold">{stats.userCount}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-xs text-muted-foreground">
                                +{stats.newUsersWeek} this week · {stats.adminCount} admin
                                {stats.adminCount === 1 ? '' : 's'}
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border shadow-sm">
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                                <CardDescription>Accounts</CardDescription>
                                <Landmark className="size-4 text-brand" />
                            </div>
                            <CardTitle className="text-3xl font-semibold">{stats.accountCount}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-xs text-muted-foreground">
                                +{stats.newAccountsWeek} opened this week
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border border-brand/20 bg-gradient-to-br from-brand-subtle to-card shadow-sm">
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                                <CardDescription>Total deposits</CardDescription>
                                <Wallet className="size-4 text-brand" />
                            </div>
                            <CardTitle className="text-3xl font-semibold tracking-tight">
                                {formatCurrency(stats.totalDeposits)}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-xs text-muted-foreground">Sum of all account balances</p>
                        </CardContent>
                    </Card>

                    <Card className="border shadow-sm">
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                                <CardDescription>Transactions</CardDescription>
                                <ListChecks className="size-4 text-brand" />
                            </div>
                            <CardTitle className="text-3xl font-semibold">{stats.transactionCount}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-xs text-muted-foreground">
                                {stats.transactionsWeek} this week · {formatCurrency(stats.volumeWeek)} volume
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    <Card className="border shadow-sm">
                        <CardHeader className="pb-2">
                            <CardDescription>Credits · 30 days</CardDescription>
                            <CardTitle className="text-2xl text-emerald-700 dark:text-emerald-400">
                                {formatCurrency(stats.creditsMonth)}
                            </CardTitle>
                        </CardHeader>
                    </Card>
                    <Card className="border shadow-sm">
                        <CardHeader className="pb-2">
                            <CardDescription>Debits · 30 days</CardDescription>
                            <CardTitle className="text-2xl text-rose-700 dark:text-rose-400">
                                {formatCurrency(stats.debitsMonth)}
                            </CardTitle>
                        </CardHeader>
                    </Card>
                    <Card className="border shadow-sm">
                        <CardHeader className="pb-2">
                            <CardDescription>Account mix</CardDescription>
                            <CardTitle className="text-2xl">
                                {accountsByType.Checking} / {accountsByType.Savings}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div className="flex h-2 overflow-hidden rounded-full bg-muted">
                                <div
                                    className="bg-brand"
                                    style={{ width: `${(accountsByType.Checking / typeTotal) * 100}%` }}
                                />
                                <div
                                    className="bg-brand/40"
                                    style={{ width: `${(accountsByType.Savings / typeTotal) * 100}%` }}
                                />
                            </div>
                            <div className="flex justify-between text-xs text-muted-foreground">
                                <span>Checking</span>
                                <span>Savings</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-6 xl:grid-cols-2">
                    <Card className="border shadow-sm">
                        <CardHeader className="flex flex-row items-start justify-between space-y-0">
                            <div>
                                <CardTitle>Recent customers</CardTitle>
                                <CardDescription>Newest accounts on the platform.</CardDescription>
                            </div>
                            <Button variant="ghost" size="sm" asChild>
                                <Link href={admin.users.index()}>
                                    View all
                                    <ArrowRight className="size-4" />
                                </Link>
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-border text-left text-xs text-muted-foreground">
                                            <th className="pb-2 font-medium">Customer</th>
                                            <th className="pb-2 font-medium">Accounts</th>
                                            <th className="pb-2 text-right font-medium">Balance</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {recentUsers.map((user) => (
                                            <tr key={user.id} className="group">
                                                <td className="py-3">
                                                    <Link
                                                        href={admin.users.show(user.id)}
                                                        className="font-medium group-hover:text-brand"
                                                    >
                                                        {user.name}
                                                    </Link>
                                                    <p className="text-xs text-muted-foreground">{user.email}</p>
                                                    {user.is_admin && (
                                                        <Badge variant="secondary" className="mt-1">
                                                            Admin
                                                        </Badge>
                                                    )}
                                                </td>
                                                <td className="py-3 text-muted-foreground">{user.accounts_count}</td>
                                                <td className="py-3 text-right font-semibold tabular-nums">
                                                    {formatCurrency(user.total_balance)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border shadow-sm">
                        <CardHeader className="flex flex-row items-start justify-between space-y-0">
                            <div>
                                <CardTitle>Top accounts</CardTitle>
                                <CardDescription>Highest balances at NovaTrust Bank.</CardDescription>
                            </div>
                            <Button variant="ghost" size="sm" asChild>
                                <Link href={admin.accounts.index()}>
                                    View all
                                    <ArrowRight className="size-4" />
                                </Link>
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {topAccounts.length === 0 ? (
                                <p className="py-8 text-center text-sm text-muted-foreground">No accounts yet.</p>
                            ) : (
                                topAccounts.map((item, index) => (
                                    <div
                                        key={item.id}
                                        className="flex items-center gap-3 rounded-xl border border-border px-3 py-3"
                                    >
                                        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-xs font-semibold text-muted-foreground">
                                            {index + 1}
                                        </span>
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate font-medium">{item.name}</p>
                                            <p className="truncate text-xs text-muted-foreground">
                                                {item.user_name} · {item.type}
                                            </p>
                                        </div>
                                        <p className="shrink-0 font-semibold tabular-nums">
                                            {formatCurrency(item.balance, item.currency)}
                                        </p>
                                    </div>
                                ))
                            )}
                        </CardContent>
                    </Card>
                </div>

                <Card className="border shadow-sm">
                    <CardHeader>
                        <CardTitle>Latest platform transactions</CardTitle>
                        <CardDescription>Activity across all customer accounts.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {recentTransactions.length === 0 ? (
                            <p className="py-8 text-center text-sm text-muted-foreground">No transactions yet.</p>
                        ) : (
                            <ul className="divide-y divide-border">
                                {recentTransactions.map((tx) => {
                                    const isCredit = tx.transaction_type === 'Credit';

                                    return (
                                        <li key={tx.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                                            <span
                                                className={cn(
                                                    'flex size-9 shrink-0 items-center justify-center rounded-full',
                                                    isCredit
                                                        ? 'bg-emerald-500/10 text-emerald-600'
                                                        : 'bg-rose-500/10 text-rose-600',
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
                                                    {tx.user_name} · {tx.account_name} · {formatDateTime(tx.created_at)}
                                                </p>
                                            </div>
                                            <p
                                                className={cn(
                                                    'shrink-0 text-sm font-semibold tabular-nums',
                                                    isCredit ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400',
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

                <Card className="border border-dashed border-border bg-muted/20">
                    <CardContent className="flex flex-col items-start gap-3 py-6 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-start gap-3">
                            <Building2 className="mt-0.5 size-5 text-brand" />
                            <div>
                                <p className="font-medium">Customer banking workspace</p>
                                <p className="text-sm text-muted-foreground">
                                    Jump back to your personal accounts and transfers.
                                </p>
                            </div>
                        </div>
                        <Button variant="outline" asChild>
                            <Link href={dashboard()}>My banking dashboard</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

AdminDashboard.layout = {
    breadcrumbs: [
        { title: 'Admin', href: admin.dashboard() },
        { title: 'Console', href: admin.dashboard() },
    ],
};
