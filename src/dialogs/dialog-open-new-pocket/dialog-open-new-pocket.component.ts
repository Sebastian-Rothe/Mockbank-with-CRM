import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
// material
import { MatButtonModule } from '@angular/material/button';
import { MatOption } from '@angular/material/core';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIcon } from '@angular/material/icon';
// models
import { Account } from '../../models/account.class';
// services 
import { FirebaseService } from '../../services/firebase.service';
import { FirebaseAuthService } from '../../services/firebase-auth.service';
import { AccountService } from '../../services/account.service';

@Component({
  selector: 'app-dialog-open-new-pocket',
  standalone: true,
  imports: [
    MatDialogModule,
    MatFormFieldModule,
    MatOption,
    MatSelectModule,
    MatInputModule,
    MatButtonModule,
    FormsModule,
    MatIcon
  ],
  templateUrl: './dialog-open-new-pocket.component.html',
  styleUrls: ['./dialog-open-new-pocket.component.scss'],
})
export class DialogOpenNewPocketComponent implements OnInit {
  uid: string | null = null; 
  account: Account = new Account(); 

  constructor(
    private firebaseService: FirebaseService,
    private accountService: AccountService,
    private authService: FirebaseAuthService,
    public dialogRef: MatDialogRef<DialogOpenNewPocketComponent>
  ) {}

  ngOnInit(): void {
    try {
      this.uid = this.authService.getUid(); 
      if (!this.uid) {
        throw new Error('No user is currently logged in.');
      }
    } catch (error) {
      console.error(error);
      alert('You must be logged in to create a new account.');
      this.closeDialog();
    }
  }


  async createAccount(): Promise<void> {
    if (!this.uid) {
      console.error('No user ID found.');
      alert('You must be logged in to create an account.');
      return;
    }

 
    if (this.account.balance <= 0 || !this.account.accountName) {
      alert('Please enter valid account details.');
      return;
    }


    this.account.userId = this.uid;

    try {
    
      await this.accountService.addAccount(this.uid, this.account.toJson());
      this.dialogRef.close(true); 
    } catch (error) {
      console.error('Error creating account:', error);
      alert('Failed to create account.');
    }
  }

 
  closeDialog(): void {
    this.dialogRef.close();
  }
}
