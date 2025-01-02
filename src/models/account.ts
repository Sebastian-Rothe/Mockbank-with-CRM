export class Account {
    accountId: string;
    balance: number = 0;
    currency: string = 'EUR';
    accountType: 'savings' | 'checking' | 'investment' = 'checking';
  
    constructor(accountId: string, initialBalance: number = 0, currency: string = 'EUR') {
      this.accountId = accountId;
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