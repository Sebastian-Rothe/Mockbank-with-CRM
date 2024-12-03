import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideAnimationsAsync(),
    provideFirebaseApp(() =>
      initializeApp({
        apiKey: "AIzaSyCJlPzQrrMLsAZVA74wbTDeluBCA2KTbdo",
        authDomain: "simplecrm-a9b92.firebaseapp.com",
        projectId: "simplecrm-a9b92",
        storageBucket: "simplecrm-a9b92.firebasestorage.app",
        messagingSenderId: "155952910222",
        appId: "1:155952910222:web:0becb70a8b451de6cc1edf"
      })
    ),
    provideFirestore(() => getFirestore()),
  ],
};
