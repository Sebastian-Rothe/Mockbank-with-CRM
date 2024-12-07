import { Injectable, inject } from '@angular/core';
import { Firestore, DocumentReference, DocumentData, collection, collectionData, addDoc, doc, updateDoc, deleteDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { User } from '../../models/user.class';
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
}
