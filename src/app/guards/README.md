# Route Guards

Diese Guards schützen Routen vor unberechtigtem Zugriff.

## 🛡️ Verfügbare Guards

### 1. **authGuard**
Schützt Routen, die eine Authentifizierung erfordern.

**Verwendung:**
```typescript
{
  path: 'main',
  component: MainContentComponent,
  canActivate: [authGuard],
  children: [...]
}
```

### 2. **roleGuard**
Schützt Routen basierend auf Benutzerrollen (admin, user, guest, management).

**Verwendung:**
```typescript
{
  path: 'user',
  component: UserComponent,
  canActivate: [roleGuard],
  data: { roles: ['admin', 'management'] }
}
```

### 3. **guestGuard**
Verhindert Zugriff für Gast-Benutzer.

**Verwendung:**
```typescript
{
  path: 'new-admin',
  component: CreateNewAdminComponent,
  canActivate: [guestGuard]
}
```

## 📋 Kombinierte Verwendung

Guards können kombiniert werden:

```typescript
{
  path: 'admin-panel',
  component: AdminPanelComponent,
  canActivate: [authGuard, roleGuard, guestGuard],
  data: { roles: ['admin'] }
}
```

## 🔒 Best Practices

1. **authGuard** immer als erstes in der Liste
2. **roleGuard** für rollenbasierte Zugriffssteuerung
3. **guestGuard** für Features, die echte Accounts erfordern
4. Guards zeigen automatisch Fehlermeldungen über SnackbarService
