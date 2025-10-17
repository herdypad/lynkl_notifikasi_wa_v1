# Bot Lynk WhatsApp Notification 

Bot WhatsApp untuk menerima notifikasi dari platform Lynk ke WhatsApp Anda menggunakan [whatsapp-web.js](https://github.com/pedroslopez/whatsapp-web.js).

## 🚀 Instalasi

### Persyaratan Sistem
- Node.js versi 20 atau lebih baru
- VPS atau server dengan domain yang sudah terkonfigurasi
- Google Chrome/Chromium (akan diinstall otomatis oleh Puppeteer)

### Langkah Instalasi
1. Clone atau salin semua folder ke server Anda
2. Install dependencies:
   ```bash
   npm install
   ```
3. Jalankan aplikasi dengan perintah:
   ```bash
   node app.js
   ```
4. Jika menggunakan PM2:
   ```bash
   pm2 start app.js --name "botwa"
   pm2 log botwa
   ```

> **Catatan**: Untuk server tanpa GUI, pastikan dependencies Chrome terinstall. Di Ubuntu/Debian:
> ```bash
> sudo apt-get update
> sudo apt-get install -y gconf-service libgbm-dev libasound2 libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgcc1 libgconf-2-4 libgdk-pixbuf2.0-0 libglib2.0-0 libgtk-3-0 libnspr4 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 ca-certificates fonts-liberation libappindicator1 libnss3 lsb-release xdg-utils wget
> ```
3. Jika menggunakan PM2:
    ```bash
    pm2 start app.js --name "botwa"
    pm2 log botwa
    ```



## 📋 Endpoint API

> **Penting**: Ganti `http://localhost:80` dengan domain Anda.
> Lynk hanya mendukung domain dan tidak mendukung IP public.

| Endpoint | Deskripsi |
|----------|------------|
| `http://localhost:80/login` | � Halaman login |
| `http://localhost:80/logout` | � Halaman logout |
| `http://localhost:80/status` | � Cek status bot |
| `http://localhost:80/webhook/lynk/:phoneNumber/:merchantKey` | 📤 Endpoint webhook Lynk ke WhatsApp |
| `http://localhost:80/send?nm=NUMBER&m=MESSAGE` | 📱 Test pengiriman pesan |

## 🔧 Konfigurasi di Lynk

1. Login ke panel admin Lynk
2. Navigasi ke menu **Settings**
3. Pilih **Integrations**
4. Klik bagian **Webhook**
5. Masukkan URL webhook dengan format:
   ```
   https://domain-anda.com/webhook/lynk/[nomorWA]/[merchantKey]
   ```
   
   Dimana:
   - `nomorWA`: Nomor WhatsApp Anda (contoh: 628132278372)
   - `merchantKey`: Merchant Key dari panel Lynk

### Contoh URL Webhook
```
https://contohdomain.com/webhook/lynk/628132278372/ynic9rerpv15UEbBgrA79rF4rYj-qJ32s
```# lynkl_notifikasi_wa_v1
# lynkl_notifikasi_wa_v1
# lynkl_notifikasi_wa_v1
# lynkl_notifikasi_wa_v1
# lynkl_notifikasi_wa_v1
# lynkl_notifikasi_wa_v1
