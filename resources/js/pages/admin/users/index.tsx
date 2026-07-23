import { Form, Head, Link, router } from '@inertiajs/react';
import { Search, Shield, Users } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import type { AdminUserRow } from '@/lib/dashboard';
import { formatCurrency, formatDateTime } from '@/lib/money';
import admin from '@/routes/admin';

type PaginatedUsers = {
    data: AdminUserRow[];
    links: Array<{ url: string | null; label: string; active: boolean }>;
    from: number | null;
    to: number | null;
    total: number;
};

type Props = {
    users: PaginatedUsers;
    filters: { search: string };
    summary: { total: number; admins: number; customers: number };
};

export default function AdminUsersIndex({ users, filters, summary }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');

    function onSearch(event: FormEvent) {
        event.preventDefault();
        router.get(
            admin.users.index.url(),
            { search: search || undefined },
            { preserveState: true, replace: true },
        );
    }

    return (
        <>
            <Head title="Admin · Users" />

            <div className="space-y-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">Users</h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Customers and administrators on the Blitz platform.
                        </p>
                    </div>
                    <div className="flex w-full max-w-xl flex-col gap-2 sm:flex-row sm:items-center">
                    <Button asChild><Link href="/admin/users/create">New customer</Link></Button>
                    <form onSubmit={onSearch} className="flex flex-1 gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search name or email"
                                className="pl-9"
                            />
                        </div>
                        <Button type="submit" variant="secondary">
                            Search
                        </Button>
                    </form>
                    </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                    <Card className="border shadow-sm">
                        <CardHeader className="pb-2">
                            <CardDescription>Total users</CardDescription>
                            <CardTitle className="text-2xl">{summary.total}</CardTitle>
                        </CardHeader>
                    </Card>
                    <Card className="border shadow-sm">
                        <CardHeader className="pb-2">
                            <CardDescription>Customers</CardDescription>
                            <CardTitle className="text-2xl">{summary.customers}</CardTitle>
                        </CardHeader>
                    </Card>
                    <Card className="border shadow-sm">
                        <CardHeader className="pb-2">
                            <CardDescription>Admins</CardDescription>
                            <CardTitle className="text-2xl">{summary.admins}</CardTitle>
                        </CardHeader>
                    </Card>
                </div>

                <Card className="border shadow-sm">
                    <CardHeader>
                        <CardTitle>Create test users</CardTitle>
                        <CardDescription>
                            Create 1–100 customer-only test accounts. Emails are generated as prefix-number@domain.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form action="/admin/users/test-users" method="post" className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                            {({ processing, errors }) => <>
                                <div className="grid gap-2">
                                    <label htmlFor="name_prefix" className="text-sm font-medium">Name prefix</label>
                                    <Input id="name_prefix" name="name_prefix" defaultValue="Test User" required />
                                    <p className="text-xs text-destructive">{errors.name_prefix}</p>
                                </div>
                                <div className="grid gap-2">
                                    <label htmlFor="email_prefix" className="text-sm font-medium">Email prefix</label>
                                    <Input id="email_prefix" name="email_prefix" defaultValue="test-user" required />
                                    <p className="text-xs text-destructive">{errors.email_prefix}</p>
                                </div>
                                <div className="grid gap-2">
                                    <label htmlFor="email_domain" className="text-sm font-medium">Email domain</label>
                                    <Input id="email_domain" name="email_domain" defaultValue="example.test" required />
                                    <p className="text-xs text-destructive">{errors.email_domain}</p>
                                </div>
                                <div className="grid gap-2">
                                    <label htmlFor="password" className="text-sm font-medium">Password</label>
                                    <Input id="password" name="password" type="password" defaultValue="password" minLength={8} required />
                                    <p className="text-xs text-destructive">{errors.password}</p>
                                </div>
                                <div className="grid gap-2">
                                    <label htmlFor="count" className="text-sm font-medium">Quantity</label>
                                    <div className="flex gap-2">
                                        <Input id="count" name="count" type="number" min="1" max="100" defaultValue="5" required />
                                        <Button disabled={processing}>Create</Button>
                                    </div>
                                    <p className="text-xs text-destructive">{errors.count}</p>
                                </div>
                            </>}
                        </Form>
                    </CardContent>
                </Card>

                <Card className="border shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="size-5 text-brand" />
                            Directory
                        </CardTitle>
                        <CardDescription>
                            Showing {users.from ?? 0}–{users.to ?? 0} of {users.total}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[640px] text-sm">
                                <thead>
                                    <tr className="border-b border-border text-left text-xs text-muted-foreground">
                                        <th className="pb-3 font-medium">User</th>
                                        <th className="pb-3 font-medium">Role</th>
                                        <th className="pb-3 font-medium">Accounts</th>
                                        <th className="pb-3 font-medium">Balance</th>
                                        <th className="pb-3 font-medium">Joined</th>
                                        <th className="pb-3 text-right font-medium"> </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {users.data.map((user) => (
                                        <tr key={user.id}>
                                            <td className="py-3">
                                                <p className="font-medium">{user.name}</p>
                                                <p className="text-xs text-muted-foreground">{user.email}</p>
                                            </td>
                                            <td className="py-3">
                                                {user.is_admin ? (
                                                    <Badge className="gap-1">
                                                        <Shield className="size-3" />
                                                        Admin
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="secondary">Customer</Badge>
                                                )}
                                            </td>
                                            <td className="py-3 text-muted-foreground">{user.accounts_count}</td>
                                            <td className="py-3 font-semibold tabular-nums">
                                                {formatCurrency(user.total_balance)}
                                            </td>
                                            <td className="py-3 text-muted-foreground">
                                                {formatDateTime(user.created_at)}
                                            </td>
                                            <td className="py-3 text-right">
                                                <div className="flex justify-end gap-1">
                                                    <Button variant="ghost" size="sm" asChild>
                                                        <Link href={admin.users.show(user.id)}>View</Link>
                                                    </Button>
                                                    {!user.is_admin && (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="text-destructive hover:text-destructive"
                                                            onClick={() => {
                                                                if (window.confirm(`Delete ${user.name}? This also removes their accounts and related banking data.`)) {
                                                                    router.delete(`/admin/users/${user.id}`);
                                                                }
                                                            }}
                                                        >
                                                            Delete
                                                        </Button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {users.data.length === 0 && (
                            <p className="py-10 text-center text-sm text-muted-foreground">No users match your search.</p>
                        )}

                        {users.links.length > 3 && (
                            <div className="mt-6 flex flex-wrap gap-2">
                                {users.links.map((link, index) => (
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

AdminUsersIndex.layout = {
    breadcrumbs: [
        { title: 'Admin', href: admin.dashboard() },
        { title: 'Users', href: admin.users.index() },
    ],
};
