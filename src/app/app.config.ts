import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { provideAuth, getAuth } from '@angular/fire/auth';


export const appConfig: ApplicationConfig = {
  providers: [
    provideAuth(() => getAuth()),
    provideRouter(routes),
    provideAnimationsAsync(),
    provideFirebaseApp(() =>
      initializeApp({
        apiKey: "AIzaSyA6sjgrec6hzkCFlANaK2QbOg9ln4VyZNQ",
        authDomain: "mb-with-crm.firebaseapp.com",
        projectId: "mb-with-crm",
        storageBucket: "mb-with-crm.firebasestorage.app",
        messagingSenderId: "406632378127",
        appId: "1:406632378127:web:dde6d36e01fdd3090b987a"
      })
    ),
    provideFirestore(() => getFirestore()),
  ],
};
