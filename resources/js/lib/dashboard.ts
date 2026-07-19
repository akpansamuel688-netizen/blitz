export type DashboardAccount = {
    id: number;
    name: string;
    type: string;
    account_number: string;
    balance: string;
    currency: string;
    share: number;
};

export type DashboardTransaction = {
    id: number;
    transaction_type: string;
    description: string | null;
    amount: string;
    created_at: string | null;
    account_name: string;
    currency: string;
};

export type ActivityDay = {
    date: string;
    label: string;
    credits: string;
    debits: string;
    count: number;
};

export type UserDashboardStats = {
    totalBalance: string;
    accountCount: number;
    moneyIn: string;
    moneyOut: string;
    netFlow: string;
    checkingBalance: string;
    savingsBalance: string;
    transactionCount30d: number;
};

export type AdminStats = {
    userCount: number;
    adminCount: number;
    accountCount: number;
    transactionCount: number;
    totalDeposits: string;
    newUsersWeek: number;
    newAccountsWeek: number;
    transactionsWeek: number;
    volumeWeek: string;
    creditsMonth: string;
    debitsMonth: string;
};

export type AdminUserRow = {
    id: number;
    name: string;
    email: string;
    is_admin: boolean;
    accounts_count: number;
    total_balance: string;
    created_at: string | null;
    email_verified_at?: string | null;
};

export type AdminTransactionRow = {
    id: number;
    transaction_type: string;
    description: string | null;
    amount: string;
    created_at: string | null;
    account_name: string;
    user_name: string;
    currency: string;
};

export type AdminAccountRow = {
    id: number;
    name: string;
    type: string;
    balance: string;
    currency: string;
    account_number: string;
    user_name: string;
    user_email: string;
};
