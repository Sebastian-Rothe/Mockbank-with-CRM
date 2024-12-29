import { Injectable } from '@angular/core';
import {
  Auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  User,
  UserCredential,
} from '@angular/fire/auth';
import { Observable } from 'rxjs';
import { onAuthStateChanged } from 'firebase/auth';

@Injectable({
  providedIn: 'root',
})
export class FirebaseAuthService {
  private uid: string | null = null; // UID speichern
  constructor(private auth: Auth) {
    this.getCurrentUser().subscribe((user) => {
      this.uid = user?.uid || null;
    });
  }

  async register(email: string, password: string): Promise<User> {
    const userCredential = await createUserWithEmailAndPassword(
      this.auth,
      email,
      password
    );
    this.uid = userCredential.user.uid; // UID setzen
    return userCredential.user;
  }

  // Anmeldung
  async login(email: string, password: string): Promise<User> {
    const userCredential = await signInWithEmailAndPassword(
      this.auth,
      email,
      password
    );
    this.uid = userCredential.user.uid; // UID setzen
    return userCredential.user;
  }

  // Abmelden
  async logout(): Promise<void> {
    await signOut(this.auth);
    this.uid = null; // UID zurücksetzen
  }

  // Benutzerstatus beobachten
  getCurrentUser(): Observable<User | null> {
    return new Observable((observer) => {
      const unsubscribe = onAuthStateChanged(this.auth, (user) => {
        observer.next(user);
      });
      return { unsubscribe };
    });
  }
  getUid(): string | null {
    return this.uid;
  }
}
