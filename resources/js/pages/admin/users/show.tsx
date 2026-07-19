import { Head, Link } from '@inertiajs/react';
import { ArrowDownLeft, ArrowLeft, ArrowUpRight, Shield, Wallet } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { DashboardTransaction } from '@/lib/dashboard';
import { formatCurrency, formatDateTime, maskAccountNumber } from '@/lib/money';
import { cn } from '@/lib/utils';
import admin from '@/routes/admin';

type AccountRow = {
    id: number;
    name: string;
    type: string;
    account_number: string;
    balance: string;
    currency: string;
    created_at: string | null;
};

type Props = {
    user: {
        id: number;
        name: string;
        email: string;
        is_admin: boolean;
        email_verified_at: string | null;
        created_at: string | null;
        accounts_count: number;
        total_balance: string;
    };
    accounts: AccountRow[];
    transactions: DashboardTransaction[];
};

export default function AdminUserShow({ user, accounts, transactions }: Props) {
    return (
        <>
            <Head title={`Admin · ${user.name}`} />

            <div className="space-y-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <Button variant="ghost" size="sm" className="-ml-2 mb-2" asChild>
                            <Link href={admin.users.index()}>
                                <ArrowLeft className="size-4" />
                                Back to users
                            </Link>
                        </Button>
                        <div className="flex flex-wrap items-center gap-2">
                            <h1 className="text-2xl font-semibold tracking-tight">{user.name}</h1>
                            {user.is_admin ? (
                                <Badge className="gap-1">
                                    <Shield className="size-3" />
                                    Admin
                                </Badge>
                            ) : (
                                <Badge variant="secondary">Customer</Badge>
                            )}
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">{user.email}</p>
                    </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                    <Card className="border shadow-sm">
                        <CardHeader className="pb-2">
                            <CardDescription>Total balance</CardDescription>
                            <CardTitle className="text-2xl">{formatCurrency(user.total_balance)}</CardTitle>
                        </CardHeader>
                    </Card>
                    <Card className="border shadow-sm">
                        <CardHeader className="pb-2">
                            <CardDescription>Accounts</CardDescription>
                            <CardTitle className="text-2xl">{user.accounts_count}</CardTitle>
                        </CardHeader>
                    </Card>
                    <Card className="border shadow-sm">
                        <CardHeader className="pb-2">
                            <CardDescription>Member since</CardDescription>
                            <CardTitle className="text-lg">{formatDateTime(user.created_at)}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-xs text-muted-foreground">
                                Email {user.email_verified_at ? 'verified' : 'not verified'}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <Card className="border shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Wallet className="size-5 text-brand" />
                            Accounts
                        </CardTitle>
                        <CardDescription>All banking accounts owned by this user.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {accounts.length === 0 ? (
                            <p className="py-8 text-center text-sm text-muted-foreground">No accounts.</p>
                        ) : (
                            accounts.map((item) => (
                                <div
                                    key={item.id}
                                    className="flex flex-col gap-2 rounded-xl border border-border p-4 sm:flex-row sm:items-center sm:justify-between"
                                >
                                    <div>
                                        <div className="flex flex-wrap items-center gap-2">
                                            <p className="font-semibold">{item.name}</p>
                                            <Badge variant="secondary">{item.type}</Badge>
                                        </div>
                                        <p className="mt-1 text-sm text-muted-foreground">
                                            {maskAccountNumber(item.account_number)} · Opened{' '}
                                            {formatDateTime(item.created_at)}
                                        </p>
                                    </div>
                                    <p className="text-lg font-semibold tabular-nums">
                                        {formatCurrency(item.balance, item.currency)}
                                    </p>
                                </div>
                            ))
                        )}
                    </CardContent>
                </Card>

                <Card className="border shadow-sm">
                    <CardHeader>
                        <CardTitle>Recent transactions</CardTitle>
                        <CardDescription>Latest activity for this customer.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {transactions.length === 0 ? (
                            <p className="py-8 text-center text-sm text-muted-foreground">No transactions.</p>
                        ) : (
                            <ul className="divide-y divide-border">
                                {transactions.map((tx) => {
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
        </>
    );
}

AdminUserShow.layout = {
    breadcrumbs: [
        { title: 'Admin', href: admin.dashboard() },
        { title: 'Users', href: admin.users.index() },
        { title: 'Profile', href: '#' },
    ],
};
