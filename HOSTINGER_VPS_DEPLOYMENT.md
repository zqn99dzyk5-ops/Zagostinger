# Continental Academy - Hostinger VPS Deployment Guide

## KORAK 1: Priprema MongoDB Atlas (Online Baza Podataka)

### 1.1 Kreirajte MongoDB Atlas Account
1. Idite na https://www.mongodb.com/cloud/atlas
2. Kliknite "Try Free" i registrujte se
3. Odaberite FREE tier (M0 Sandbox)

### 1.2 Kreirajte Cluster
1. Odaberite "Build a Database"
2. Odaberite FREE tier "M0"
3. Odaberite regiju najbližu vama (npr. Frankfurt za EU)
4. Kliknite "Create Cluster"

### 1.3 Kreirajte Database User
1. Idite na "Database Access" u lijevom meniju
2. Kliknite "Add New Database User"
3. Username: `continental_user`
4. Password: Generirajte siguran password (ZAPIŠITE GA!)
5. Role: "Read and write to any database"
6. Kliknite "Add User"

### 1.4 Omogućite Network Access
1. Idite na "Network Access" u lijevom meniju
2. Kliknite "Add IP Address"
3. Za sada dodajte "Allow Access from Anywhere" (0.0.0.0/0)
   - Kasnije ćete dodati samo VPS IP za sigurnost
4. Kliknite "Confirm"

### 1.5 Dobijte Connection String
1. Idite na "Database" → "Connect"
2. Odaberite "Connect your application"
3. Driver: Node.js, Version: 5.5 or later
4. Kopirajte connection string, izgleda ovako:
   ```
   mongodb+srv://continental_user:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. Zamijenite `<password>` sa vašim passwordom

---

## KORAK 2: Priprema Hostinger VPS-a

### 2.1 Pristupite VPS-u
1. Ulogujte se na Hostinger hPanel
2. Idite na VPS sekciju
3. Kopirajte SSH pristupne podatke:
   - IP adresa
   - Username (obično `root`)
   - Password

### 2.2 Povežite se na VPS putem SSH
```bash
# Na Windows koristite PowerShell ili PuTTY
# Na Mac/Linux koristite Terminal
ssh root@VASA_IP_ADRESA
```

### 2.3 Ažurirajte sistem
```bash
apt update && apt upgrade -y
```

### 2.4 Instalirajte potrebne pakete
```bash
# Instaliraj Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
apt install -y nodejs

# Instaliraj Yarn
npm install -g yarn

# Instaliraj PM2 (process manager)
npm install -g pm2

# Instaliraj Nginx
apt install -y nginx

# Instaliraj Git
apt install -y git

# Provjeri verzije
node -v  # Treba pokazati v20.x.x
npm -v
yarn -v
pm2 -v
nginx -v
```

---

## KORAK 3: Postavite Domenu (Opcionalno ali preporučeno)

### 3.1 Na Hostinger hPanel
1. Idite na "Domains" → vaša domena
2. Idite na "DNS / Nameservers"
3. Dodajte A record:
   - Type: A
   - Name: @ (ili subdomena npr. `academy`)
   - Points to: VAS_VPS_IP
   - TTL: 3600

### 3.2 Za API subdomenu (preporučeno)
- Type: A
- Name: api
- Points to: VAS_VPS_IP

Sačekajte 5-30 minuta da se DNS propagira.

---

## KORAK 4: Preuzmite Kod na VPS

### 4.1 Klonirajte repository
```bash
cd /var/www
git clone VASA_GITHUB_REPO_URL continental-academy
cd continental-academy
```

Ili ako nemate GitHub, upload-ujte fajlove putem SFTP (FileZilla).

---

## KORAK 5: Konfigurišite Backend

### 5.1 Idite u backend folder
```bash
cd /var/www/continental-academy/backend
```

### 5.2 Kreirajte .env fajl
```bash
nano .env
```

### 5.3 Zalijepite ovo (EDITUJTE VAŠE PODATKE):
```env
# MongoDB Atlas - zamijenite sa vašim connection stringom
MONGO_URL=mongodb+srv://continental_user:VAS_PASSWORD@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority

# Database name
DB_NAME=continental_academy

# JWT - PROMIJENITE OVO NA RANDOM STRING!
JWT_SECRET=promijenite_ovo_na_siguran_random_string_12345
JWT_EXPIRES_IN=7d

# Server
PORT=8001
CORS_ORIGINS=https://vasadomena.com,https://www.vasadomena.com

# Stripe (opcionalno - za plaćanja)
STRIPE_API_KEY=sk_test_your_stripe_key
```

Sačuvajte: `Ctrl+X`, pa `Y`, pa `Enter`

### 5.4 Instalirajte dependencies
```bash
yarn install
```

### 5.5 Testirajte da backend radi
```bash
node server.js
```
Trebalo bi pokazati:
```
✓ Connected to MongoDB (database: continental_academy)
✓ Server running on http://0.0.0.0:8001
```
Zaustavite sa `Ctrl+C`

---

## KORAK 6: Konfigurišite Frontend

### 6.1 Idite u frontend folder
```bash
cd /var/www/continental-academy/frontend
```

### 6.2 Kreirajte/editujte .env fajl
```bash
nano .env
```

### 6.3 Zalijepite ovo:
```env
REACT_APP_BACKEND_URL=https://vasadomena.com
```
(Ili `https://api.vasadomena.com` ako koristite subdomenu)

### 6.4 Instalirajte dependencies i buildajte
```bash
yarn install
yarn build
```

Ovo će kreirati `build` folder sa produkcijskom verzijom.

---

## KORAK 7: Pokrenite Backend sa PM2

### 7.1 Pokrenite backend
```bash
cd /var/www/continental-academy/backend
pm2 start server.js --name "continental-backend"
```

### 7.2 Postavite da se automatski pokrene nakon restarta
```bash
pm2 startup
pm2 save
```

### 7.3 Korisne PM2 komande
```bash
pm2 status          # Provjeri status
pm2 logs            # Vidi logove
pm2 restart all     # Restartuj sve
pm2 stop all        # Zaustavi sve
```

---

## KORAK 8: Konfigurišite Nginx

### 8.1 Kreirajte Nginx konfiguraciju
```bash
nano /etc/nginx/sites-available/continental-academy
```

### 8.2 Zalijepite ovo (ZAMIJENITE vasadomena.com):
```nginx
# Frontend (React)
server {
    listen 80;
    server_name vasadomena.com www.vasadomena.com;

    root /var/www/continental-academy/frontend/build;
    index index.html;

    # Gzip kompresija
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;

    # React Router - sve rute idu na index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API Proxy - sve /api rute idu na backend
    location /api {
        proxy_pass http://127.0.0.1:8001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Cache static files
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### 8.3 Omogućite site
```bash
ln -s /etc/nginx/sites-available/continental-academy /etc/nginx/sites-enabled/
```

### 8.4 Uklonite default site
```bash
rm /etc/nginx/sites-enabled/default
```

### 8.5 Testirajte i restartujte Nginx
```bash
nginx -t
systemctl restart nginx
```

---

## KORAK 9: Instalirajte SSL Certifikat (HTTPS)

### 9.1 Instalirajte Certbot
```bash
apt install -y certbot python3-certbot-nginx
```

### 9.2 Dobijte SSL certifikat
```bash
certbot --nginx -d vasadomena.com -d www.vasadomena.com
```

Pratite upute:
- Unesite email
- Prihvatite Terms of Service (A)
- Odaberite redirect HTTP to HTTPS (2)

### 9.3 Auto-renewal test
```bash
certbot renew --dry-run
```

---

## KORAK 10: Finalni Test

### 10.1 Provjerite da sve radi
```bash
# Backend status
pm2 status

# Nginx status
systemctl status nginx

# Test API
curl https://vasadomena.com/api/health
```

### 10.2 Otvorite u browseru
- https://vasadomena.com - Trebalo bi prikazati homepage
- Probajte login sa: admin@test.com / admin123

---

## KORAK 11: Sigurnosne Preporuke

### 11.1 Ažurirajte MongoDB Atlas IP Whitelist
1. Idite na MongoDB Atlas → Network Access
2. Uklonite 0.0.0.0/0
3. Dodajte samo VPS IP adresu

### 11.2 Postavite Firewall
```bash
ufw allow ssh
ufw allow http
ufw allow https
ufw enable
```

### 11.3 Promijenite SSH port (opcionalno)
```bash
nano /etc/ssh/sshd_config
# Promijenite Port 22 na npr. Port 2222
systemctl restart sshd
ufw allow 2222
```

---

## Troubleshooting

### Problem: "Cannot connect to MongoDB"
- Provjerite da je IP whitelist postavljen na Atlas
- Provjerite connection string u .env

### Problem: "502 Bad Gateway"
- Backend nije pokrenut: `pm2 restart continental-backend`
- Provjerite logove: `pm2 logs`

### Problem: "Site not loading"
- Nginx nije pokrenut: `systemctl start nginx`
- Provjerite config: `nginx -t`

### Problem: "CORS Error"
- Dodajte vašu domenu u CORS_ORIGINS u backend .env
- Restartujte backend: `pm2 restart continental-backend`

---

## Korisne Komande

```bash
# Ažuriranje koda sa GitHub-a
cd /var/www/continental-academy
git pull
cd backend && yarn install && pm2 restart continental-backend
cd ../frontend && yarn install && yarn build

# Pregled logova
pm2 logs continental-backend --lines 100

# Restart svega
pm2 restart all
systemctl restart nginx

# Disk space
df -h

# Memory usage
free -m
```

---

Sretno! 🚀
