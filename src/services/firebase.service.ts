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
  increment,
  onSnapshot
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
      console.error('Error when calling up all transfers:', error);
      throw error;
    }
  }

// new code addUserWithAccount
  async addUserWithAccount(user: User): Promise<void> {
    try {
      const userData = this.cleanUserData(user);
      if (!user.uid) {
        throw new Error('User ID is undefined');
      }
      const userDocRef = await this.createUserDoc(user.uid, userData);
      const accountId = await this.createAccountDoc(user);
      await this.updateUserAccounts(userDocRef, accountId);
      console.log('User and account created successfully!');
    } catch (error) {
      console.error('Error creating user and account:', error);
      throw error;
    }
  }
  
  cleanUserData(user: User): any {
    const data = user.toPlainObject();
    Object.keys(data).forEach(key => {
      if (data[key] === undefined) delete data[key];
    });
    return data;
  }
  
  async createUserDoc(uid: string, data: any): Promise<DocumentReference> {
    const userDocRef = doc(this.userCollection, uid);
    await setDoc(userDocRef, { ...data, accounts: [] });
    return userDocRef;
  }
  
  async createAccountDoc(user: User): Promise<string> {
    const accountId = `ACC-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const accountData = {
      accountId,
      userId: user.uid,
      fullname: `${user.firstName} ${user.lastName}`,
      balance: 1000,
      currency: 'EUR',
      createdAt: Date.now(),
    };
    const accountDocRef = doc(this.accountCollection, accountId);
    await setDoc(accountDocRef, accountData);
    return accountId;
  }
  
  async updateUserAccounts(
    userDocRef: DocumentReference,
    accountId: string
  ): Promise<void> {
    const userSnap = await getDoc(userDocRef);
    if (userSnap.exists()) {
      const userData = userSnap.data();
      const accounts = userData['accounts'] || [];
      accounts.push(accountId);
      await updateDoc(userDocRef, { accounts });
    } else {
      console.error(`User document not found for ID: ${userDocRef.id}`);
      throw new Error('User document not found');
    }
  }
 // End of new code addUserWithAccount -------------------------
//  ----------------------------

/**
 * Retrieves a user by their ID.
 *
 * @param userId - The ID of the user to retrieve.
 * @returns A promise that resolves to a User instance if found, or null otherwise.
 */
async getUser(userId: string): Promise<User | null> {
  try {
    // Reference the specific document in the "users" collection
    const userDocRef = doc(this.firestore, 'users', userId);
    const userDocSnap = await getDoc(userDocRef);

    if (!userDocSnap.exists()) {
      console.log('No such user!');
      return null;
    }

    // console.log('getUser - userDocSnap exists:', userDocSnap.exists(), userDocSnap.data());
    return this.createUserFromSnapshot(userDocSnap);
  } catch (error) {
    console.error('Error getting user:', error);
    return null;
  }
}

/**
 * Creates a User instance from a Firestore document snapshot.
 *
 * @param userDocSnap - The Firestore document snapshot containing user data.
 * @returns A User instance with the UID set.
 */
private createUserFromSnapshot(userDocSnap: any): User {
  const userData = userDocSnap.data();
  const user = new User(userData);
  user.uid = userDocSnap.id;
  return user;
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
 * Retrieves transfers associated with a specific account.
 *
 * This method fetches transfers where the account is either the sender or the receiver.
 *
 * @param accountId - The ID of the account.
 * @returns A promise that resolves to an array of Transfer instances.
 */
async getTransfersForAccount(accountId: string): Promise<Transfer[]> {
  // Create queries for transfers where the account is the sender or receiver.
  const senderQuery = this.createTransfersQuery('senderAccountId', accountId);
  const receiverQuery = this.createTransfersQuery('receiverAccountId', accountId);

  // Fetch transfers concurrently for both queries.
  const [senderTransfers, receiverTransfers] = await Promise.all([
    this.fetchTransfers(senderQuery),
    this.fetchTransfers(receiverQuery),
  ]);

  // Combine the results and return them.
  return [...senderTransfers, ...receiverTransfers];
}

/**
 * Creates a Firestore query for transfers based on a specific field.
 *
 * @param field - The field to filter by (e.g. 'senderAccountId' or 'receiverAccountId').
 * @param value - The value to match for the specified field.
 * @returns A Firestore query instance.
 */
createTransfersQuery(field: string, value: string) {
  return query(collection(this.firestore, 'transfers'), where(field, '==', value));
}

/**
 * Executes the provided Firestore query and maps the results to Transfer instances.
 *
 * @param transfersQuery - The Firestore query for transfers.
 * @returns A promise that resolves to an array of Transfer instances.
 */
async fetchTransfers(transfersQuery: any): Promise<Transfer[]> {
  const snapshot = await getDocs(transfersQuery);
  return snapshot.docs.map((doc) => this.createTransferFromDoc(doc));
}

/**
 * Creates a Transfer instance from a Firestore document snapshot.
 *
 * @param doc - A Firestore document snapshot containing transfer data.
 * @returns A new Transfer instance.
 */
createTransferFromDoc(doc: any): Transfer {
  const transferData = doc.data();
  return new Transfer(transferData);
}


/**
 * Transfers funds from one account to another, applying transaction fees where necessary.
 *
 * @param senderAccountId - ID of the sender's account.
 * @param receiverAccountId - ID of the receiver's account.
 * @param amount - Amount to transfer.
 * @param description - Optional description of the transfer.
 * @param category - Optional category for the transfer.
 * @throws Error if any issue occurs during the transfer process.
 */
async transferFunds(
  senderAccountId: string,
  receiverAccountId: string,
  amount: number,
  description?: string,
  category?: string
): Promise<void> {
  try {
    const [senderData, receiverData] = await this.getAccounts(
      senderAccountId,
      receiverAccountId
    );
    const bankData = await this.getBankData();
    const transactionFee = bankData['transactionFee'];
    const bankAccountId = 'ACC-1738235430074-182';

    const { feeAmount, isBankTransfer } = this.calculateFee(
      senderData,
      receiverData,
      senderAccountId,
      receiverAccountId,
      bankAccountId,
      transactionFee
    );
    // console.log(isBankTransfer); sollten wir den wert an anderer stelle noch brauchen lassen wir ihn vorerst hier!
    

    if (senderData.balance < amount + feeAmount) {
      throw new Error('Insufficient funds for transfer and fee.');
    }

    await this.processTransfer(
      senderData,
      receiverData,
      amount,
      description,
      category,
      feeAmount,
      bankAccountId,
      bankData
    );

    console.log('Transfer completed successfully!');
  } catch (error) {
    console.error('Error processing transfer:', error);
    throw error;
  }
}

/**
 * Retrieves sender and receiver account data from Firestore.
 */
async getAccounts(
  senderAccountId: string,
  receiverAccountId: string
): Promise<[Account, Account]> {
  const senderSnap = await getDoc(doc(this.accountCollection, senderAccountId));
  const receiverSnap = await getDoc(
    doc(this.accountCollection, receiverAccountId)
  );

  if (!senderSnap.exists() || !receiverSnap.exists()) {
    throw new Error('Sender or receiver account not found.');
  }

  return [
    Account.fromJson(senderSnap.data()),
    Account.fromJson(receiverSnap.data()),
  ];
}

/**
 * Retrieves bank data from Firestore.
 */
async getBankData(): Promise<any> {
  const bankDocRef = doc(this.firestore, 'bank', 'mainBank');
  const bankSnap = await getDoc(bankDocRef);

  if (!bankSnap.exists()) {
    throw new Error('Bank data not found.');
  }

  return bankSnap.data();
}

/**
 * Calculates the transaction fee based on transfer type.
 */
private calculateFee(
  senderData: Account,
  receiverData: Account,
  senderAccountId: string,
  receiverAccountId: string,
  bankAccountId: string,
  transactionFee: number
) {
  const isBankTransfer =
    senderAccountId === bankAccountId || receiverAccountId === bankAccountId;
  const isInternalTransfer = senderData.userId === receiverData.userId;

  const feeAmount = isBankTransfer
    ? 0
    : isInternalTransfer
    ? transactionFee * 0.1
    : transactionFee;

  return { feeAmount, isBankTransfer };
}

/**
 * Handles the transfer process, including updating accounts and processing fees.
 */
async processTransfer(
  senderData: Account,
  receiverData: Account,
  amount: number,
  description: string | undefined,
  category: string | undefined,
  feeAmount: number,
  bankAccountId: string,
  bankData: any
) {
  // Transfer erstellen
  const transfer = new Transfer({
    senderAccountId: senderData.accountId,
    senderAccountName: senderData.accountName,
    senderUserId: senderData.userId,
    receiverAccountId: receiverData.accountId,
    receiverAccountName: receiverData.accountName,
    receiverUserId: receiverData.userId,
    amount,
    description,
    category,
  });

  await setDoc(
    doc(collection(this.firestore, 'transfers'), transfer.transferId),
    transfer.toPlainObject()
  );

  // Falls eine Gebühr anfällt, separaten Transfer zur Bank durchführen
  if (feeAmount > 0) {
    await this.processFeeTransfer(senderData, feeAmount, bankAccountId);
    // await this.updateBankBalance(bankData, feeAmount);
  }

  // Kontostände aktualisieren
  await this.updateAccountBalance(senderData.accountId, -amount - feeAmount);
  await this.updateAccountBalance(receiverData.accountId, amount);
}

/**
 * Processes a separate transaction for the transaction fee.
 */
async processFeeTransfer(
  senderData: Account,
  feeAmount: number,
  bankAccountId: string
) {
  const bankTransfer = new Transfer({
    senderAccountId: senderData.accountId,
    senderAccountName: senderData.accountName,
    senderUserId: senderData.userId,
    receiverAccountId: bankAccountId,
    receiverAccountName: 'Main Bank',
    receiverUserId: 'yBr3oAoV5HOBEHBxmTEcFwmR06H2',
    amount: feeAmount,
    description: `Transaction Fee`,
    category: 'Fee',
  });

  await setDoc(
    doc(collection(this.firestore, 'transfers'), bankTransfer.transferId),
    bankTransfer.toPlainObject()
  );
}

/**
 * Updates the total balance of the bank.
 */
// async updateBankBalance(bankData: any, feeAmount: number) {
//   const bankDocRef = doc(this.firestore, 'bank', 'mainBank');
//   await updateDoc(bankDocRef, {
//     totalBalance: (bankData?.['totalBalance'] || 0) + feeAmount,
//   });
// }

/**
 * Updates the balance of a specific account.
 */
private async updateAccountBalance(accountId: string, amountChange: number) {
  const accountDocRef = doc(this.accountCollection, accountId);
  await updateDoc(accountDocRef, {
    balance: increment(amountChange),
  });
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
  
  async getAccountsForUser(userId: string): Promise<Account[]> {
    try {
      const user = await this.getUser(userId);
      if (!user || !user.accounts || user.accounts.length === 0) return [];
      
      const accountPromises = user.accounts.map(accountId => 
        getDoc(doc(this.firestore, 'accounts', accountId))
      );
  
      const accountDocs = await Promise.all(accountPromises);
      return accountDocs
        .filter(doc => doc.exists())
        .map(doc => new Account({ ...doc.data(), accountId: doc.id }));
    } catch (error) {
      console.error('Error loading accounts:', error);
      return [];
    }
  }

  listenForTransfers(user: User): Observable<Transfer[]> {
    return new Observable<Transfer[]>((observer) => {
      const transferRefs = user.accounts.flatMap((accountId) => [
        query(collection(this.firestore, 'transfers'), where('senderAccountId', '==', accountId)),
        query(collection(this.firestore, 'transfers'), where('receiverAccountId', '==', accountId))
      ]);

      const allTransfers: Transfer[] = [];
      const unsubscribes = transferRefs.map((transferRef) => 
        onSnapshot(transferRef, (snapshot) => {
          const transfers = snapshot.docs.map((doc) => new Transfer(doc.data() as Transfer));
          allTransfers.push(...transfers);
          observer.next(allTransfers);
        }, (error) => {
          observer.error(error);
        })
      );

      return () => {
        unsubscribes.forEach((unsubscribe) => unsubscribe());
      };
    });
  }
  
  listenForAccounts(user: User): Observable<Account[]> {
    return new Observable<Account[]>((observer) => {
      const accountRefs = user.accounts.map((accountId) => 
        doc(this.firestore, 'accounts', accountId)
      );

      const unsubscribes = accountRefs.map((accountRef) => 
        onSnapshot(accountRef, (snapshot) => {
          if (snapshot.exists()) {
            const account = new Account({ ...snapshot.data(), accountId: snapshot.id });
            observer.next([account]);
          }
        }, (error) => {
          observer.error(error);
        })
      );

      return () => {
        unsubscribes.forEach((unsubscribe) => unsubscribe());
      };
    });
  }
  
}
