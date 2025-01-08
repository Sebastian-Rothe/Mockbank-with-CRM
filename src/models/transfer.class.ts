export class Transfer {
    transferId: string;
    senderAccountId: string = '';
    senderUserId: string = ''; // Neue Eigenschaft
    receiverAccountId: string = '';
    receiverUserId: string = ''; // Neue Eigenschaft
    amount: number = 0;
    currency: string = 'EUR';
    createdAt: number;
    description?: string;
    date: number = Date.now();
  
    constructor(obj?: Partial<Transfer>) {
      if (obj) {
        Object.assign(this, obj);
      }
      this.transferId = obj?.transferId || `TR-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      this.createdAt = obj?.createdAt || Date.now();
    }
  
    toPlainObject(): Record<string, any> {
      return {
        transferId: this.transferId,
        senderAccountId: this.senderAccountId,
        senderUserId: this.senderUserId,
        receiverAccountId: this.receiverAccountId,
        receiverUserId: this.receiverUserId,
        amount: this.amount,
        currency: this.currency,
        createdAt: this.createdAt,
        description: this.description,
        date: this.date,
      };
    }
  }
  