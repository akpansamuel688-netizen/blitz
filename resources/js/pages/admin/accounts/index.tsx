import { Head, Link, router } from '@inertiajs/react';
import { Search, Wallet } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { formatCurrency, formatDateTime, maskAccountNumber } from '@/lib/money';
import admin from '@/routes/admin';

type AccountRow = {
    id: number;
    name: string;
    type: string;
    account_number: string;
    balance: string;
    currency: string;
    transactions_count: number;
    user: { id: number | null | undefined; name: string; email: string };
    created_at: string | null;
};

type PaginatedAccounts = {
    data: AccountRow[];
    links: Array<{ url: string | null; label: string; active: boolean }>;
    from: number | null;
    to: number | null;
    total: number;
};

type Props = {
    accounts: PaginatedAccounts;
    filters: { search: string; type: string };
    summary: {
        total: number;
        checking: number;
        savings: number;
        totalBalance: string;
    };
};

export default function AdminAccountsIndex({ accounts, filters, summary }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [type, setType] = useState(filters.type ?? '');

    function onFilter(event: FormEvent) {
        event.preventDefault();
        router.get(
            admin.accounts.index.url(),
            {
                search: search || undefined,
                type: type || undefined,
            },
            { preserveState: true, replace: true },
        );
    }

    return (
        <>
            <Head title="Admin · Accounts" />

            <div className="space-y-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">Accounts</h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Platform-wide checking and savings accounts.
                        </p>
                    </div>
                    <form onSubmit={onFilter} className="flex w-full flex-col gap-2 sm:flex-row lg:max-w-xl">
                        <div className="relative flex-1">
                            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search account, number, or owner"
                                className="pl-9"
                            />
                        </div>
                        <select
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                            className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                        >
                            <option value="">All types</option>
                            <option value="Checking">Checking</option>
                            <option value="Savings">Savings</option>
                        </select>
                        <Button type="submit" variant="secondary">
                            Filter
                        </Button>
                    </form>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <Card className="border shadow-sm">
                        <CardHeader className="pb-2">
                            <CardDescription>Total accounts</CardDescription>
                            <CardTitle className="text-2xl">{summary.total}</CardTitle>
                        </CardHeader>
                    </Card>
                    <Card className="border shadow-sm">
                        <CardHeader className="pb-2">
                            <CardDescription>Checking</CardDescription>
                            <CardTitle className="text-2xl">{summary.checking}</CardTitle>
                        </CardHeader>
                    </Card>
                    <Card className="border shadow-sm">
                        <CardHeader className="pb-2">
                            <CardDescription>Savings</CardDescription>
                            <CardTitle className="text-2xl">{summary.savings}</CardTitle>
                        </CardHeader>
                    </Card>
                    <Card className="border border-brand/20 bg-gradient-to-br from-brand-subtle to-card shadow-sm">
                        <CardHeader className="pb-2">
                            <CardDescription>Platform deposits</CardDescription>
                            <CardTitle className="text-2xl">{formatCurrency(summary.totalBalance)}</CardTitle>
                        </CardHeader>
                    </Card>
                </div>

                <Card className="border shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Wallet className="size-5 text-brand" />
                            Ledger
                        </CardTitle>
                        <CardDescription>
                            Showing {accounts.from ?? 0}–{accounts.to ?? 0} of {accounts.total}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[720px] text-sm">
                                <thead>
                                    <tr className="border-b border-border text-left text-xs text-muted-foreground">
                                        <th className="pb-3 font-medium">Account</th>
                                        <th className="pb-3 font-medium">Owner</th>
                                        <th className="pb-3 font-medium">Type</th>
                                        <th className="pb-3 font-medium">Txns</th>
                                        <th className="pb-3 font-medium">Opened</th>
                                        <th className="pb-3 text-right font-medium">Balance</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {accounts.data.map((item) => (
                                        <tr key={item.id}>
                                            <td className="py-3">
                                                <p className="font-medium">{item.name}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {maskAccountNumber(item.account_number)}
                                                </p>
                                            </td>
                                            <td className="py-3">
                                                {item.user.id ? (
                                                    <Link
                                                        href={admin.users.show(item.user.id)}
                                                        className="font-medium hover:text-brand"
                                                    >
                                                        {item.user.name}
                                                    </Link>
                                                ) : (
                                                    <span>{item.user.name}</span>
                                                )}
                                                <p className="text-xs text-muted-foreground">{item.user.email}</p>
                                            </td>
                                            <td className="py-3">
                                                <Badge variant="secondary">{item.type}</Badge>
                                            </td>
                                            <td className="py-3 text-muted-foreground">{item.transactions_count}</td>
                                            <td className="py-3 text-muted-foreground">
                                                {formatDateTime(item.created_at)}
                                            </td>
                                            <td className="py-3 text-right font-semibold tabular-nums">
                                                {formatCurrency(item.balance, item.currency)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {accounts.data.length === 0 && (
                            <p className="py-10 text-center text-sm text-muted-foreground">No accounts match filters.</p>
                        )}

                        {accounts.links.length > 3 && (
                            <div className="mt-6 flex flex-wrap gap-2">
                                {accounts.links.map((link, index) => (
                                    <Button
                                        key={`${link.label}-${index}`}
                                        size="sm"
                                        variant={link.active ? 'default' : 'outline'}
                                        disabled={!link.url}
                                        onClick={() => link.url && router.get(link.url)}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

AdminAccountsIndex.layout = {
    breadcrumbs: [
        { title: 'Admin', href: admin.dashboard() },
        { title: 'Accounts', href: admin.accounts.index() },
    ],
};
