import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FirebaseService } from '../services/firebase.service';
import { User } from '../../models/user.class';
import { MatCard, MatCardContent } from '@angular/material/card';
@Component({
  selector: 'app-user-detail',
  standalone: true,
  imports: [MatCard, MatCardContent],
  templateUrl: './user-detail.component.html',
  styleUrl: './user-detail.component.scss',
})
export class UserDetailComponent implements OnInit {
  userId = '';
  user: User | null = null;
  constructor(private route: ActivatedRoute, private firebaseService: FirebaseService) {}

  ngOnInit() {
    this.route.params.subscribe((params) => (this.userId = params['id']));
    console.log(this.userId);
    this.getUserDetails(this.userId);
  }
  async getUserDetails(userId: string): Promise<void> {
    this.user = await this.firebaseService.getUser(userId);
    if (this.user) {
      console.log('User fetched:', this.user);
    } else {
      console.log('User not found');
    }
  }

}
