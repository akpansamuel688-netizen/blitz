import { Form, Head } from '@inertiajs/react';
import { Plus, Target } from 'lucide-react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatCurrency } from '@/lib/money';
import savingsGoals from '@/routes/savings-goals';

type Goal = {
    id: number;
    name: string;
    description?: string | null;
    target_amount: string;
    current_amount: string;
    target_date?: string | null;
    status: string;
    percentage: number;
    color: string;
    account_name: string;
};

type Props = {
    goals: Goal[];
    accounts: Array<{ id: number; name: string }>;
};

export default function SavingsGoals({ goals, accounts }: Props) {
    const activeGoals = goals.filter((g) => g.status === 'active');
    const totalGoal = activeGoals.reduce((sum, g) => sum + Number(g.target_amount), 0);
    const totalSaved = activeGoals.reduce((sum, g) => sum + Number(g.current_amount), 0);

    return (
        <>
            <Head title="Savings goals" />

            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">Savings goals</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Set targets for trips, reserves, and long-term plans.
                    </p>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    <Card className="border shadow-sm">
                        <CardHeader className="pb-2">
                            <CardDescription>Active goals</CardDescription>
                            <CardTitle className="text-2xl">{activeGoals.length}</CardTitle>
                        </CardHeader>
                    </Card>
                    <Card className="border shadow-sm">
                        <CardHeader className="pb-2">
                            <CardDescription>Total target</CardDescription>
                            <CardTitle className="text-2xl">{formatCurrency(totalGoal)}</CardTitle>
                        </CardHeader>
                    </Card>
                    <Card className="border border-brand/15 bg-gradient-to-br from-brand-subtle to-card shadow-sm">
                        <CardHeader className="pb-2">
                            <CardDescription>Total saved</CardDescription>
                            <CardTitle className="text-2xl text-brand">{formatCurrency(totalSaved)}</CardTitle>
                        </CardHeader>
                    </Card>
                </div>

                <Card className="border shadow-sm">
                    <CardHeader>
                        <CardTitle>Create savings goal</CardTitle>
                        <CardDescription>Optionally link a savings account for context.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...savingsGoals.store.form()} className="grid gap-4 sm:grid-cols-2">
                            {({ processing, errors }) => (
                                <>
                                    <div className="grid gap-2">
                                        <Label htmlFor="name">Goal name</Label>
                                        <Input id="name" name="name" placeholder="Emergency fund" required />
                                        <InputError message={errors.name} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="target_amount">Target amount</Label>
                                        <Input id="target_amount" name="target_amount" type="number" step="0.01" min="0.01" placeholder="0.00" required />
                                        <InputError message={errors.target_amount} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="description">Description</Label>
                                        <Input id="description" name="description" placeholder="Optional details" />
                                        <InputError message={errors.description} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="target_date">Target date</Label>
                                        <Input id="target_date" name="target_date" type="date" />
                                        <InputError message={errors.target_date} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="account_id">Linked account</Label>
                                        <select id="account_id" name="account_id" className="h-9 rounded-md border border-input bg-background px-3 text-sm">
                                            <option value="">No account</option>
                                            {accounts.map((acc) => (
                                                <option key={acc.id} value={acc.id}>{acc.name}</option>
                                            ))}
                                        </select>
                                        <InputError message={errors.account_id} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="color">Color</Label>
                                        <Input id="color" name="color" type="color" defaultValue="#1557C0" />
                                        <InputError message={errors.color} />
                                    </div>
                                    <div className="sm:col-span-2 flex justify-end">
                                        <Button type="submit" disabled={processing}>
                                            <Plus className="size-4" />
                                            Create goal
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
                            <Target className="size-5 text-brand" />
                            Your goals
                        </CardTitle>
                        <CardDescription>Progress toward each target.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {goals.length === 0 ? (
                            <div className="rounded-xl border border-dashed border-border px-4 py-10 text-center text-sm text-muted-foreground">
                                No savings goals yet. Create one to start tracking progress.
                            </div>
                        ) : (
                            <div className="grid gap-3">
                                {goals.map((goal) => (
                                    <div key={goal.id} className="rounded-2xl border border-border p-4">
                                        <div className="mb-3 flex items-center justify-between gap-4">
                                            <div className="flex items-center gap-2">
                                                <Target className="size-5 shrink-0" style={{ color: goal.color }} />
                                                <div>
                                                    <p className="font-medium">{goal.name}</p>
                                                    <p className="text-sm text-muted-foreground">{goal.account_name}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-semibold tabular-nums">
                                                    {formatCurrency(goal.current_amount)} / {formatCurrency(goal.target_amount)}
                                                </p>
                                                <p className="text-sm text-muted-foreground">{Math.round(goal.percentage)}% complete</p>
                                            </div>
                                        </div>
                                        <div className="mb-2 h-2.5 w-full overflow-hidden rounded-full bg-muted">
                                            <div
                                                className="h-full rounded-full transition-all"
                                                style={{
                                                    width: `${Math.min(100, goal.percentage)}%`,
                                                    backgroundColor: goal.color,
                                                }}
                                            />
                                        </div>
                                        {goal.target_date && (
                                            <p className="text-sm text-muted-foreground">
                                                Target {new Date(goal.target_date).toLocaleDateString()}
                                            </p>
                                        )}
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

SavingsGoals.layout = {
    breadcrumbs: [{ title: 'Savings goals', href: savingsGoals.index() }],
};
