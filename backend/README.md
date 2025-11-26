# PHP Backend Setup for Contact Form

## Error: ERR_CONNECTION_REFUSED

If you see this error, it means no PHP server is running. Follow one of the options below:

---

## Option 1: PHP Built-in Server (Recommended - Simple & Fast)

### Requirements
- PHP 7.4 or higher installed on your system

### Check if PHP is installed:
```powershell
php -v
```

### If PHP is NOT installed:
1. Download PHP from: https://windows.php.net/download/
2. Extract to `C:\php`
3. Add `C:\php` to System PATH
4. Restart PowerShell

### Start the server:
```powershell
cd "C:\Users\basto\OneDrive\Desktop\Projekte Programmieren\basti-crm\backend"
php -S localhost:8000
```

### Configure Angular:
The contact component is already configured for port 8000:
```typescript
private phpEndpoint = 'http://localhost:8000/contact.php';
```

---

## Option 2: XAMPP (Full-featured, includes MySQL)

### Install XAMPP:
1. Download from: https://www.apachefriends.org/
2. Install to `C:\xampp`
3. Start Apache in XAMPP Control Panel

### Move backend files:
```powershell
# Create backend folder in XAMPP
New-Item -ItemType Directory -Force -Path "C:\xampp\htdocs\backend"

# Copy PHP files
Copy-Item "C:\Users\basto\OneDrive\Desktop\Projekte Programmieren\basti-crm\backend\*.php" -Destination "C:\xampp\htdocs\backend\"
```

### Configure Angular:
Update contact.component.ts line 35:
```typescript
private phpEndpoint = 'http://localhost/backend/contact.php';
```

---

## Option 3: Production Deployment

Upload the `backend` folder to your web server via FTP/cPanel, then update the endpoint:
```typescript
private phpEndpoint = 'https://yourdomain.com/backend/contact.php';
```

For production with SMTP, use `contact-smtp.php` instead and configure credentials inside the file.

---

## Testing

1. Start your PHP server (Option 1 or 2)
2. Start Angular dev server: `npm start`
3. Navigate to http://localhost:4200/contact
4. Fill out the form and submit
5. Check console for success/error messages

---

## Troubleshooting

### CORS Errors
The PHP files already include CORS headers. If you still get CORS errors, ensure your PHP server is running.

### Email not sending
- **Test mode (mail())**: Requires PHP mail configuration in php.ini
- **Production (PHPMailer)**: Use `contact-smtp.php` with valid SMTP credentials

### Port conflicts
If port 8000 is in use, try 8080 or 3000:
```powershell
php -S localhost:8080
```
Then update the Angular endpoint URL accordingly.
