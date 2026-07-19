export function formatCurrency(
    value: string | number,
    currency: string = 'USD',
    options?: Intl.NumberFormatOptions,
): string {
    const amount = typeof value === 'string' ? Number(value) : value;

    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
        ...options,
    }).format(Number.isFinite(amount) ? amount : 0);
}

export function formatCompactCurrency(value: string | number, currency: string = 'USD'): string {
    return formatCurrency(value, currency, {
        notation: 'compact',
        maximumFractionDigits: 1,
    });
}

export function formatDateTime(value?: string | null): string {
    if (!value) {
        return '—';
    }

    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    }).format(new Date(value));
}

export function formatRelativeDay(value?: string | null): string {
    if (!value) {
        return '—';
    }

    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
    }).format(new Date(value));
}

export function maskAccountNumber(accountNumber: string): string {
    if (accountNumber.length <= 4) {
        return accountNumber;
    }

    return `•••• ${accountNumber.slice(-4)}`;
}
