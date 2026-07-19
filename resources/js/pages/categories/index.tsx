import { Form, Head } from '@inertiajs/react';
import { Plus, Tags } from 'lucide-react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import categories from '@/routes/categories';

type Category = {
    id: number;
    name: string;
    color: string;
    icon?: string | null;
    transaction_count: number;
};

type Props = {
    categories: Category[];
};

export default function Categories({ categories: categoryItems }: Props) {
    return (
        <>
            <Head title="Categories" />

            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">Categories</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Organize transactions and budgets with color-coded categories.
                    </p>
                </div>

                <Card className="border shadow-sm">
                    <CardHeader>
                        <CardTitle>Create category</CardTitle>
                        <CardDescription>Add a label you can reuse across spending.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...categories.store.form()} className="grid gap-4 sm:grid-cols-3">
                            {({ processing, errors }) => (
                                <>
                                    <div className="grid gap-2">
                                        <Label htmlFor="name">Name</Label>
                                        <Input id="name" name="name" placeholder="Groceries" required />
                                        <InputError message={errors.name} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="color">Color</Label>
                                        <Input id="color" name="color" type="color" defaultValue="#0F6B66" required />
                                        <InputError message={errors.color} />
                                    </div>
                                    <div className="flex items-end">
                                        <Button type="submit" className="w-full" disabled={processing}>
                                            <Plus className="size-4" />
                                            Add category
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
                            <Tags className="size-5 text-brand" />
                            Your categories
                        </CardTitle>
                        <CardDescription>Manage how transactions are grouped.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {categoryItems.length === 0 ? (
                            <div className="rounded-xl border border-dashed border-border px-4 py-10 text-center text-sm text-muted-foreground">
                                No categories yet. Create one to organize transactions.
                            </div>
                        ) : (
                            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                {categoryItems.map((category) => (
                                    <div
                                        key={category.id}
                                        className="rounded-2xl border border-border bg-card p-4 shadow-sm"
                                        style={{ borderLeftColor: category.color, borderLeftWidth: 4 }}
                                    >
                                        <div className="flex items-center gap-2">
                                            <span className="size-3 rounded-full" style={{ backgroundColor: category.color }} />
                                            <p className="font-medium">{category.name}</p>
                                        </div>
                                        <p className="mt-2 text-sm text-muted-foreground">
                                            {category.transaction_count} transaction
                                            {category.transaction_count === 1 ? '' : 's'}
                                        </p>
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

Categories.layout = {
    breadcrumbs: [{ title: 'Categories', href: categories.index() }],
};
