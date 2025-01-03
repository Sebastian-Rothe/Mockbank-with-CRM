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


}
