import { Form } from '@inertiajs/react';
import { Button } from '@/components/ui/button';

export function TransferDeleteAction({ id, type }: { id: number; type: string }) {
    if (!['domestic', 'wire'].includes(type)) return null;
    return <Form action={`/admin/transfers/${id}`} method="delete" className="mt-2 flex justify-end" onSubmit={(event) => { if (!window.confirm('Delete this transfer permanently? Its linked customer ledger entry will also be removed.')) event.preventDefault(); }}>{({ processing }) => <Button type="submit" variant="destructive" disabled={processing}>{processing ? 'Deleting…' : 'Delete transfer'}</Button>}</Form>;
}
