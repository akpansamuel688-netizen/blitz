import { Form, Head, Link } from '@inertiajs/react';
import {
    ArrowDownLeft,
    ArrowLeft,
    ArrowUpRight,
    Shield,
    Wallet,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
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
        phone: string | null;
        is_admin: boolean;
        email_verified_at: string | null;
        created_at: string | null;
        accounts_count: number;
        total_balance: string;
        account_currency: string | null;
    };
    accounts: AccountRow[];
    transactions: DashboardTransaction[];
    currencies: string[];
};

export default function AdminUserShow({
    user,
    accounts,
    transactions,
    currencies,
}: Props) {
    return (
        <>
            <Head title={`Admin · ${user.name}`} />

            <div className="space-y-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="mb-2 -ml-2"
                            asChild
                        >
                            <Link href={admin.users.index()}>
                                <ArrowLeft className="size-4" />
                                Back to users
                            </Link>
                        </Button>
                        <div className="flex flex-wrap items-center gap-2">
                            <h1 className="text-2xl font-semibold tracking-tight">
                                {user.name}
                            </h1>
                            {user.is_admin ? (
                                <Badge className="gap-1">
                                    <Shield className="size-3" />
                                    Admin
                                </Badge>
                            ) : (
                                <Badge variant="secondary">Customer</Badge>
                            )}
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">
                            {user.email}
                        </p>
                    </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                    <Card className="border shadow-sm">
                        <CardHeader className="pb-2">
                            <CardDescription>Total balance</CardDescription>
                            <CardTitle className="text-2xl">
                                {user.account_currency
                                    ? formatCurrency(
                                          user.total_balance,
                                          user.account_currency,
                                      )
                                    : user.total_balance}
                            </CardTitle>
                        </CardHeader>
                    </Card>
                    <Card className="border shadow-sm">
                        <CardHeader className="pb-2">
                            <CardDescription>Accounts</CardDescription>
                            <CardTitle className="text-2xl">
                                {user.accounts_count}
                            </CardTitle>
                        </CardHeader>
                    </Card>
                    <Card className="border shadow-sm">
                        <CardHeader className="pb-2">
                            <CardDescription>Member since</CardDescription>
                            <CardTitle className="text-lg">
                                {formatDateTime(user.created_at)}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-xs text-muted-foreground">
                                Email{' '}
                                {user.email_verified_at
                                    ? 'verified'
                                    : 'not verified'}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {!user.is_admin && (
                    <Card className="border shadow-sm">
                        <CardHeader>
                            <CardTitle>Edit customer</CardTitle>
                            <CardDescription>
                                Update customer contact details, reset their
                                password, and manage account balances.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Form
                                action={`/admin/users/${user.id}`}
                                method="patch"
                                className="grid max-w-2xl gap-4 sm:grid-cols-2"
                            >
                                {({ processing, errors }) => (
                                    <>
                                        <div className="grid gap-2">
                                            <label
                                                htmlFor="name"
                                                className="text-sm font-medium"
                                            >
                                                Name
                                            </label>
                                            <Input
                                                id="name"
                                                name="name"
                                                defaultValue={user.name}
                                                required
                                            />
                                            <p className="text-xs text-destructive">
                                                {errors.name}
                                            </p>
                                        </div>
                                        <div className="grid gap-2">
                                            <label
                                                htmlFor="email"
                                                className="text-sm font-medium"
                                            >
                                                Email address
                                            </label>
                                            <Input
                                                id="email"
                                                name="email"
                                                type="email"
                                                defaultValue={user.email}
                                                required
                                            />
                                            <p className="text-xs text-destructive">
                                                {errors.email}
                                            </p>
                                        </div>
                                        <div className="grid gap-2">
                                            <label
                                                htmlFor="phone"
                                                className="text-sm font-medium"
                                            >
                                                Phone number
                                            </label>
                                            <Input
                                                id="phone"
                                                name="phone"
                                                type="tel"
                                                defaultValue={user.phone ?? ''}
                                            />
                                            <p className="text-xs text-destructive">
                                                {errors.phone}
                                            </p>
                                        </div>
                                        <div className="grid gap-2">
                                            <label
                                                htmlFor="password"
                                                className="text-sm font-medium"
                                            >
                                                New password
                                            </label>
                                            <Input
                                                id="password"
                                                name="password"
                                                type="password"
                                                autoComplete="new-password"
                                                placeholder="Leave blank to keep current password"
                                            />
                                            <p className="text-xs text-muted-foreground">
                                                Existing passwords are securely
                                                hashed and cannot be revealed.
                                            </p>
                                            <p className="text-xs text-destructive">
                                                {errors.password}
                                            </p>
                                        </div>
                                        <div className="grid gap-2 sm:col-span-2">
                                            <label
                                                htmlFor="password_confirmation"
                                                className="text-sm font-medium"
                                            >
                                                Confirm new password
                                            </label>
                                            <Input
                                                id="password_confirmation"
                                                name="password_confirmation"
                                                type="password"
                                                autoComplete="new-password"
                                            />
                                        </div>
                                        <div className="sm:col-span-2">
                                            <Button disabled={processing}>
                                                {processing
                                                    ? 'Saving...'
                                                    : 'Save customer changes'}
                                            </Button>
                                        </div>
                                    </>
                                )}
                            </Form>
                        </CardContent>
                    </Card>
                )}

                {!user.is_admin && (
                    <Card className="border border-blue-500/20 shadow-sm">
                        <CardHeader>
                            <CardTitle>Customer currency</CardTitle>
                            <CardDescription>
                                Convert every customer account and related
                                financial amount using the current reference
                                exchange rate.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Form
                                action={`/admin/users/${user.id}/currency`}
                                method="patch"
                                className="grid max-w-2xl gap-4 sm:grid-cols-[1fr_auto] sm:items-end"
                                onSubmit={(event) => {
                                    const currency = new FormData(
                                        event.currentTarget,
                                    ).get('currency');
                                    if (
                                        !window.confirm(
                                            `Convert all of ${user.name}'s balances and financial records from ${user.account_currency ?? 'their current currency'} to ${currency}? This uses the current reference rate and cannot be automatically undone.`,
                                        )
                                    ) {
                                        event.preventDefault();
                                    }
                                }}
                            >
                                {({ processing, errors }) => (
                                    <>
                                        <div className="grid gap-2">
                                            <label
                                                htmlFor="currency"
                                                className="text-sm font-medium"
                                            >
                                                Account and dashboard currency
                                            </label>
                                            <select
                                                id="currency"
                                                name="currency"
                                                defaultValue={
                                                    user.account_currency ?? ''
                                                }
                                                className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                                                required
                                            >
                                                {currencies.map((currency) => (
                                                    <option
                                                        key={currency}
                                                        value={currency}
                                                    >
                                                        {currency}
                                                    </option>
                                                ))}
                                            </select>
                                            <p className="text-xs text-muted-foreground">
                                                Current currency:{' '}
                                                {user.account_currency ??
                                                    'Mixed currencies'}
                                                . Balances, transactions,
                                                transfers, fees, bills, budgets,
                                                savings goals, and recurring
                                                transfers will be converted
                                                together.
                                            </p>
                                            <p className="text-xs text-destructive">
                                                {errors.currency}
                                            </p>
                                        </div>
                                        <Button
                                            type="submit"
                                            disabled={
                                                processing ||
                                                !user.account_currency
                                            }
                                        >
                                            {processing
                                                ? 'Converting…'
                                                : 'Convert currency'}
                                        </Button>
                                    </>
                                )}
                            </Form>
                        </CardContent>
                    </Card>
                )}

                <Card className="border shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Wallet className="size-5 text-brand" />
                            Accounts
                        </CardTitle>
                        <CardDescription>
                            All banking accounts owned by this user.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {accounts.length === 0 ? (
                            <p className="py-8 text-center text-sm text-muted-foreground">
                                No accounts.
                            </p>
                        ) : (
                            accounts.map((item) => (
                                <div
                                    key={item.id}
                                    className="flex flex-col gap-2 rounded-xl border border-border p-4 sm:flex-row sm:items-center sm:justify-between"
                                >
                                    <div>
                                        <div className="flex flex-wrap items-center gap-2">
                                            <p className="font-semibold">
                                                {item.name}
                                            </p>
                                            <Badge variant="secondary">
                                                {item.type}
                                            </Badge>
                                        </div>
                                        <p className="mt-1 text-sm text-muted-foreground">
                                            {maskAccountNumber(
                                                item.account_number,
                                            )}{' '}
                                            · Opened{' '}
                                            {formatDateTime(item.created_at)}
                                        </p>
                                    </div>
                                    {user.is_admin ? (
                                        <p className="text-lg font-semibold tabular-nums">
                                            {formatCurrency(
                                                item.balance,
                                                item.currency,
                                            )}
                                        </p>
                                    ) : (
                                        <Form
                                            action={`/admin/users/${user.id}/accounts/${item.id}/balance`}
                                            method="patch"
                                            className="flex items-end gap-2"
                                        >
                                            {({ processing, errors }) => (
                                                <>
                                                    <div className="grid gap-1">
                                                        <label
                                                            htmlFor={`balance-${item.id}`}
                                                            className="text-xs text-muted-foreground"
                                                        >
                                                            Balance (
                                                            {item.currency})
                                                        </label>
                                                        <Input
                                                            id={`balance-${item.id}`}
                                                            name="balance"
                                                            type="number"
                                                            step="0.01"
                                                            min="0"
                                                            defaultValue={
                                                                item.balance
                                                            }
                                                            className="w-36"
                                                            required
                                                        />
                                                        <p className="text-xs text-destructive">
                                                            {errors.balance}
                                                        </p>
                                                    </div>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        disabled={processing}
                                                    >
                                                        Save balance
                                                    </Button>
                                                </>
                                            )}
                                        </Form>
                                    )}
                                </div>
                            ))
                        )}
                    </CardContent>
                </Card>

                <Card className="border shadow-sm">
                    <CardHeader>
                        <CardTitle>Recent transactions</CardTitle>
                        <CardDescription>
                            Latest activity for this customer.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {transactions.length === 0 ? (
                            <p className="py-8 text-center text-sm text-muted-foreground">
                                No transactions.
                            </p>
                        ) : (
                            <ul className="divide-y divide-border">
                                {transactions.map((tx) => {
                                    const isCredit =
                                        tx.transaction_type === 'Credit';

                                    return (
                                        <li
                                            key={tx.id}
                                            className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
                                        >
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
                                                    {tx.description ||
                                                        tx.transaction_type}
                                                </p>
                                                <p className="truncate text-xs text-muted-foreground">
                                                    {tx.account_name} ·{' '}
                                                    {formatDateTime(
                                                        tx.created_at,
                                                    )}
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
                                                {formatCurrency(
                                                    tx.amount,
                                                    tx.currency,
                                                )}
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
