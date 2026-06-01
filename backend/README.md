# Auto-App Generator Backend

Express + TypeScript API for authentication, project generation, history, and ZIP export.

## Quick Start

```bash
npm install
npm run dev
```

Default API URL: `http://127.0.0.1:5000/api`

Demo accounts are seeded automatically:

- `admin@autoapp.ai` / `admin123`
- `developer@autoapp.ai` / `dev123`

## Main Endpoints

- `GET /api/health`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/generations`
- `GET /api/generations`
- `GET /api/generations/:id`
- `GET /api/generations/:id/download`
