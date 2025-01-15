export class Transfer {
    transferId: string;
    senderAccountId: string = '';
    senderAccountName: string = '';
    senderUserId: string = ''; // Neue Eigenschaft
    receiverAccountId: string = '';
    receiverAccountName: string = '';
    receiverUserId: string = ''; // Neue Eigenschaft
    amount: number = 0;
    currency: string = 'EUR';
    createdAt: number;
    description?: string;
  
  
    constructor(obj?: Partial<Transfer>) {
      if (obj) {
        // console.log('Data before Object.assign:', obj);
        Object.assign(this, obj); // Übernimmt alle Werte aus obj
        // console.log('Data after Object.assign:', this);
      }
      this.senderAccountName = obj?.senderAccountName ?? this.senderAccountName;
      this.receiverAccountName = obj?.receiverAccountName ?? this.receiverAccountName;
      this.transferId = obj?.transferId || `TR-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      this.createdAt = obj?.createdAt || Date.now();
    }
  
    toPlainObject(): Record<string, any> {
      return {
        transferId: this.transferId,
        senderAccountId: this.senderAccountId,
        senderAccountName: this.senderAccountName,
        senderUserId: this.senderUserId,
        receiverAccountId: this.receiverAccountId,
        receiverAccountName: this.receiverAccountName,
        receiverUserId: this.receiverUserId,
        amount: this.amount,
        currency: this.currency,
        createdAt: this.createdAt,
        description: this.description,
        
      };
    }
  }
  