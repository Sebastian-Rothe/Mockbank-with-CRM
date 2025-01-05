export class Account {
  accountId: string;
  userId: string;
  balance: number = 0;
  currency: string = 'EUR';
  createdAt: number = Date.now();

  constructor(data?: Partial<Account>) {
    this.accountId = data?.accountId || '';
    this.userId = data?.userId || '';
    this.balance = data?.balance || 0;
    this.currency = data?.currency || 'EUR';
    this.createdAt = data?.createdAt || Date.now();
  }

  toJson(): any {
    return {
      accountId: this.accountId,
      userId: this.userId,
      balance: this.balance,
      currency: this.currency,
      createdAt: this.createdAt,
    };
  }

  static fromJson(json: any): Account {
    return new Account({
      accountId: json.accountId,
      userId: json.userId,
      balance: json.balance,
      currency: json.currency,
      createdAt: json.createdAt,
    });
  }
}
