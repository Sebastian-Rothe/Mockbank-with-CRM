import { Injectable, inject } from '@angular/core';
import { Firestore, DocumentReference, DocumentData, collection, collectionData, addDoc, doc, setDoc, updateDoc, deleteDoc, getDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { User } from '../models/user.class';
@Injectable({
  providedIn: 'root'
})
export class FirebaseService {

  firestore: Firestore = inject(Firestore);

  private userCollection = collection(this.firestore, 'users');
  private accountCollection = collection(this.firestore, 'accounts');


  getUsers(): Observable<User[]> {
    return collectionData(this.userCollection, { idField: 'id' }) as Observable<User[]>;
  }


  //  /**
  //  * Fügt einen neuen Benutzer zur Firestore-Datenbank hinzu.
  //  * @param user Der Benutzer, der hinzugefügt werden soll.
  //  * @returns Promise mit dem Ergebnis der Operation.
  //  */
  //  async addUser(user: User): Promise<void> {
  //   const userData = user.toPlainObject();
  
  //   // Entferne undefined-Werte
  //   Object.keys(userData).forEach((key) => {
  //     if (userData[key] === undefined) {
  //       delete userData[key];
  //     }
  //   });
  
  //   // Dokument mit der UID als ID erstellen
  //   const userDocRef = doc(this.userCollection, user.uid); 
  //   await setDoc(userDocRef, userData);
  // }



  /**
   * Fügt einen Benutzer mit einem zugehörigen Account hinzu.
   * @param user Der Benutzer, der hinzugefügt werden soll.
   * @param initialBalance Startguthaben für den Account.
   * @returns Promise mit dem Ergebnis der Operation.
   */
  async addUserWithAccount(user: User): Promise<void> {
    try {
      // Schritt 1: Benutzer-Daten vorbereiten
      const userData = user.toPlainObject();
      Object.keys(userData).forEach((key) => {
        if (userData[key] === undefined) {
          delete userData[key];
        }
      });

      // Schritt 2: Benutzer-Dokument erstellen
      const userDocRef = doc(this.userCollection, user.uid);
      await setDoc(userDocRef, { ...userData, accounts: [] }); // Initialisiere accounts als leeres Array

      // Schritt 3: Account erstellen
      const accountId = `ACC-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const accountData = {
        accountId,
        userId: user.uid,
        balance: 1000,
        currency: 'EUR',
        createdAt: Date.now(),
      };
      const accountDocRef = doc(this.accountCollection, accountId);
      await setDoc(accountDocRef, accountData);

      // Schritt 4: Account-ID zum Benutzer-Dokument hinzufügen
      await updateDoc(userDocRef, {
        accounts: [accountId] // Füge die Account-ID ins Array hinzu
      });

      console.log('User and account created successfully!');
    } catch (error) {
      console.error('Error creating user and account:', error);
      throw error; // Fehler weitergeben
    }
  }




  async getUser(userId: string): Promise<User | null> {
    try {
      // Zugriff auf das spezifische Dokument in der "users"-Sammlung
      const userDocRef = doc(this.firestore, 'users', userId);
      const userDocSnap = await getDoc(userDocRef);
      
      // Prüfen, ob das Dokument existiert
      if (userDocSnap.exists()) {
        // Wenn das Dokument existiert, gebe es als User-Objekt zurück und setze die ID
        const userData = userDocSnap.data();
        const user = new User(userData);
        user.uid = userDocSnap.id;  // Hier wird die ID hinzugefügt
        return user;
      } else {
        console.log('No such user!');
        return null;
      }
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  }
  
}
