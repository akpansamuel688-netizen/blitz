import { Form, Head } from '@inertiajs/react';
import { PiggyBank, Plus } from 'lucide-react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatCurrency } from '@/lib/money';
import { cn } from '@/lib/utils';
import budgets from '@/routes/budgets';

type Budget = {
    id: number;
    name: string;
    limit: string;
    spent: string;
    period: string;
    period_start: string | null;
    period_end: string | null;
    percentage: number;
    category_name: string;
};

type Props = {
    budgets: Budget[];
    categories: Array<{ id: number; name: string }>;
};

export default function Budgets({ budgets: budgetItems, categories }: Props) {
    const totalBudget = budgetItems.reduce((sum, b) => sum + Number(b.limit), 0);
    const totalSpent = budgetItems.reduce((sum, b) => sum + Number(b.spent), 0);
    const remaining = totalBudget - totalSpent;

    return (
        <>
            <Head title="Budgets" />

            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">Budgets</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Set spending limits by period and optional category.
                    </p>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    <Card className="border shadow-sm">
                        <CardHeader className="pb-2">
                            <CardDescription>Total budget</CardDescription>
                            <CardTitle className="text-2xl">{formatCurrency(totalBudget)}</CardTitle>
                        </CardHeader>
                    </Card>
                    <Card className="border shadow-sm">
                        <CardHeader className="pb-2">
                            <CardDescription>Total spent</CardDescription>
                            <CardTitle className="text-2xl">{formatCurrency(totalSpent)}</CardTitle>
                        </CardHeader>
                    </Card>
                    <Card className="border shadow-sm">
                        <CardHeader className="pb-2">
                            <CardDescription>Remaining</CardDescription>
                            <CardTitle className={cn('text-2xl', remaining >= 0 ? 'text-brand' : 'text-rose-600')}>
                                {formatCurrency(remaining)}
                            </CardTitle>
                        </CardHeader>
                    </Card>
                </div>

                <Card className="border shadow-sm">
                    <CardHeader>
                        <CardTitle>Create budget</CardTitle>
                        <CardDescription>Define a limit for the next period.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...budgets.store.form()} className="grid gap-4 sm:grid-cols-2">
                            {({ processing, errors }) => (
                                <>
                                    <div className="grid gap-2">
                                        <Label htmlFor="name">Budget name</Label>
                                        <Input id="name" name="name" placeholder="Dining out" required />
                                        <InputError message={errors.name} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="limit">Limit</Label>
                                        <Input id="limit" name="limit" type="number" step="0.01" min="0.01" placeholder="0.00" required />
                                        <InputError message={errors.limit} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="period">Period</Label>
                                        <select id="period" name="period" className="h-9 rounded-md border border-input bg-background px-3 text-sm" required>
                                            <option value="monthly">Monthly</option>
                                            <option value="quarterly">Quarterly</option>
                                            <option value="yearly">Yearly</option>
                                        </select>
                                        <InputError message={errors.period} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="period_start">Start date</Label>
                                        <Input id="period_start" name="period_start" type="date" required />
                                        <InputError message={errors.period_start} />
                                    </div>
                                    <div className="grid gap-2 sm:col-span-2">
                                        <Label htmlFor="category_id">Category (optional)</Label>
                                        <select id="category_id" name="category_id" className="h-9 rounded-md border border-input bg-background px-3 text-sm">
                                            <option value="">All spending</option>
                                            {categories.map((cat) => (
                                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                                            ))}
                                        </select>
                                        <InputError message={errors.category_id} />
                                    </div>
                                    <div className="sm:col-span-2 flex justify-end">
                                        <Button type="submit" disabled={processing}>
                                            <Plus className="size-4" />
                                            Create budget
                                        </Button>
                                    </div>
                                </>
                            )}
                        </Form>
                    </CardContent>
                </Card>

                <Card className="border shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <PiggyBank className="size-5 text-brand" />
                            Active budgets
                        </CardTitle>
                        <CardDescription>Monitor spent vs limit for each envelope.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {budgetItems.length === 0 ? (
                            <div className="rounded-xl border border-dashed border-border px-4 py-10 text-center text-sm text-muted-foreground">
                                No budgets yet. Create one to track spending.
                            </div>
                        ) : (
                            <div className="grid gap-3">
                                {budgetItems.map((budget) => (
                                    <div key={budget.id} className="rounded-2xl border border-border p-4">
                                        <div className="mb-3 flex items-center justify-between gap-4">
                                            <div>
                                                <p className="font-medium">{budget.name}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {budget.category_name} · {budget.period}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-semibold tabular-nums">
                                                    {formatCurrency(budget.spent)} / {formatCurrency(budget.limit)}
                                                </p>
                                                <p className="text-sm text-muted-foreground">{Math.round(budget.percentage)}% used</p>
                                            </div>
                                        </div>
                                        <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
                                            <div
                                                className={cn(
                                                    'h-full rounded-full transition-all',
                                                    budget.percentage > 100
                                                        ? 'bg-rose-500'
                                                        : budget.percentage > 75
                                                          ? 'bg-amber-500'
                                                          : 'bg-brand',
                                                )}
                                                style={{ width: `${Math.min(100, budget.percentage)}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

Budgets.layout = {
    breadcrumbs: [{ title: 'Budgets', href: budgets.index() }],
};
