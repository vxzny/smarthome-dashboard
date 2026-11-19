# Panduan Deployment ke GitHub Pages

Project ini sudah dilengkapi dengan konfigurasi Vite (`base: './'`) dan workflow otomatis GitHub Actions (`.github/workflows/deploy.yml`).

## Langkah Deployment
1. **Buat Repository Baru di GitHub** (misal: `smarthome-dashboard`).
2. **Upload / Push Seluruh Isi Project** ke branch `main`:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Smart Home MQTT WSS Dashboard"
   git branch -M main
   git remote add origin https://github.com/<USERNAME_ANDA>/<NAMA_REPO>.git
   git push -u origin main
   ```
3. **Aktifkan GitHub Pages via GitHub Actions**:
   - Buka repository Anda di GitHub → masuk ke **Settings** → **Pages**.
   - Pada bagian **Build and deployment** → **Source**, pilih **GitHub Actions**.
4. **Tunggu Proses Build Selesai**:
   - Buka tab **Actions** di repository Anda dan pastikan workflow `Deploy Smart Home Dashboard to GitHub Pages` selesai dengan status hijau.
5. **Akses Website Anda**:
   - Website dapat dibuka dari mana saja melalui URL:
     `https://<USERNAME_ANDA>.github.io/<NAMA_REPO>/`
   - Buka menu **Settings** pada website tersebut dan masukkan konfigurasi Broker MQTT WSS Anda.
