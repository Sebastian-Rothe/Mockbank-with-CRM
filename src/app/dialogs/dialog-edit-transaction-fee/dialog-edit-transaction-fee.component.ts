import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BankService } from '../../services/bank.service';
import { Bank } from '../../models/bank.interface';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { SnackbarService } from '../../services/snackbar.service';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-dialog-edit-transaction-fee',
  standalone: true,
  imports: [
    MatDialogModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIcon
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
    private bankService: BankService,
    private snackbarService: SnackbarService
  ) {
    this.transactionFeeForm = this.fb.group({
      transactionFee: [data.transactionFee, [Validators.required, Validators.max(10)]]
    });
  }

  ngOnInit(): void {}

  async save(): Promise<void> {
    if (this.transactionFeeForm.valid) {
      try {
        await this.bankService.updateBank(this.transactionFeeForm.value);
        this.snackbarService.success('Transaction fee updated successfully.');
        this.dialogRef.close(true);
      } catch (error) {
        console.error('Error updating transaction fee:', error);
        this.snackbarService.error('Failed to update transaction fee.');
      }
    } else {
      this.snackbarService.error('Invalid transaction fee value.');
    }
  }

  close(): void {
    this.dialogRef.close();
  }
}
