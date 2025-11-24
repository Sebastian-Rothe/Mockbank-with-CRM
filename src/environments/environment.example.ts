// Environment Configuration Template
// ℹ️ Diese Datei dient als Vorlage und WIRD in Git committed
// 
// Setup-Anleitung:
// 1. Kopieren Sie diese Datei nach environment.ts und environment.development.ts
// 2. Ersetzen Sie die Platzhalter mit Ihren echten Firebase-Credentials
// 3. Die environment*.ts Dateien werden automatisch von Git ignoriert

export const environment = {
  production: false, // true für environment.ts, false für environment.development.ts
  firebase: {
    apiKey: 'YOUR_FIREBASE_API_KEY',
    authDomain: 'YOUR_PROJECT.firebaseapp.com',
    projectId: 'YOUR_PROJECT_ID',
    storageBucket: 'YOUR_PROJECT.firebasestorage.app',
    messagingSenderId: 'YOUR_MESSAGING_SENDER_ID',
    appId: 'YOUR_APP_ID'
  }
};
