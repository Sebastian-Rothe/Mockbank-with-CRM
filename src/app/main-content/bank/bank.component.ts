import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
// models
import { Bank } from '../../../models/bank.interface';
// services
import { BankService } from '../../../services/bank.service';
// import { FirebaseService } from '../../../services/firebase.service';
import { SharedService } from '../../../services/shared.service';
// material
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
@Component({
  selector: 'app-bank',
  standalone: true,
  imports: [
    MatCardModule,
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './bank.component.html',
  styleUrl: './bank.component.scss',
})
export class BankComponent implements OnInit {
  // bank$!: Observable<Bank | undefined>;
  bank: Bank | null = null; // Bankdaten speichern
  totalUserCapital: number = 0;
  constructor(
    private bankService: BankService,
    private sharedService: SharedService
  ) {}
  ngOnInit() {
    this.loadBankData();
    this.loadTotalUserCapital();
    // this.bankService.updateTotalBankBalance();
  }

  async loadBankData() {
    this.bank = await this.bankService.getBankData();
  }
  async loadTotalUserCapital() {
    this.totalUserCapital = await this.bankService.getTotalUserCapital();
  }
  openEditDialog() {}

  getFormattedCurrency(value: number) {
    return this.sharedService.getFormattedCurrency(value);
  }
}
