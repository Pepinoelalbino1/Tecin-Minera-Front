# TecinApp Frontend

Frontend para TecinApp usando React + Vite + Tailwind.

Paleta: azul (primary), dorado (gold) y blanco.

Requisitos:
- Node.js (>=16)
- npm

Instrucciones (Windows PowerShell):

```powershell
cd "c:/Users/jesus/Spring/APP-Tecin/tecinapp-front"
npm install
# Crear un archivo .env local con la URL del backend si es diferente:
# copy .env.example .env
npm run dev
```

Notas:
- El frontend usa la variable `VITE_API_BASE_URL` (ver `.env.example`).
- El backend Spring Boot suele correr en `http://localhost:8080`. Asegúrate de habilitar CORS en el backend para que las peticiones desde `http://localhost:3000` funcionen.
