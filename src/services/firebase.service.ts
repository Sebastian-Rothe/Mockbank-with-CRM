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
    category?: string // Neuer Parameter
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

      const transfer = new Transfer({
        senderAccountId,
        senderAccountName: senderData.accountName,
        senderUserId: senderData.userId,
        receiverAccountId,
        receiverAccountName: receiverData.accountName,
        receiverUserId: receiverData.userId,
        amount,
        description,
        category, // Kategorie wird hinzugefügt
      });

      const transferDocRef = doc(
        collection(this.firestore, 'transfers'),
        transfer.transferId
      );
      await setDoc(transferDocRef, transfer.toPlainObject());

      await updateDoc(senderDocRef, { balance: senderData.balance - amount });
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

  // async getAccount(accountId: string): Promise<{ name: string; balance: number }> {
  //   const accountDocRef = doc(this.firestore, 'accounts', accountId);
  //   const accountSnap = await getDoc(accountDocRef);

  //   if (accountSnap.exists()) {
  //     return accountSnap.data() as { name: string; balance: number };
  //   } else {
  //     throw new Error('Account not found');
  //   }
  // }
  // Beispiel einer getAccount Methode
  // async getAccount(accountId: string): Promise<any> {
  //   const accountRef = this.firestore.collection('accounts').doc(accountId);
  //   const accountSnapshot = await accountRef.get();
  //   if (accountSnapshot.exists) {
  //     return accountSnapshot.data(); // Gibt die Account-Daten als JSON zurück
  //   } else {
  //     throw new Error('Account not found');
  //   }
  // }
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
  // async calculateAndDistributeInterest(): Promise<void> {
  //   try {
  //     // 1. Alle Benutzer abrufen, aber das Bankkonto ignorieren
  //     let users = await this.getAllUsers();
  //     users = users.filter(user => user.uid !== 'yBr3oAoV5HOBEHBxmTEcFwmR06H2'); // Falls die Bank ein eigenes Benutzerkonto hat

  //     if (users.length === 0) return;

  //     // 2. Zinssatz aus der "bank"-Collection abrufen
  //     const bankDocRef = doc(this.firestore, 'bank', 'mainBank');
  //     const bankSnap = await getDoc(bankDocRef);
  //     if (!bankSnap.exists()) {
  //       console.error('Bank data not found!');
  //       return;
  //     }
  //     const bankData = bankSnap.data();
  //     const interestRate = bankData['interestRate']; // Zinssatz in Prozent

  //     for (const user of users) {
  //       if (!user.accounts || user.accounts.length === 0) continue;

  //       // 3. Gesamtvermögen des Benutzers berechnen
  //       let totalBalance = 0;
  //       for (const accountId of user.accounts) {
  //         const accountData = await this.getAccount(accountId);
  //         totalBalance += accountData.balance || 0;
  //       }

  //       // 4. Zinsen berechnen
  //       const interestAmount = (totalBalance * interestRate) / 100;
  //       if (interestAmount <= 0) continue;

  //       // 5. Zinsen auf das erste Konto des Users überweisen
  //       const primaryAccountId = user.accounts[0];
  //       await this.transferFunds('ACC-1738235430074-182', primaryAccountId, interestAmount, 'Zinsgutschrift', 'Interest');

  //       console.log(`Interest of ${interestAmount} EUR credited to ${user.uid} (${primaryAccountId})`);
  //     }
  //   } catch (error) {
  //     console.error('Error calculating interest:', error);
  //   }
  // }

  // async calculateAndDistributeInterest(user: User): Promise<void> {
  //   try {
  //     // Alle bisherigen Transfers des Benutzers abrufen
  //     const transfers = await this.getTransfersForUser(user);
  //     const interestRate = 5; // Beispiel-Zinssatz, kann aus der Bank-Collection kommen
  //     const totalBalance = await this.getTotalBalanceForUser(user); // Gesamtvermögen des Users berechnen
  //     const interestAmount = (totalBalance * interestRate) / 100;

  //     // Überprüfe, ob bereits Zinsen für den Zeitraum bezahlt wurden
  //     const lastInterestTransfer = transfers
  //       .filter(transfer => transfer.category === 'Interest') // Nur Zins-Transfers filtern
  //       .sort((a, b) => b.createdAt - a.createdAt)[0]; // Den letzten Zins-Transfer finden

  //     // Falls kein Transfer existiert oder der Transfer zu alt ist
  //     const timeSinceLastInterest = lastInterestTransfer
  //       ? Date.now() - lastInterestTransfer.createdAt
  //       : Date.now() - user.createdAt;

  //     // Berechne, ob genug Zeit vergangen ist, um Zinsen zu berechnen
  //     if (timeSinceLastInterest >= 86400000) { // 86400000 ms = 1 Tag
  //       // Zinsen berechnen und auf das Konto des Users überweisen
  //       await this.transferFunds(user.accounts[0], user.accounts[0], interestAmount, 'Zinsgutschrift', 'Interest');
  //       console.log(`Zinsen von ${interestAmount} EUR wurden dem Benutzer ${user.uid} gutgeschrieben.`);
  //     }
  //   } catch (error) {
  //     console.error('Fehler bei der Berechnung der Zinsen:', error);
  //   }
  // }

  async calculateAndDistributeInterest(user: User): Promise<void> {
    try {
      // 1. Retrieve all the user's previous transfers
      const transfers = await this.getTransfersForUser(user);

      // 2. Check how much time has passed since the user was created
      const timeSinceCreated = Date.now() - user.createdAt;
      const minutesSinceCreated = Math.floor(timeSinceCreated / 60000); // Convert to minutes

      // 3. Check if interest has already been paid
      let lastInterestTransferDate = user.createdAt; // Default to creation date if no interest has been paid
      const lastInterestTransfer = transfers
        .filter((transfer) => transfer.category === 'Interest') // Filter only interest transfers
        .sort((a, b) => b.createdAt - a.createdAt)[0]; // Get the latest interest transfer

      if (lastInterestTransfer) {
        lastInterestTransferDate = lastInterestTransfer.createdAt;
      }

      const timeSinceLastInterest = Date.now() - lastInterestTransferDate;
      const hoursSinceLastInterest = Math.floor(
        timeSinceLastInterest / 3600000
      ); // Convert to hours

      // Special case: First interest payment after 3 minutes
      let interestStart = lastInterestTransferDate; // Start of the interest calculation
      if (minutesSinceCreated >= 3 && !lastInterestTransfer) {
        console.log('First interest payment after 3 minutes.');
        interestStart = user.createdAt; // If first time, start from user creation
      }
      // Regular interest payment every 2 hours
      else if (hoursSinceLastInterest < 2) {
        console.log('Interest has already been paid within the last 2 hours.');
        return;
      }

      // 4. Calculate the total balance of the user
      let totalBalance = 0;
      for (const accountId of user.accounts) {
        const accountData = await this.getAccount(accountId);
        totalBalance += accountData.balance || 0;
      }

      // 5. Retrieve the interest rate from the bank data collection
      const bankDocRef = doc(this.firestore, 'bank', 'mainBank');
      const bankSnap = await getDoc(bankDocRef);
      if (!bankSnap.exists()) {
        console.error('Bank data not found!');
        return;
      }
      const bankData = bankSnap.data();
      const interestRate = bankData['interestRate']; // Interest rate in percentage

      // 6. Calculate interest
      const interestAmountPerHour = (totalBalance * interestRate) / 100 / 24; // Interest per hour (now correctly divided by 24)
      const totalInterestAmount =
        interestAmountPerHour * hoursSinceLastInterest;

      if (totalInterestAmount <= 0) {
        console.log('No interest to pay.');
        return;
      }

      // 7. Create an interest transfer for the calculated amount
      const primaryAccountId = user.accounts[0]; // The user's first account
      const interestEnd = Date.now(); // End of the interest calculation

      const timestamp = Number(interestStart);
      await this.transferFunds(
        'ACC-1738235430074-182', // The bank account from which interest will be paid (placeholder)
        primaryAccountId,
        totalInterestAmount,
        `Interest credit from ${new Date(
          timestamp
        ).toLocaleString()} to ${new Date(interestEnd).toLocaleString()}`, // Transfer description
        'Interest' // Category
      );

      console.log(
        `Interest amount of ${totalInterestAmount} EUR credited to account ${primaryAccountId} of user ${
          user.uid
        } for the period from ${new Date(
          interestStart
        ).toLocaleString()} to ${new Date(interestEnd).toLocaleString()}.`
      );
    } catch (error) {
      console.error('Error calculating and distributing interest:', error);
    }
  }
}
