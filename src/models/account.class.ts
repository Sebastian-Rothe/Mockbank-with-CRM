export class Account {
  accountId: string;
  userId: string; // Verknüpfung zum Benutzer
  balance: number = 0; // Standardwert
  currency: string = 'EUR'; // Standardwährung
  createdAt: number = Date.now();

  constructor(
    accountId: string,
    userId: string,
    initialBalance: number = 0,
    currency: string = 'EUR'
  ) {
    this.accountId = accountId;
    this.userId = userId;
    this.balance = initialBalance;
    this.currency = currency;
  }

  deposit(amount: number): void {
    this.balance += amount;
  }

  withdraw(amount: number): void {
    if (this.balance < amount) {
      throw new Error('Insufficient funds');
    }
    this.balance -= amount;
  }

  transfer(amount: number, recipientAccount: Account): void {
    this.withdraw(amount);
    recipientAccount.deposit(amount);
  }
}
