export interface Bank {
  id: string;
  name: string;
  interestRate: number;
  transactionFee: number;
  totalBalance: number;
  lastUpdate: Date;
}
