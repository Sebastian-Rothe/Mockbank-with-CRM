import { Injectable } from '@angular/core';
import { Account } from '../models/account.class';

@Injectable({
  providedIn: 'root',
})

export class BankingService {

  deposit(account: Account, amount: number): void {
    if (amount <= 0) {
      throw new Error('Deposit amount must be positive');
    }
    account.balance += amount;
  }

  withdraw(account: Account, amount: number): void {
    if (amount <= 0) {
      throw new Error('Withdrawal amount must be positive');
    }
    if (account.balance < amount) {
      throw new Error('Insufficient funds');
    }
    account.balance -= amount;
  }

  transfer(sender: Account, recipient: Account, amount: number): void {
    if (amount <= 0) {
      throw new Error('Transfer amount must be positive');
    }
    this.withdraw(sender, amount);
    this.deposit(recipient, amount);
  }


}
