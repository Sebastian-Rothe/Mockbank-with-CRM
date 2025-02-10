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
  sendEmailVerification,
  sendPasswordResetEmail,
  UserCredential, 
  signInAnonymously,

} from '@angular/fire/auth';
import { Observable, BehaviorSubject, of, switchMap } from 'rxjs';
import { onAuthStateChanged } from 'firebase/auth';
import { Firestore, doc, updateDoc, docData, getDoc, setDoc, deleteDoc } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root',
})
export class FirebaseAuthService {
  user$: Observable<any | null>; // User-Observable
  uid$: BehaviorSubject<string | null>; // ✅ Korrekt: BehaviorSubject erlaubt `.next()`

  constructor(private auth: Auth, private firestore: Firestore) {
    this.uid$ = new BehaviorSubject<string | null>(null); // ✅ Muss BehaviorSubject sein

    onAuthStateChanged(this.auth, (user) => {
      this.uid$.next(user?.uid || null); // ✅ Jetzt funktioniert `.next()`
    });

    this.user$ = this.uid$.pipe(
      switchMap((uid) =>
        uid ? docData(doc(this.firestore, 'users', uid)) : of(null)
      )
    );
  }


  // === alter code!!!!!
  // private uidSubject = new BehaviorSubject<string | null>(null);
  // uid$ = this.uidSubject.asObservable(); // Observable für UID-Änderungen

  // constructor(private auth: Auth,  private firestore: Firestore) {
  //   // Auth-State überwachen und UID setzen
  //   onAuthStateChanged(this.auth, (user) => {
  //     const uid = user?.uid || null;
  //     this.uidSubject.next(uid);
  //   });
  // }

  
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
      this.uid$.next(userCredential.user.uid);
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
      this.uid$.next(userCredential.user.uid);
      return userCredential.user;
    } catch (error) {
      console.error('Anmeldefehler:', error);
      throw error;
    }
  }
  async guestLogin(): Promise<UserCredential | null> {
    try {
      // Anonymes Login durchführen
      const userCredential = await signInAnonymously(this.auth);
      const uid = userCredential.user.uid;

      // Zusätzliche Logik, um den Gast-User zu erstellen
      const userDocRef = doc(this.firestore, 'users', uid);
      const userSnapshot = await getDoc(userDocRef); // Überprüfen, ob der Gast schon existiert

      if (!userSnapshot.exists()) {
        // Falls der Gast-User nicht existiert, erstellen wir ihn mit Standarddaten
        const guestUser = {
          uid,
          firstName: 'Guest',
          lastName: 'User',
          email: 'guest@temporary.com',
          role: 'guest',
          createdAt: Date.now(),
        };

        // Benutzer-Dokument in Firestore speichern
        await setDoc(userDocRef, guestUser);
      }

      return userCredential;
    } catch (error) {
      console.error('Fehler beim Gast-Login:', error);
      throw error;
    }
  }

  
  /**
   * Meldet den aktuellen Benutzer ab.
   */
  async logout(): Promise<void> {
    try {
      const currentUser = this.auth.currentUser;
      
      if (currentUser && currentUser.isAnonymous) {
        // Falls der Benutzer ein Gast ist, löschen wir das Firestore-Dokument
        const userDocRef = doc(this.firestore, 'users', currentUser.uid);
        await deleteDoc(userDocRef); // Löscht das Gast-Dokument aus Firestore
        console.log('Gast-Daten wurden gelöscht.');
      }

      // Abmelden
      await signOut(this.auth);
      this.uid$.next(null);
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
    return this.uid$.getValue();
  }

  /**
   * Aktualisiert die E-Mail des Benutzers.
   */
/**
 * Aktualisiert die E-Mail des Benutzers.
 */

async updateEmail(newEmail: string, password: string): Promise<void> {
  const user = this.auth.currentUser;
  if (!user) {
    throw new Error('Kein Benutzer angemeldet.');
  }

  try {
    // Zuerst den Benutzer re-authentifizieren
    await this.reauthenticate(password);
    console.log('Benutzer erfolgreich erneut authentifiziert.');

    // E-Mail auch im Firestore aktualisieren
    const userDocRef = doc(this.firestore, 'users', user.uid);
    await updateDoc(userDocRef, { email: newEmail });
    console.log('E-Mail im Firestore erfolgreich aktualisiert.');

    // Dann die E-Mail ändern
    await updateEmail(user, newEmail);
    await this.logout();
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
  async reauthenticate(password: string): Promise<void> {
    const user = this.auth.currentUser;
    if (!user || !user.email) {
      throw new Error('Kein Benutzer oder keine E-Mail-Adresse gefunden.');
    }
  
    const credential = EmailAuthProvider.credential(user.email, password);
  
    try {
      await reauthenticateWithCredential(user, credential);
      console.log('Benutzer erfolgreich erneut authentifiziert.');
    } catch (error) {
      console.error('Fehler bei der erneuten Authentifizierung:', error);
      throw error;
    }
  }
  
    /**
   * Sendet eine Verifizierungs-E-Mail an den angemeldeten Benutzer.
   */
    async sendEmailVerification(): Promise<void> {
      const user = this.auth.currentUser;
      if (!user) {
        throw new Error('Kein Benutzer angemeldet.');
      }
  
      try {
        await sendEmailVerification(user);
        console.log('Verifizierungs-E-Mail wurde gesendet.');
        console.log('Verifizierungs-E-Mail gesendet an:', user.email);

      } catch (error) {
        console.error('Fehler beim Senden der Verifizierungs-E-Mail:', error);
        throw error;
      }
    }
    
    async checkEmailVerification(): Promise<boolean> {
      const user = this.auth.currentUser;
      if (!user) {
        throw new Error('Kein Benutzer angemeldet.');
      }
    
      // Benutzerinformationen aktualisieren
      await user.reload();
      return user.emailVerified;
    }

}
