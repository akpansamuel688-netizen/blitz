import { Form, Head, router } from '@inertiajs/react';
import {
    CheckCircle2,
    Clock3,
    CreditCard,
    Eye,
    MapPin,
    Plus,
    ShieldCheck,
    Smartphone,
    Trash2,
} from 'lucide-react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

type Account = { id: number; name: string; type: string; currency: string };
type DebitCard = {
    id: number;
    type: 'virtual' | 'physical';
    status: 'active' | 'requested' | 'cancelled' | 'rejected';
    last_four: string;
    expires_at: string | null;
    account_name: string;
};
type RevealedCard = DebitCard & { card_number: string; cvv: string };
type Props = { accounts: Account[]; cards: DebitCard[] };

export default function Cards({ accounts, cards }: Props) {
    const virtualCards = cards.filter((card) => card.type === 'virtual');
    const physicalCards = cards.filter((card) => card.type === 'physical');
    const [revealedCard, setRevealedCard] = useState<RevealedCard | null>(null);
    const [revealingCardId, setRevealingCardId] = useState<number | null>(null);
    const [revealError, setRevealError] = useState<string | null>(null);

    const revealCardDetails = async (card: DebitCard) => {
        setRevealingCardId(card.id);
        setRevealError(null);
        try {
            const response = await fetch(`/cards/${card.id}/details`, {
                headers: {
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });
            if (!response.ok) throw new Error();
            setRevealedCard({ ...card, ...(await response.json()) });
        } catch {
            setRevealError(
                'We could not reveal this card right now. Please try again.',
            );
        } finally {
            setRevealingCardId(null);
        }
    };

    const cancelPhysicalRequest = (card: DebitCard) => {
        if (
            window.confirm(
                'Cancel this physical debit card request? This cannot be undone.',
            )
        )
            router.delete(`/cards/${card.id}/physical-request`);
    };

    const deleteVirtualCard = (card: DebitCard) => {
        if (
            window.confirm(
                `Delete the virtual card ending in ${card.last_four}? This cannot be undone.`,
            )
        ) {
            setRevealedCard((revealed) =>
                revealed?.id === card.id ? null : revealed,
            );
            router.delete(`/cards/${card.id}/virtual`, {
                preserveScroll: true,
            });
        }
    };

    return (
        <>
            <Head title="Debit cards" />
            <div className="space-y-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="text-sm font-medium text-brand">Cards</p>
                        <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
                            Your debit cards
                        </h1>
                        <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
                            Create a virtual debit card for online purchases or
                            request a physical card for everyday spending.
                        </p>
                    </div>
                    <div className="flex items-center gap-2 rounded-xl border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
                        <ShieldCheck className="size-4 text-brand" /> Card
                        details are protected
                    </div>
                </div>

                <div className="grid gap-6 xl:grid-cols-2">
                    <Card className="border shadow-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Smartphone className="size-5 text-brand" />{' '}
                                Virtual debit card
                            </CardTitle>
                            <CardDescription>
                                Create a secure card for online and in-app
                                purchases. It is ready as soon as it is created.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <CardForm
                                action="/cards/virtual"
                                accounts={accounts}
                                buttonText="Create virtual card"
                                processingText="Creating virtual card…"
                            />
                        </CardContent>
                    </Card>
                    <Card className="border shadow-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <MapPin className="size-5 text-brand" />{' '}
                                Physical debit card
                            </CardTitle>
                            <CardDescription>
                                Submit a request for a physical debit card
                                linked to the selected account. We will show it
                                here once it is requested.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <CardForm
                                action="/cards/physical"
                                accounts={accounts}
                                buttonText="Request physical card"
                                processingText="Submitting request…"
                            />
                        </CardContent>
                    </Card>
                </div>

                <Card className="border shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CreditCard className="size-5 text-brand" /> Your
                            cards
                        </CardTitle>
                        <CardDescription>
                            Card numbers stay masked by default. Reveal active
                            virtual-card details only when needed.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {cards.length === 0 ? (
                            <div className="rounded-2xl border border-dashed border-border bg-muted/30 px-6 py-12 text-center">
                                <CreditCard className="mx-auto size-9 text-brand" />
                                <p className="mt-3 font-medium">
                                    No debit cards yet
                                </p>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Create a virtual card or request a physical
                                    card above.
                                </p>
                            </div>
                        ) : (
                            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                                {[...virtualCards, ...physicalCards].map(
                                    (card) => (
                                        <DebitCardTile
                                            key={card.id}
                                            card={card}
                                            onReveal={revealCardDetails}
                                            onCancel={cancelPhysicalRequest}
                                            onDelete={deleteVirtualCard}
                                            revealing={
                                                revealingCardId === card.id
                                            }
                                        />
                                    ),
                                )}
                            </div>
                        )}
                        {revealError && (
                            <p className="mt-4 text-sm text-destructive">
                                {revealError}
                            </p>
                        )}
                    </CardContent>
                </Card>
            </div>
            <Dialog
                open={revealedCard !== null}
                onOpenChange={(open) => !open && setRevealedCard(null)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Eye className="size-5 text-brand" /> Virtual card
                            details
                        </DialogTitle>
                        <DialogDescription>
                            Keep these details private. NovaTrust Bank will
                            never ask you to share your card number or CVV.
                        </DialogDescription>
                    </DialogHeader>
                    {revealedCard && (
                        <div className="space-y-4 rounded-xl border bg-muted/30 p-4">
                            <div>
                                <p className="text-xs text-muted-foreground">
                                    Card number
                                </p>
                                <p className="mt-1 font-mono text-lg tracking-wider">
                                    {formatCardNumber(revealedCard.card_number)}
                                </p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs text-muted-foreground">
                                        Expires
                                    </p>
                                    <p className="mt-1 font-mono font-medium">
                                        {revealedCard.expires_at}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">
                                        CVV
                                    </p>
                                    <p className="mt-1 font-mono font-medium">
                                        {revealedCard.cvv}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button onClick={() => setRevealedCard(null)}>
                            Done
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

function CardForm({
    action,
    accounts,
    buttonText,
    processingText,
}: {
    action: string;
    accounts: Account[];
    buttonText: string;
    processingText: string;
}) {
    return (
        <Form action={action} method="post" className="grid gap-4">
            {({ processing, errors }) => (
                <>
                    <div className="grid gap-2">
                        <Label htmlFor={`${action}-account`}>
                            Linked account
                        </Label>
                        <select
                            id={`${action}-account`}
                            name="account_id"
                            required
                            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                        >
                            <option value="">Select an account</option>
                            {accounts.map((account) => (
                                <option key={account.id} value={account.id}>
                                    {account.name} · {account.type}
                                </option>
                            ))}
                        </select>
                        <InputError message={errors.account_id} />
                    </div>
                    <Button disabled={processing || accounts.length === 0}>
                        <Plus className="size-4" />
                        {processing ? processingText : buttonText}
                    </Button>
                </>
            )}
        </Form>
    );
}

function DebitCardTile({
    card,
    onReveal,
    onCancel,
    onDelete,
    revealing,
}: {
    card: DebitCard;
    onReveal: (card: DebitCard) => void;
    onCancel: (card: DebitCard) => void;
    onDelete: (card: DebitCard) => void;
    revealing: boolean;
}) {
    const isActive = card.status === 'active';
    return (
        <div
            className={`relative min-h-44 overflow-hidden rounded-xl p-4 text-white shadow-lg ${card.type === 'virtual' ? 'bg-gradient-to-br from-blue-600 via-blue-800 to-slate-950' : 'bg-gradient-to-br from-slate-700 via-slate-800 to-slate-950'}`}
        >
            <div className="absolute -top-10 -right-8 size-36 rounded-full bg-white/10" />
            <div className="absolute -bottom-12 left-10 size-36 rounded-full bg-brand/30 blur-2xl" />
            <div className="relative flex items-start justify-between gap-3">
                <span className="text-sm font-medium tracking-wide">
                    NOVATRUST
                </span>
                <Badge
                    className={
                        isActive
                            ? 'border-0 bg-blue-300/20 text-blue-100'
                            : card.status === 'requested'
                              ? 'border-0 bg-amber-300/20 text-amber-100'
                              : 'border-0 bg-rose-300/20 text-rose-100'
                    }
                >
                    {isActive ? (
                        <CheckCircle2 className="size-3" />
                    ) : (
                        <Clock3 className="size-3" />
                    )}
                    {isActive
                        ? 'Active'
                        : card.status === 'requested'
                          ? 'Requested'
                          : card.status === 'rejected'
                            ? 'Rejected'
                            : 'Cancelled'}
                </Badge>
            </div>
            <div className="relative mt-9">
                <CreditCard className="size-8 text-white/80" />
                <p className="mt-4 font-mono text-lg tracking-[0.16em]">
                    •••• •••• •••• {card.last_four}
                </p>
            </div>
            <div className="relative mt-5 flex items-end justify-between gap-3 text-xs">
                <div>
                    <p className="text-white/60">Linked account</p>
                    <p className="mt-1 font-medium">{card.account_name}</p>
                </div>
                <div className="text-right">
                    <p className="text-white/60">Expires</p>
                    <p className="mt-1 font-medium">{card.expires_at ?? '—'}</p>
                </div>
            </div>
            <p className="relative mt-3 text-xs text-white/70 capitalize">
                {card.type} debit card
            </p>
            <div className="relative mt-3 flex items-center justify-between gap-2">
                <p className="text-xs text-white/70 capitalize">
                    {card.type} debit card
                </p>
                {card.type === 'virtual' && (
                    <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        aria-label={`Delete virtual card ending in ${card.last_four}`}
                        className="h-7 bg-rose-500/20 px-2 text-xs text-rose-100 hover:bg-rose-500/35 hover:text-white"
                        onClick={() => onDelete(card)}
                    >
                        <Trash2 className="size-3" />
                        Delete
                    </Button>
                )}
                {card.type === 'virtual' && isActive && (
                    <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        className="h-7 bg-white/15 px-2 text-xs text-white hover:bg-white/25 hover:text-white"
                        disabled={revealing}
                        onClick={() => onReveal(card)}
                    >
                        <Eye className="size-3" />
                        {revealing ? 'Loading…' : 'Reveal'}
                    </Button>
                )}
                {card.type === 'physical' && card.status === 'requested' && (
                    <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        className="h-7 bg-white/15 px-2 text-xs text-white hover:bg-white/25 hover:text-white"
                        onClick={() => onCancel(card)}
                    >
                        Cancel request
                    </Button>
                )}
            </div>
            {card.type === 'physical' && isActive && (
                <div className="relative mt-2 flex justify-end">
                    <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        className="h-7 bg-white/15 px-2 text-xs text-white hover:bg-white/25 hover:text-white"
                        disabled={revealing}
                        onClick={() => onReveal(card)}
                    >
                        <Eye className="size-3" />
                        {revealing ? 'Loading...' : 'Reveal'}
                    </Button>
                </div>
            )}
        </div>
    );
}

function formatCardNumber(number: string): string {
    return number.replace(/(.{4})/g, '$1 ').trim();
}

Cards.layout = { breadcrumbs: [{ title: 'Cards', href: '/cards' }] };
