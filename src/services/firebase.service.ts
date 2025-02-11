import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import {
  Firestore,
  DocumentReference,
  DocumentData,
  collection,
  query,
  where,
  collectionData,
  addDoc,
  arrayRemove,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
} from '@angular/fire/firestore';
// Models
import { User } from '../models/user.class';
import { Transfer } from '../models/transfer.class';
import { Account } from '../models/account.class';
@Injectable({
  providedIn: 'root',
})
export class FirebaseService {
  firestore: Firestore = inject(Firestore);

  private userCollection = collection(this.firestore, 'users');
  private accountCollection = collection(this.firestore, 'accounts');

  getUsers(): Observable<User[]> {
    return collectionData(this.userCollection, { idField: 'id' }) as Observable<
      User[]
    >;
  }

  async getAllUsers(): Promise<User[]> {
    const snapshot = await getDocs(this.userCollection);
    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return new User({ ...data, uid: doc.id }); // User-Klasse instanziieren und die ID hinzufügen
    });
  }
  async getAllTransfers(): Promise<Transfer[]> {
    try {
      const transfersCollection = collection(this.firestore, 'transfers');
      const querySnapshot = await getDocs(transfersCollection);
      return querySnapshot.docs.map(
        (doc) => new Transfer(doc.data() as Transfer)
      );
    } catch (error) {
      console.error('Fehler beim Abrufen aller Transfers:', error);
      throw error;
    }
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
        accounts: [accountId], // Füge die Account-ID ins Array hinzu
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

      console.log(
        'getUser - userDocSnap:',
        userDocSnap.exists(),
        userDocSnap.data()
      );
      // Prüfen, ob das Dokument existiert
      if (userDocSnap.exists()) {
        // Wenn das Dokument existiert, gebe es als User-Objekt zurück und setze die ID
        const userData = userDocSnap.data();
        const user = new User(userData);
        user.uid = userDocSnap.id; // Hier wird die ID hinzugefügt
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

  /**
   * Ruft alle Transfers ab, die mit einem bestimmten Benutzer verknüpft sind (für alle Accounts)
   * @param user Der Benutzer, dessen Transfers abgerufen werden sollen
   * @returns Eine Liste von Transfers, die mit den Accounts des Benutzers in Verbindung stehen
   */
  async getTransfersForUser(user: User): Promise<Transfer[]> {
    try {
      const allTransfers: Transfer[] = [];

      // Durchlaufe alle Accounts des Benutzers
      for (const accountId of user.accounts) {
        const transfersForAccount = await this.getTransfersForAccount(
          accountId
        );
        allTransfers.push(...transfersForAccount); // Füge die Transfers des aktuellen Accounts hinzu
      }

      return allTransfers;
    } catch (error) {
      console.error('Fehler beim Abrufen der Transfers:', error);
      throw error;
    }
  }

  /**
   * Ruft die Transfers für einen bestimmten Account ab
   * @param accountId Die ID des Accounts
   * @returns Eine Liste von Transfers, die mit diesem Account in Verbindung stehen
   */
  private async getTransfersForAccount(accountId: string): Promise<Transfer[]> {
    const senderQuery = query(
      collection(this.firestore, 'transfers'),
      where('senderAccountId', '==', accountId)
    );

    const receiverQuery = query(
      collection(this.firestore, 'transfers'),
      where('receiverAccountId', '==', accountId)
    );

    const senderDocs = await getDocs(senderQuery);
    const receiverDocs = await getDocs(receiverQuery);

    const transfers: Transfer[] = [];

    senderDocs.forEach((doc) => {
      const transferData = doc.data();
      const transfer = new Transfer(transferData);
      transfers.push(transfer);
    });

    receiverDocs.forEach((doc) => {
      const transferData = doc.data();
      const transfer = new Transfer(transferData);
      transfers.push(transfer);
    });

    return transfers;
  }

  async transferFunds(
    senderAccountId: string,
    receiverAccountId: string,
    amount: number,
    description?: string,
    category?: string
  ): Promise<void> {
    try {
      const senderDocRef = doc(this.accountCollection, senderAccountId);
      const receiverDocRef = doc(this.accountCollection, receiverAccountId);

      const senderSnap = await getDoc(senderDocRef);
      const receiverSnap = await getDoc(receiverDocRef);

      if (!senderSnap.exists() || !receiverSnap.exists()) {
        throw new Error('Sender or receiver account not found.');
      }

      const senderData = Account.fromJson(senderSnap.data());
      const receiverData = Account.fromJson(receiverSnap.data());

      if (senderData.balance < amount) {
        throw new Error('Insufficient funds.');
      }

      const bankDocRef = doc(this.firestore, 'bank', 'mainBank');
      const bankSnap = await getDoc(bankDocRef);
      if (!bankSnap.exists()) {
        throw new Error('Bank data not found.');
      }

      const bankData = bankSnap.data();
      const transactionFee = bankData['transactionFee'];
      const bankAccountId = 'ACC-1738235430074-182';

      // Prüfen, ob die Bank involviert ist
      const isBankTransfer =
        senderAccountId === bankAccountId ||
        receiverAccountId === bankAccountId;
      const isInternalTransfer = senderData.userId === receiverData.userId;

      // Gebührenberechnung
      let feeAmount = 0;
      if (!isBankTransfer) {
        feeAmount = isInternalTransfer ? transactionFee * 0.1 : transactionFee; // 10% für interne Transfers, volle Gebühr für externe
      }

      // Prüfen, ob Sender genug Geld für Transfer + Gebühr hat
      if (senderData.balance < amount + feeAmount) {
        throw new Error('Insufficient funds for transfer and fee.');
      }

      // Haupt-Transfer erstellen
      const transfer = new Transfer({
        senderAccountId,
        senderAccountName: senderData.accountName,
        senderUserId: senderData.userId,
        receiverAccountId,
        receiverAccountName: receiverData.accountName,
        receiverUserId: receiverData.userId,
        amount,
        description: description, // ... feeAmount > 0 ? `${description} (Fee: ${feeAmount})` :  lass ich erst mal weg
        category,
      });

      const transferDocRef = doc(
        collection(this.firestore, 'transfers'),
        transfer.transferId
      );
      await setDoc(transferDocRef, transfer.toPlainObject());

      // Gebührentransfer zur Bank erstellen, falls nötig
      if (feeAmount > 0) {
        const bankTransfer = new Transfer({
          senderAccountId,
          senderAccountName: senderData.accountName,
          senderUserId: senderData.userId,
          receiverAccountId: bankAccountId,
          receiverAccountName: 'Main Bank',
          receiverUserId: 'yBr3oAoV5HOBEHBxmTEcFwmR06H2',
          amount: feeAmount,
          description: `Transaction Fee for Transfer ${transfer.transferId}`,
          category: 'Fee',
        });

        const bankTransferDocRef = doc(
          collection(this.firestore, 'transfers'),
          bankTransfer.transferId
        );
        await setDoc(bankTransferDocRef, bankTransfer.toPlainObject());

        // Bank-Konto aktualisieren
        await updateDoc(bankDocRef, {
          totalBalance: (bankData?.['totalBalance'] || 0) + feeAmount,
        });
      }

      // Kontostände aktualisieren
      await updateDoc(senderDocRef, {
        balance: senderData.balance - amount - feeAmount,
      });
      await updateDoc(receiverDocRef, {
        balance: receiverData.balance + amount,
      });

      console.log('Transfer completed successfully!');
    } catch (error) {
      console.error('Error processing transfer:', error);
      throw error;
    }
  }

  async deleteTransfer(transferId: string): Promise<void> {
    try {
      // Zugriff auf das spezifische Transfer-Dokument in Firestore
      const transferDocRef = doc(this.firestore, 'transfers', transferId);
      const transferSnap = await getDoc(transferDocRef);

      // Prüfen, ob das Transfer-Dokument existiert
      if (!transferSnap.exists()) {
        throw new Error('Transfer not found.');
      }

      // Transfer-Daten abrufen
      const transferData = transferSnap.data() as Transfer;

      // Zugriff auf Sender- und Empfängerkonten
      const senderDocRef = doc(
        this.firestore,
        'accounts',
        transferData.senderAccountId
      );
      const receiverDocRef = doc(
        this.firestore,
        'accounts',
        transferData.receiverAccountId
      );

      const [senderSnap, receiverSnap] = await Promise.all([
        getDoc(senderDocRef),
        getDoc(receiverDocRef),
      ]);

      const updates: Promise<void>[] = [];

      // Prüfen, ob das Senderkonto existiert
      if (senderSnap.exists()) {
        const senderAccount = Account.fromJson(senderSnap.data());
        senderAccount.balance += transferData.amount; // Betrag zurückbuchen
        updates.push(updateDoc(senderDocRef, senderAccount.toJson()));
      }

      // Prüfen, ob das Empfängerkonto existiert
      if (receiverSnap.exists()) {
        const receiverAccount = Account.fromJson(receiverSnap.data());
        receiverAccount.balance -= transferData.amount; // Betrag abbuchen
        updates.push(updateDoc(receiverDocRef, receiverAccount.toJson()));
      }

      // Transfer löschen
      updates.push(deleteDoc(transferDocRef));

      // Alle Aktionen parallel ausführen
      await Promise.all(updates);

      console.log(`Transfer ${transferId} successfully deleted.`);
    } catch (error) {
      console.error('Error deleting transfer:', error);
      throw error;
    }
  }

  async getAccount(accountId: string): Promise<any> {
    try {
      // Zugriff auf das Account-Dokument in der "accounts"-Sammlung
      const accountDocRef = doc(this.firestore, 'accounts', accountId);
      const accountSnap = await getDoc(accountDocRef);

      if (accountSnap.exists()) {
        return accountSnap.data();
      } else {
        throw new Error('Account not found');
      }
    } catch (error) {
      console.error('Error getting account:', error);
      throw error;
    }
  }

  async addAccount(
    userId: string,
    accountDetails: { accountName: string; balance: number; currency: string }
  ): Promise<void> {
    try {
      const accountId = `ACC-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const accountData = {
        accountId,
        userId,
        accountName: accountDetails.accountName,
        balance: accountDetails.balance,
        currency: accountDetails.currency,
        createdAt: Date.now(),
      };

      // Account in Firestore hinzufügen
      const accountDocRef = doc(this.accountCollection, accountId);
      await setDoc(accountDocRef, accountData);

      // Account-ID zum Benutzer-Dokument hinzufügen
      const userDocRef = doc(this.firestore, 'users', userId);
      const userSnap = await getDoc(userDocRef);

      if (userSnap.exists()) {
        const userData = userSnap.data();
        const accounts = userData['accounts'] || [];
        accounts.push(accountId);
        await updateDoc(userDocRef, { accounts });
      } else {
        throw new Error('User not found.');
      }
    } catch (error) {
      console.error('Error adding account:', error);
      throw error;
    }
  }

  async updateAccount(accountId: string, accountData: any): Promise<void> {
    try {
      const accountDocRef = doc(this.firestore, 'accounts', accountId);
      await updateDoc(accountDocRef, accountData);
      console.log('Account updated successfully');
    } catch (error) {
      console.error('Error updating account:', error);
      throw error;
    }
  }

  async deleteAccount(accountId: string): Promise<void> {
    try {
      const accountDocRef = doc(this.firestore, 'accounts', accountId);
      await deleteDoc(accountDocRef);
      console.log('Account successfully deleted');
    } catch (error) {
      console.error('Error deleting account:', error);
      throw error;
    }
  }
  async removeAccountFromUser(
    userId: string,
    accountId: string
  ): Promise<void> {
    try {
      const userDocRef = doc(this.firestore, 'users', userId);
      await updateDoc(userDocRef, {
        accounts: arrayRemove(accountId),
      });
      console.log(`Account ${accountId} removed from user ${userId}`);
    } catch (error) {
      console.error('Error removing account from user:', error);
      throw error;
    }
  }

  /**
   * Aktualisiert das Profilbild eines Benutzers.
   * @param userId Die UID des Benutzers, dessen Profilbild aktualisiert werden soll.
   * @param profilePictureUrl Die URL des neuen Profilbildes.
   * @returns Promise<void>
   */
  async updateUserProfilePicture(
    userId: string,
    profilePictureUrl: string
  ): Promise<void> {
    try {
      // Zugriff auf das Benutzer-Dokument in Firestore
      const userDocRef = doc(this.firestore, 'users', userId);

      // Benutzer-Dokument mit der neuen Profilbild-URL aktualisieren
      await updateDoc(userDocRef, { profilePictureUrl });

      console.log('Profile picture updated successfully!');
    } catch (error) {
      console.error('Error updating profile picture:', error);
      throw error; // Fehler weitergeben, um sie an der aufrufenden Stelle zu behandeln
    }
  }

  async calculateAndDistributeInterest(user: User): Promise<void> {
    try {
      // 1. Alle bisherigen Transfers des Users abrufen
      const transfers = await this.getTransfersForUser(user);
  
      // 2. Letzten Zins-Transfer finden
      let lastInterestTransferDate = user.createdAt;
      const lastInterestTransfer = transfers
        .filter((transfer) => transfer.category === 'Interest')
        .sort((a, b) => b.createdAt - a.createdAt)[0];
  
      if (lastInterestTransfer) {
        lastInterestTransferDate = lastInterestTransfer.createdAt;
      }
  
      // 3. Prüfen, ob bereits eine Zahlung geplant oder erfolgt ist
      const timeSinceLastInterest = Date.now() - lastInterestTransferDate;
      const hoursSinceLastInterest = Math.floor(timeSinceLastInterest / 3600000);
      
      // **🔒 Wichtiger Fix: Sicherstellen, dass nicht bereits eine Zahlung in den letzten 5 Sekunden erstellt wurde**
      const lastInterestRecently = transfers.some(
        (t) => t.category === 'Interest' && Date.now() - t.createdAt < 5000
      );
  
      if (lastInterestRecently) {
        console.warn('Verhindert doppelte Zinszahlung: Bereits kürzlich ausgeführt.');
        return;
      }
  
      // **📌 Fix: Erster Zins soll SOFORT ausgezahlt werden**
      let interestStart = lastInterestTransferDate;
      if (!lastInterestTransfer) {
        console.log('Erste Zinszahlung erfolgt sofort nach der User-Erstellung.');
        interestStart = user.createdAt;
      } else if (hoursSinceLastInterest < 2) {
        console.log('Zinsen wurden bereits in den letzten 2 Stunden gezahlt.');
        return;
      }
  
      // 4. Gesamtguthaben des Users berechnen
      let totalBalance = 0;
      for (const accountId of user.accounts) {
        const accountData = await this.getAccount(accountId);
        totalBalance += accountData.balance || 0;
      }
  
      // 5. Zinsrate abrufen
      const bankDocRef = doc(this.firestore, 'bank', 'mainBank');
      const bankSnap = await getDoc(bankDocRef);
      if (!bankSnap.exists()) {
        console.error('Bankdaten nicht gefunden!');
        return;
      }
      const bankData = bankSnap.data();
      const interestRate = bankData['interestRate']; 
  
      // 6. Zinsen berechnen
      const interestAmountPerHour = (totalBalance * interestRate) / 100 / 24; 
      const totalInterestAmount = interestAmountPerHour * hoursSinceLastInterest;
  
      // **✅ Mindestzins anwenden**
      const minimumInterest = 0.01;
      const finalInterestAmount = Math.max(totalInterestAmount, minimumInterest);
  
      if (finalInterestAmount <= 0) {
        console.log('Keine Zinsen zu zahlen.');
        return;
      }
  
      // 7. Zinsen überweisen
      const primaryAccountId = user.accounts[0];
      const interestEnd = Date.now();
  
      await this.transferFunds(
        'ACC-1738235430074-182',
        primaryAccountId,
        finalInterestAmount,
        `Interest credit from ${new Date(interestStart).toLocaleString()} to ${new Date(interestEnd).toLocaleString()}`,
        'Interest'
      );
  
      console.log(`Zinsen von ${finalInterestAmount} EUR für User ${user.uid} gutgeschrieben.`);
  
    } catch (error) {
      console.error('Fehler bei der Zinsberechnung:', error);
    }
  }
  
}
