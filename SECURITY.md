# 🔒 Security Documentation

## Implementierte Sicherheitsmaßnahmen

### 1. **Environment Variable Protection** ✅
- Firebase Credentials aus Code entfernt
- Sensitive Daten in `.gitignore` ausgeschlossen
- Template-Dateien für Setup bereitgestellt

**Dateien:**
- `src/environments/environment.ts` (ignoriert)
- `src/environments/environment.development.ts` (ignoriert)
- `src/environments/environment.example.ts` (template)

---

### 2. **Route Guards** ✅

#### **authGuard**
Schützt alle `/main` Routen vor unbefugtem Zugriff.

```typescript
canActivate: [authGuard]
```

**Funktion:**
- Prüft Authentifizierung
- Leitet zu Login um, wenn nicht angemeldet

#### **roleGuard**
Rollenbasierte Zugriffskontrolle für Admin-Bereiche.

```typescript
canActivate: [roleGuard],
data: { roles: ['admin', 'management'] }
```

**Funktion:**
- Prüft Benutzerrolle
- Zeigt Fehlermeldung bei unzureichenden Rechten
- Leitet zu Dashboard um

#### **guestGuard**
Blockiert Gast-Benutzer von sensiblen Features.

```typescript
canActivate: [guestGuard]
```

**Funktion:**
- Verhindert Zugriff für anonyme Benutzer
- Fordert zur Account-Erstellung auf

**Geschützte Routen:**
- `/main/*` - Alle geschützt durch authGuard
- `/main/user` - Nur Admin/Management
- `/main/new-admin` - Nur Admin/Management, keine Gäste

---

### 3. **Input Sanitization** ✅

**SanitizationService** bietet Methoden für:

#### **sanitizeName()**
```typescript
// Entfernt Scripts und gefährliche Zeichen
const cleanName = sanitizationService.sanitizeName(userInput);
```

#### **sanitizeEmail()**
```typescript
// Validiert und normalisiert E-Mail
const email = sanitizationService.sanitizeEmail(input);
```

#### **sanitizeAmount()**
```typescript
// Validiert Geldbeträge
const amount = sanitizationService.sanitizeAmount(input);
```

#### **stripHtml()**
```typescript
// Entfernt alle HTML-Tags
const plain = sanitizationService.stripHtml(html);
```

**Best Practice:**
```typescript
// In Dialogen und Forms
constructor(private sanitization: SanitizationService) {}

onSubmit() {
  this.accountName = this.sanitization.sanitizeAccountText(this.accountName);
  this.amount = this.sanitization.sanitizeAmount(this.amount);
}
```

---

## 🚨 Noch zu implementieren

### **Hohe Priorität:**

1. **Firebase Security Rules** (Firestore & Auth)
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /users/{userId} {
         allow read: if request.auth != null;
         allow write: if request.auth.uid == userId;
       }
       match /accounts/{accountId} {
         allow read, write: if request.auth != null && 
           get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'user'];
       }
     }
   }
   ```

2. **CORS Configuration**
   - Firebase Hosting Headers
   - API Endpoint Protection

3. **Rate Limiting**
   - Verhindert Brute-Force-Angriffe
   - Firebase App Check

### **Mittlere Priorität:**

4. **Content Security Policy (CSP)**
   ```html
   <meta http-equiv="Content-Security-Policy" 
         content="default-src 'self'; script-src 'self' 'unsafe-inline';">
   ```

5. **HTTPS Enforcement**
   - In Firebase Hosting erzwingen
   - Redirect HTTP → HTTPS

6. **Session Management**
   - Auto-Logout bei Inaktivität ✅ (bereits vorhanden)
   - Token Refresh Strategy

### **Niedrige Priorität:**

7. **Audit Logging**
   - Sensitive Aktionen protokollieren
   - Admin-Zugriffe tracken

8. **2FA (Two-Factor Authentication)**
   - Optional für User-Accounts
   - Pflicht für Admin-Accounts

---

## 📋 Sicherheits-Checkliste

### Vor Production Deployment:

- [x] Environment Variables gesichert
- [x] Route Guards implementiert
- [x] Input Sanitization Service
- [ ] Firebase Security Rules deployed
- [ ] API-Key regeneriert und alt invalidiert
- [ ] HTTPS erzwungen
- [ ] CSP Header konfiguriert
- [ ] Security Audit durchgeführt
- [ ] Penetration Testing

### Laufende Wartung:

- [ ] Regelmäßige Dependency Updates
- [ ] Security Patch Monitoring
- [ ] Log-Analyse auf verdächtige Aktivitäten
- [ ] Backup-Strategy für Firestore
- [ ] Incident Response Plan

---

## 🔧 Verwendung in Komponenten

### Beispiel: Account-Name Eingabe
```typescript
import { SanitizationService } from '../services/sanitization.service';

export class DialogEditAccountComponent {
  accountName: string = '';

  constructor(private sanitization: SanitizationService) {}

  saveAccount() {
    // Sanitize vor dem Speichern
    this.accountName = this.sanitization.sanitizeAccountText(this.accountName);
    
    if (this.accountName.length > 0) {
      // Speichern...
    }
  }
}
```

### Beispiel: Betrag-Eingabe
```typescript
onAmountChange(value: string) {
  const sanitized = this.sanitization.sanitizeAmount(value);
  
  if (sanitized === null) {
    this.showError('Invalid amount');
    return;
  }
  
  this.amount = sanitized;
}
```

---

## 🛡️ Sicherheits-Prinzipien

1. **Defense in Depth** - Mehrere Sicherheitsebenen
2. **Least Privilege** - Minimale Rechte pro Rolle
3. **Input Validation** - Nie User-Input vertrauen
4. **Output Encoding** - XSS-Prävention
5. **Secure by Default** - Sicher als Standard

---

## 📞 Security Contacts

**Security Issues melden:**
- E-Mail: security@mockbank.com
- GitHub: Private Security Advisory erstellen

**Nicht öffentlich posten!**
