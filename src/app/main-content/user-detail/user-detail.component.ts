//
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
// Firebase
import { doc, onSnapshot } from 'firebase/firestore';
// Services
import { FirebaseService } from '../../services/firebase.service';
import { FirebaseAuthService } from '../../services/firebase-auth.service';
import { SharedService } from '../../services/shared.service';
import { UserService } from '../../services/user.service';
import { SnackbarService } from '../../services/snackbar.service';
import { DialogService } from '../../services/dialog.service';
import { LoadingService } from '../../services/loading.service';
// Models
import { User } from '../../models/user.class';
// Angular Material
import { MatCard, MatCardContent } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatAccordion, MatExpansionModule } from '@angular/material/expansion';
// Dialoge
import { DialogEditUserAddressComponent } from '../../dialogs/dialog-edit-user-address/dialog-edit-user-address.component';
import { DialogEditUserDetailComponent } from '../../dialogs/dialog-edit-user-detail/dialog-edit-user-detail.component';
import { DialogEditUserDetailsComponent } from '../../dialogs/dialog-edit-user-details/dialog-edit-user-details.component';
import { DialogEditUserEmailComponent } from '../../dialogs/dialog-edit-user-email/dialog-edit-user-email.component';
import { DialogEditUserPasswordComponent } from '../../dialogs/dialog-edit-user-password/dialog-edit-user-password.component';
import { AccountsComponent } from '../dashboard/accounts/accounts.component';
import { TransfersComponent } from '../dashboard/transfers/transfers.component';

// import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-user-detail',
  standalone: true,
  imports: [
    MatCard,
    // MatCardContent,
    MatIcon,
    MatButtonModule,
    MatMenuModule,
    AccountsComponent,
    TransfersComponent, 
    MatTooltip,
    MatAccordion,
    MatExpansionModule
  ],
  templateUrl: './user-detail.component.html',
  styleUrl: './user-detail.component.scss',
})
export class UserDetailComponent implements OnInit {
  userId: string = '';
  user: User | null = null;
  isGuest: boolean = true;
  userIdCheck: string | null = '';
  constructor(
    public dialog: MatDialog,
    private route: ActivatedRoute,
    private firebaseService: FirebaseService,
    private authService: FirebaseAuthService,
    private sharedService: SharedService,
    private userService: UserService,
    private snackbarService: SnackbarService,
    private dialogService: DialogService,
    private router: Router,
    private loadingService: LoadingService // Inject LoadingService
  ) {}

  ngOnInit() {
    this.route.params.subscribe((params) => {
      this.userId = params['uid'];
      // console.log('User ID from route:', this.userId);
    });
    this.getUserDetails(this.userId);
   
    this.userIdCheck = this.authService.getUid();
    // console.log(
    //   'the userId at user-detail:',
    //   this.userId,
    //   '???',
    //   this.userIdCheck
    // );
  }

  // getUser(userID: string) {
  //   this.firebaseService.getUser(userID);
  // }
  getUserDetails(userId: string): void {
    if (!userId) {
      this.dialogService.openDialog('Error', 'No user ID provided!', 'error');
      return;
    }
  
    // console.log('Fetching user details for ID:', userId);
  
    const userRef = doc(this.firebaseService.firestore, 'users', userId);
  
    onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists()) {
        const userData = docSnap.data();
        // console.log('User document found:', userData);
  
        this.user = new User({ ...userData, uid: docSnap.id });
        // console.log('User object after instantiation:', this.user);
      } else {
        this.dialogService.openDialog('Error', 'User not found in Firestore!', 'error');
      }
    });
  
    this.isGuest = this.authService.isGuestUser();
    // console.log('Is guest user?', this.isGuest);
  }
  

  editUserDetail() {
    if (this.user) {
      const dialog = this.dialog.open(DialogEditUserDetailComponent);
      dialog.componentInstance.user = new User(this.user.toPlainObject());
    }
  }

  editUserAddress() {
    if (this.user) {
      const dialog = this.dialog.open(DialogEditUserAddressComponent);
      dialog.componentInstance.user = new User(this.user.toPlainObject());
    }
  }
  getFormattedBirthDate(): string {
    return this.sharedService.formatTimestampToDate(this.user?.birthDate || 0);
  }

  editUserDetails() {
    if (this.user) {
      const dialog = this.dialog.open(DialogEditUserDetailsComponent);
      dialog.componentInstance.user = new User(this.user.toPlainObject());
    }
  }

  openEmailDialog(): void {
    if (this.userId === this.userIdCheck) {
      this.dialog.open(DialogEditUserEmailComponent, {
        width: '400px',
      });
    } else {
      this.dialogService.openDialog('Error', 'You are not authorized to change the email.', 'error');
    }
  }

  openPasswordDialog(): void {
    if (this.userId === this.userIdCheck) {
      this.dialog.open(DialogEditUserPasswordComponent, {
        width: '400px',
      });
    } else {
      this.dialogService.openDialog('Error', 'You are not authorized to change the password.', 'error'); 
    }
  }

  deleteUser() {
    if (this.user) {
      this.dialogService.openDialog('Confirm', 'Are you sure you want to delete this user?', 'confirm').then((confirmed) => {
        if (confirmed) {
          this.loadingService.show(); 
          this.userService.deleteUser(this.user?.uid as string).then((deleted) => {
            if (deleted) {
              setTimeout(() => {
                this.router.navigate(['/main/user']);
                this.loadingService.hide(); 
              }, 1500); 
              this.snackbarService.success('User deleted successfully!');
            } else {
              this.loadingService.hide(); 
            }
          }).catch(error => {
            this.dialogService.openDialog('Error', 'Error deleting user: ' + error.message, 'error'); // msg
            this.loadingService.hide(); 
          });
        }
      });
    }
  }
}
