import { Injectable, inject } from '@angular/core';
import { Firestore, DocumentReference, DocumentData, collection, collectionData, addDoc, doc, setDoc, updateDoc, deleteDoc, getDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { User } from '../models/user.class';
import { Transfer } from '../models/transfer.class';
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
        fullname: `${user.firstName} ${user.lastName}`, // Vollständiger Name des Benutzers
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


  async transferFunds(
    senderAccountId: string,
    receiverAccountId: string,
    amount: number,
    description?: string
  ): Promise<void> {
    try {
      // Zugriff auf Sender- und Empfänger-Dokumente
      const senderDocRef = doc(this.accountCollection, senderAccountId);
      const receiverDocRef = doc(this.accountCollection, receiverAccountId);
  
      const senderSnap = await getDoc(senderDocRef);
      const receiverSnap = await getDoc(receiverDocRef);
  
      // Sicherstellen, dass beide Dokumente existieren
      if (!senderSnap.exists() || !receiverSnap.exists()) {
        throw new Error('Sender or receiver account not found.');
      }
  
      // Typisierte Daten abrufen
      const senderData = senderSnap.data() as { balance: number; fullname: string };
      const receiverData = receiverSnap.data() as { balance: number; fullname: string };
  
      // Prüfen, ob der Sender genügend Guthaben hat
      if (senderData.balance < amount) {
        throw new Error('Insufficient funds.');
      }
  
      // Transfer-Daten erstellen
      const transfer = new Transfer({
        senderAccountId,
        senderFullName: senderData.fullname,
        receiverAccountId,
        receiverFullName: receiverData.fullname,
        amount,
        description,
      });
  
      // Transfer in Firestore speichern
      const transferDocRef = doc(collection(this.firestore, 'transfers'), transfer.transferId);
      await setDoc(transferDocRef, transfer.toPlainObject());
  
      // Kontostände aktualisieren
      await updateDoc(senderDocRef, { balance: senderData.balance - amount });
      await updateDoc(receiverDocRef, { balance: receiverData.balance + amount });
  
      console.log('Transfer completed successfully!');
    } catch (error) {
      console.error('Error processing transfer:', error);
      throw error;
    }
  }


  async getAccount(accountId: string): Promise<{ name: string; balance: number }> {
    const accountDocRef = doc(this.firestore, 'accounts', accountId);
    const accountSnap = await getDoc(accountDocRef);
  
    if (accountSnap.exists()) {
      return accountSnap.data() as { name: string; balance: number };
    } else {
      throw new Error('Account not found');
    }
  }
  
  
}
