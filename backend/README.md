# Quiz Extension Backend API

Backend server for Quiz Extension with MongoDB integration.

## Setup

1. Install dependencies:
```bash
cd backend
npm install
```

2. Configure environment variables in `.env`:
```
MONGODB_URI=your-mongodb-connection-string
PORT=3000
ADMIN_PASSWORD=your-secure-password
```

3. Start the server:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

## API Endpoints

### Public Endpoints

**POST /api/verify-license**
- Verify if a license key is valid
- Body: `{ "licenseKey": "QUIZ-2024-XXX" }`

### Admin Endpoints (require adminPassword)

**POST /api/admin/create-license**
- Create a new license
- Body: `{ "adminPassword": "xxx", "licenseKey": "QUIZ-2024-XXX", "email": "user@example.com", "plan": "Premium", "expiryDate": "2025-12-31" }`

**POST /api/admin/deactivate-license**
- Deactivate a license (user loses access immediately)
- Body: `{ "adminPassword": "xxx", "licenseKey": "QUIZ-2024-XXX" }`

**POST /api/admin/activate-license**
- Reactivate a license
- Body: `{ "adminPassword": "xxx", "licenseKey": "QUIZ-2024-XXX" }`

**POST /api/admin/list-licenses**
- Get all licenses
- Body: `{ "adminPassword": "xxx" }`

**POST /api/admin/delete-license**
- Permanently delete a license
- Body: `{ "adminPassword": "xxx", "licenseKey": "QUIZ-2024-XXX" }`

## Deployment

Deploy to:
- Heroku
- Vercel
- Railway
- AWS
- DigitalOcean

Make sure to set environment variables on your hosting platform.

## Testing with Postman/cURL

Create a license:
```bash
curl -X POST http://localhost:3000/api/admin/create-license \
  -H "Content-Type: application/json" \
  -d '{
    "adminPassword": "your-secure-admin-password-here",
    "licenseKey": "QUIZ-2024-TEST",
    "email": "test@example.com",
    "plan": "Premium",
    "expiryDate": "2025-12-31"
  }'
```

Verify a license:
```bash
curl -X POST http://localhost:3000/api/verify-license \
  -H "Content-Type: application/json" \
  -d '{"licenseKey": "QUIZ-2024-TEST"}'
```
