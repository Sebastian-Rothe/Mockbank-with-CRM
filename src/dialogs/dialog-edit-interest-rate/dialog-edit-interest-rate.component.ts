import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BankService } from '../../services/bank.service';
import { Bank } from '../../models/bank.interface';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { SnackbarService } from '../../services/snackbar.service';

@Component({
  selector: 'app-dialog-edit-interest-rate',
  standalone: true,
  imports: [
    MatDialogModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  templateUrl: './dialog-edit-interest-rate.component.html',
  styleUrls: ['./dialog-edit-interest-rate.component.scss']
})
export class DialogEditInterestRateComponent implements OnInit {
  interestRateForm: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<DialogEditInterestRateComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Bank,
    private fb: FormBuilder,
    private bankService: BankService,
    private snackbarService: SnackbarService
  ) {
    this.interestRateForm = this.fb.group({
      interestRate: [data.interestRate, [Validators.required, Validators.max(0.075)]]
    });
  }

  ngOnInit(): void {}

  async save(): Promise<void> {
    if (this.interestRateForm.valid) {
      try {
        await this.bankService.updateBank(this.interestRateForm.value);
        this.snackbarService.success('Interest rate updated successfully.');
        this.dialogRef.close(true);
      } catch (error) {
        console.error('Error updating interest rate:', error);
        this.snackbarService.error('Failed to update interest rate.');
      }
    } else {
      this.snackbarService.error('Invalid interest rate value.');
    }
  }

  close(): void {
    this.dialogRef.close();
  }
}
