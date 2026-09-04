# PMR SMANEL Frontend v1

React + Vite frontend untuk API Google Apps Script PMR SMANEL.

## Jalankan
1. `npm install`
2. copy `.env.example` menjadi `.env`
3. `npm run dev`

## Build
`npm run build`

Catatan:
- GET API dikirim menggunakan URLSearchParams agar parameter `&` tidak mengalami masalah encoding.
- POST dikirim sebagai JSON ke endpoint `/exec`.
- Login frontend terhubung ke action `login`, tetapi backend login production masih perlu password hash/salt yang benar sebelum go-live.
