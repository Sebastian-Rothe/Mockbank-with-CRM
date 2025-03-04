import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BankService } from '../../services/bank.service';
import { Bank } from '../../models/bank.interface';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-dialog-edit-transaction-fee',
  standalone: true,
  imports: [
    MatDialogModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  templateUrl: './dialog-edit-transaction-fee.component.html',
  styleUrls: ['./dialog-edit-transaction-fee.component.scss']
})
export class DialogEditTransactionFeeComponent implements OnInit {
  transactionFeeForm: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<DialogEditTransactionFeeComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Bank,
    private fb: FormBuilder,
    private bankService: BankService
  ) {
    this.transactionFeeForm = this.fb.group({
      transactionFee: [data.transactionFee, Validators.required]
    });
  }

  ngOnInit(): void {}

  async save(): Promise<void> {
    if (this.transactionFeeForm.valid) {
      try {
        await this.bankService.updateBank(this.transactionFeeForm.value);
        this.dialogRef.close(true);
      } catch (error) {
        console.error('Error updating transaction fee:', error);
      }
    }
  }

  close(): void {
    this.dialogRef.close();
  }
}
