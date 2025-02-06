import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCard, MatCardContent, MatCardModule } from '@angular/material/card';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { MatMenu, MatMenuModule } from '@angular/material/menu';
import { SharedService } from '../../../../services/shared.service';
import { FirebaseAuthService } from '../../../../services/firebase-auth.service';
import { User } from '../../../../models/user.class';
import { Account } from '../../../../models/account.class';
import { FirebaseService } from '../../../../services/firebase.service';
import { MatDialog } from '@angular/material/dialog';
import { TransferDetailComponent } from '../transfer-detail/transfer-detail.component';
import { Transfer } from '../../../../models/transfer.class';
import { DashboardDataServiceService } from '../../../../services/dashboard-data-service.service';


@Component({
  selector: 'app-transfers',
  standalone: true,
  imports: [    MatCard,
      MatIconModule,
      MatCardContent,
  
      MatButtonModule,
      MatCardModule,
      MatIcon,
      CommonModule,
  
      ],
  templateUrl: './transfers.component.html',
  styleUrl: './transfers.component.scss'
})
export class TransfersComponent {
  transfers: any[] = [];
  // uid: string | null = null;
  user: User | null = null; // Benutzerdaten
  // userAccounts: Account[] = []; // Array von Account-Objekten
  user$ = this.authService.user$; 
  constructor(
    private sharedService: SharedService,
    private dashboardData: DashboardDataServiceService,
    private authService: FirebaseAuthService,
    public dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.dashboardData.transfers$.subscribe((transfers) => {
      this.transfers = transfers;
    });
    this.user$.subscribe(user => {
      this.user = user;
    });
    
  }

  getFormattedDate(transferDate: number): string {
    return this.sharedService.formatTimestampToDate(transferDate);
  }

  openTransferDetailDialog(transfer: Transfer): void {
    this.dialog.open(TransferDetailComponent, {
      data: transfer, // Übergebe das gesamte Transfer-Objekt
    });
  }
  getFormattedCurrency(value: number) {
    return this.sharedService.getFormattedCurrency(value);
  }
}