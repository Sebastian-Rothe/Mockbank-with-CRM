import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
// material
import { MatButtonModule } from '@angular/material/button';
import { MatCard, MatCardContent, MatCardModule } from '@angular/material/card';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { MatMenu, MatMenuModule } from '@angular/material/menu';
import { MatDialog } from '@angular/material/dialog';
// services
import { SharedService } from '../../../services/shared.service';
import { FirebaseAuthService } from '../../../services/firebase-auth.service';
import { TransferService } from '../../../services/transfer.service';
import { TransferDetailComponent } from '../transfer-detail/transfer-detail.component';
import { DashboardDataServiceService } from '../../../services/dashboard-data-service.service';
import { UserService } from '../../../services/user.service';
import { DialogService } from '../../../services/dialog.service';
// models
import { User } from '../../../models/user.class';
import { Transfer } from '../../../models/transfer.class';

@Component({
  selector: 'app-transfers',
  standalone: true,
  imports: [
    MatCard,
    MatIconModule,
    MatCardContent,
    MatButtonModule,
    MatCardModule,
    MatIcon,
    CommonModule,
    MatMenuModule,
  ],
  templateUrl: './transfers.component.html',
  styleUrl: './transfers.component.scss'
})
export class TransfersComponent {
  transfers: any[] = [];
  user: User | null = null; // Benutzerdaten
  user$ = this.authService.user$;
  @Input() userId: string | null = null;

  constructor(
    private sharedService: SharedService,
    private dashboardData: DashboardDataServiceService,
    private authService: FirebaseAuthService,
    private transferService: TransferService,
    private userService: UserService,
    public dialog: MatDialog,
    private dialogService: DialogService
  ) {}

  async ngOnInit(): Promise<void> {
    if (this.userId) {
      await this.loadUserAndTransfers(this.userId);
    } else {
      this.user$.subscribe(async (user) => {
        if (user) {
          this.user = user;
          await this.loadTransfersForUser(user);
        }
      });
    }
  }

  /**
   * Loads the user and their transfers by user ID.
   * @param {string} userId - The user ID.
   */
  private async loadUserAndTransfers(userId: string): Promise<void> {
    this.user = await this.userService.getUser(userId);
    if (this.user) {
      await this.loadTransfersForUser(this.user);
    } else {
      this.dialogService.openDialog('Error', 'User not found', 'error');
    }
  }

  /**
   * Loads the transfers for the given user.
   * @param {User} user - The user.
   */
  private async loadTransfersForUser(user: User): Promise<void> {
    await this.dashboardData.loadTransfers(user);
    this.dashboardData.transfers$.subscribe((transfers) => {
      this.transfers = transfers;
    });
  }

  /**
   * Formats the transfer date to a readable string.
   * @param {number} transferDate - The transfer date as a timestamp.
   * @returns {string} The formatted date string.
   */
  getFormattedDate(transferDate: number): string {
    return this.sharedService.formatTimestampToDate(transferDate);
  }

  /**
   * Opens the transfer detail dialog.
   * @param {Transfer} transfer - The transfer object.
   */
  openTransferDetailDialog(transfer: Transfer): void {
    this.dialog.open(TransferDetailComponent, {
      data: transfer, // Übergebe das gesamte Transfer-Objekt
    });
  }

  /**
   * Formats the currency value.
   * @param {number} value - The currency value.
   * @returns {string} The formatted currency string.
   */
  getFormattedCurrency(value: number) {
    return this.sharedService.getFormattedCurrency(value);
  }
}