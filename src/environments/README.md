# Environment Configuration

## 🔐 Sicherheitshinweise

Die Dateien `environment.ts` und `environment.development.ts` enthalten sensible Firebase-Credentials und werden **NICHT** in Git committed.

## 📋 Setup-Anleitung

### Für neue Entwickler / nach dem Clone:

1. **Kopiere die Template-Datei:**
   ```bash
   # Windows PowerShell
   Copy-Item src/environments/environment.example.ts src/environments/environment.ts
   Copy-Item src/environments/environment.example.ts src/environments/environment.development.ts
   ```

2. **Trage deine Firebase-Credentials ein:**
   - Öffne `environment.ts` und `environment.development.ts`
   - Ersetze die Platzhalter mit den echten Werten aus der Firebase Console
   - Für `environment.ts`: Setze `production: true`
   - Für `environment.development.ts`: Belasse `production: false`

3. **Firebase Credentials erhalten:**
   - Gehe zu [Firebase Console](https://console.firebase.google.com/)
   - Wähle dein Projekt aus
   - Gehe zu Projekteinstellungen → Allgemein
   - Scrolle zu "Deine Apps" → Web-App
   - Kopiere die Config-Werte

## 📁 Datei-Übersicht

| Datei | Beschreibung | In Git? |
|-------|--------------|---------|
| `environment.example.ts` | Template mit Platzhaltern | ✅ Ja |
| `environment.ts` | Production Config | ❌ Nein |
| `environment.development.ts` | Development Config | ❌ Nein |

## ⚠️ Wichtig

- **NIE** die echten Credentials in `environment.example.ts` eintragen
- **NIE** `environment.ts` oder `environment.development.ts` commiten
- Bei Problemen: Prüfe, ob die Dateien korrekt in `.gitignore` eingetragen sind
