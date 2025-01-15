import { Injectable } from '@angular/core';
import {
  Auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  User,
} from '@angular/fire/auth';
import { Observable, BehaviorSubject } from 'rxjs';
import { onAuthStateChanged } from 'firebase/auth';

@Injectable({
  providedIn: 'root',
})
export class FirebaseAuthService {
  private uidSubject = new BehaviorSubject<string | null>(null);
  uid$ = this.uidSubject.asObservable(); // Observable für UID-Änderungen

  constructor(private auth: Auth) {
    // Initialisieren und UID setzen
    onAuthStateChanged(this.auth, (user) => {
      const uid = user?.uid || null;
      this.uidSubject.next(uid);
    });
  }

  async register(email: string, password: string): Promise<User> {
    const userCredential = await createUserWithEmailAndPassword(
      this.auth,
      email,
      password
    );
    this.uidSubject.next(userCredential.user.uid); // UID updaten
    return userCredential.user;
  }

  async login(email: string, password: string): Promise<User> {
    const userCredential = await signInWithEmailAndPassword(
      this.auth,
      email,
      password
    );
    this.uidSubject.next(userCredential.user.uid); // UID updaten
    return userCredential.user;
  }

  async logout(): Promise<void> {
    await signOut(this.auth);
    this.uidSubject.next(null); // UID zurücksetzen
  }

  getCurrentUser(): Observable<User | null> {
    return new Observable((observer) => {
      const unsubscribe = onAuthStateChanged(this.auth, (user) => {
        observer.next(user);
      });
      return { unsubscribe };
    });
  }

  // Aktuelle UID synchron abrufen
  getUid(): string | null {
    return this.uidSubject.getValue(); // Aktueller Wert des BehaviorSubjects
  }
}
