# Continental Academy - Hostinger Node.js Hosting

## KORAK 1: Priprema MongoDB Atlas

### 1.1 Kreirajte MongoDB Atlas Account (besplatno)
1. Idite na https://www.mongodb.com/cloud/atlas
2. Registrujte se (besplatno)
3. Kreirajte FREE cluster (M0)

### 1.2 Kreirajte Database User
1. Database Access → Add New Database User
2. Username: `continental_user`
3. Password: generirajte i **ZAPIŠITE**
4. Role: Read and write to any database

### 1.3 Network Access
1. Network Access → Add IP Address
2. Kliknite "Allow Access from Anywhere" (0.0.0.0/0)
3. Confirm

### 1.4 Connection String
1. Database → Connect → Connect your application
2. Kopirajte string:
   ```
   mongodb+srv://continental_user:PASSWORD@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

---

## KORAK 2: Priprema Fajlova

### 2.1 Struktura koju uploadate
```
continental-academy/
├── app.js              ← Glavni fajl (entry point)
├── package.json        
├── .env                ← Kreirajte iz .env.example
├── models/
├── routes/
├── middleware/
└── public/             ← React build (već uključen)
    ├── index.html
    └── static/
```

### 2.2 Kreirajte .env fajl
Kopirajte `.env.example` u `.env` i popunite:
```env
MONGO_URL=mongodb+srv://continental_user:VAS_PASSWORD@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
DB_NAME=continental_academy
JWT_SECRET=vas_random_string_minimum_32_karaktera
JWT_EXPIRES_IN=7d
PORT=3000
```

---

## KORAK 3: Upload na Hostinger

### Opcija A: Putem File Manager-a
1. Ulogujte se na hPanel
2. Idite na File Manager
3. Navigirajte do `public_html` ili Node.js app foldera
4. Upload-ujte sve fajlove

### Opcija B: Putem FTP/SFTP
1. Koristite FileZilla
2. Server: vaša domena ili IP
3. Username/Password: iz hPanel-a
4. Upload sve u odgovarajući folder

### Opcija C: Putem Git
1. Na hPanel idite na Git
2. Povežite GitHub repository
3. Deploy

---

## KORAK 4: Konfiguracija na Hostinger

### 4.1 Node.js Setup
1. Na hPanel idite na **Advanced** → **Node.js**
2. Postavite:
   - **Node.js Version**: 18.x ili 20.x
   - **Application Root**: `/` ili folder gdje ste uploadali
   - **Application Startup File**: `app.js`
   - **Application URL**: vaša domena

### 4.2 Environment Variables
1. Na istoj stranici pronađite "Environment Variables" ili ".env"
2. Dodajte sve varijable iz .env fajla:
   - MONGO_URL
   - DB_NAME  
   - JWT_SECRET
   - JWT_EXPIRES_IN

### 4.3 NPM Install
1. Kliknite "Run NPM Install" ili
2. Putem Terminal/SSH pokrenite:
   ```bash
   npm install
   ```

### 4.4 Restart App
1. Kliknite "Restart" dugme

---

## KORAK 5: Testiranje

1. Otvorite vašu domenu u browseru
2. Trebalo bi se prikazati Continental Academy homepage
3. Testirajte login:
   - Email: admin@test.com
   - Password: admin123

---

## Troubleshooting

### "Application Error" ili prazna stranica
- Provjerite da je `app.js` postavljen kao startup file
- Provjerite environment varijable
- Pogledajte error logs u hPanel-u

### "Cannot connect to MongoDB"
- Provjerite MONGO_URL u environment variables
- Provjerite da je 0.0.0.0/0 dodan u Atlas Network Access

### API ne radi
- Svi API endpoint-i su na `/api/...`
- Test: `https://vasadomena.com/api/health`

### CSS/JS ne učitava
- Provjerite da je `public` folder uploadovan
- Provjerite da postoji `public/index.html`

---

## Test Kredencijali

- **Admin**: admin@test.com / admin123
- **Student**: student@test.com / student123

---

## Kontakt za Podršku

Ako imate problema, provjerite:
1. hPanel Error Logs
2. MongoDB Atlas logs
3. Da su sve env varijable postavljene

Sretno! 🚀
