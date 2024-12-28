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


  getUsers(): Observable<User[]> {
    return collectionData(this.userCollection, { idField: 'id' }) as Observable<User[]>;
  }


   /**
   * Fügt einen neuen Benutzer zur Firestore-Datenbank hinzu.
   * @param user Der Benutzer, der hinzugefügt werden soll.
   * @returns Promise mit dem Ergebnis der Operation.
   */
   async addUser(user: User): Promise<void> {
    const userData = user.toPlainObject();
  
    // Entferne undefined-Werte
    Object.keys(userData).forEach((key) => {
      if (userData[key] === undefined) {
        delete userData[key];
      }
    });
  
    // Dokument mit der UID als ID erstellen
    const userDocRef = doc(this.userCollection, user.uid); 
    await setDoc(userDocRef, userData);
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
