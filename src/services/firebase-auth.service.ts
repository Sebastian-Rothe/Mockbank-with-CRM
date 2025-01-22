import { Injectable } from '@angular/core';
import {
  Auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateEmail,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
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
    // Auth-State überwachen und UID setzen
    onAuthStateChanged(this.auth, (user) => {
      const uid = user?.uid || null;
      this.uidSubject.next(uid);
    });
  }

  /**
   * Registriert einen neuen Benutzer.
   */
  async register(email: string, password: string): Promise<User> {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        this.auth,
        email,
        password
      );
      this.uidSubject.next(userCredential.user.uid);
      return userCredential.user;
    } catch (error) {
      console.error('Registrierungsfehler:', error);
      throw error;
    }
  }

  /**
   * Meldet einen Benutzer an.
   */
  async login(email: string, password: string): Promise<User> {
    try {
      const userCredential = await signInWithEmailAndPassword(
        this.auth,
        email,
        password
      );
      this.uidSubject.next(userCredential.user.uid);
      return userCredential.user;
    } catch (error) {
      console.error('Anmeldefehler:', error);
      throw error;
    }
  }

  /**
   * Meldet den aktuellen Benutzer ab.
   */
  async logout(): Promise<void> {
    try {
      await signOut(this.auth);
      this.uidSubject.next(null);
    } catch (error) {
      console.error('Fehler beim Abmelden:', error);
      throw error;
    }
  }

  /**
   * Gibt den aktuellen Benutzer als Observable zurück.
   */
  getCurrentUser(): Observable<User | null> {
    return new Observable((observer) => {
      const unsubscribe = onAuthStateChanged(this.auth, (user) => {
        observer.next(user);
      });
      return { unsubscribe };
    });
  }

  /**
   * Gibt die aktuelle UID synchron zurück.
   */
  getUid(): string | null {
    return this.uidSubject.getValue();
  }

  /**
   * Aktualisiert die E-Mail des Benutzers.
   */
  async updateEmail(newEmail: string): Promise<void> {
    const user = this.auth.currentUser;
    if (!user) {
      throw new Error('Kein Benutzer angemeldet.');
    }

    try {
      await updateEmail(user, newEmail);
      console.log('E-Mail erfolgreich aktualisiert.');
    } catch (error) {
      console.error('Fehler beim Aktualisieren der E-Mail:', error);
      throw error;
    }
  }

  /**
   * Aktualisiert das Passwort des Benutzers.
   */
  async updatePassword(newPassword: string): Promise<void> {
    const user = this.auth.currentUser;
    if (!user) {
      throw new Error('Kein Benutzer angemeldet.');
    }

    try {
      await updatePassword(user, newPassword);
      console.log('Passwort erfolgreich aktualisiert.');
    } catch (error) {
      console.error('Fehler beim Aktualisieren des Passworts:', error);
      throw error;
    }
  }

  /**
   * Authentifiziert den Benutzer erneut (z.B. vor sensiblen Änderungen).
   */
  async reauthenticate(email: string, password: string): Promise<void> {
    const user = this.auth.currentUser;
    if (!user) {
      throw new Error('Kein Benutzer angemeldet.');
    }

    const credential = EmailAuthProvider.credential(email, password);

    try {
      await reauthenticateWithCredential(user, credential);
      console.log('Benutzer erfolgreich erneut authentifiziert.');
    } catch (error) {
      console.error('Fehler bei der erneuten Authentifizierung:', error);
      throw error;
    }
  }
}
