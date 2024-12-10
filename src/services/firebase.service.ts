import { Injectable, inject } from '@angular/core';
import { Firestore, DocumentReference, DocumentData, collection, collectionData, addDoc, doc, updateDoc, deleteDoc, getDoc } from '@angular/fire/firestore';
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
   addUser(user: User): Promise<DocumentReference<DocumentData>> {
    const userData = user.toPlainObject();
    Object.keys(userData).forEach(key => {
      if (userData[key] === undefined) {
        delete userData[key];
      }
    });
    return addDoc(this.userCollection, userData);
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
        user.id = userDocSnap.id;  // Hier wird die ID hinzugefügt
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
