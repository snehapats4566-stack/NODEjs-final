# 🐾 PawHaven – Pet Adoption Platform

A full-stack pet adoption platform built with **Express.js + MongoDB (Mongoose)** backend and a **React + Vite** frontend.

---

## 📁 Project Structure

```
node final/
├── backend/              ← Express.js REST API
│   ├── server.js         ← Entry point  ✅ RUN THIS
│   ├── .env              ← Environment variables
│   └── src/
│       ├── config/       ← DB + Multer config
│       ├── controllers/  ← Business logic
│       ├── middleware/   ← Auth, validation, error handling
│       ├── models/       ← Mongoose schemas
│       └── routes/       ← API route definitions
│
├── frontend/             ← React + Vite app
│   ├── src/
│   │   ├── App.jsx       ← Root with routing
│   │   ├── pages/        ← Home, Login, Register, PetDetail, AdminPanel, AddPet, MyRequests
│   │   ├── components/   ← Navbar, PetCard, AdoptionModal, ProtectedRoute
│   │   ├── context/      ← AuthContext (JWT state)
│   │   └── api/          ← Axios instance
│   └── .env              ← API base URL
│
└── PetAdoption.postman_collection.json  ← Import into Postman
```

---

## 🚀 How to Run

### Step 1 – Set up MongoDB Atlas

1. Create a free cluster at [mongodb.com/atlas](https://mongodb.com/atlas)
2. Get your connection string
3. Open `backend/.env` and replace:
   ```
   MONGO_URI=mongodb+srv://YOUR_USER:YOUR_PASS@cluster0.mongodb.net/pet-adoption
   ```

### Step 2 – Start the Backend

```bash
cd backend
npm run dev
```
> Server runs at **http://localhost:5000**

### Step 3 – Start the Frontend

Open a **new terminal**:
```bash
cd frontend
npm run dev
```
> App runs at **http://localhost:5173**

---

## 🔐 Environment Variables

### `backend/.env`
| Variable | Description |
|---|---|
| `PORT` | Server port (default 5000) |
| `MONGO_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Secret key for JWT tokens |
| `ADMIN_SECRET` | Secret used when registering an admin account |
| `UPLOAD_PATH` | Where pet photos are stored (default `uploads/`) |
| `CLIENT_URL` | Frontend URL for CORS (default `http://localhost:5173`) |

### `frontend/.env`
| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend API base URL |
| `VITE_UPLOADS_URL` | Backend base URL for serving images |

---

## 📌 API Endpoints

### Auth
| Method | Endpoint | Access |
|---|---|---|
| POST | `/api/auth/register` | Public |
| POST | `/api/auth/login` | Public |
| GET | `/api/auth/me` | Private |

### Pets
| Method | Endpoint | Access |
|---|---|---|
| GET | `/api/pets?status=available&species=dog` | Public |
| GET | `/api/pets/:id` | Public |
| POST | `/api/pets` (multipart/form-data) | Admin only |
| PUT | `/api/pets/:id` | Admin only |
| PATCH | `/api/pets/:id/status` | Admin only |
| DELETE | `/api/pets/:id` | Admin only |

### Adoption Requests
| Method | Endpoint | Access |
|---|---|---|
| POST | `/api/adoption-requests` | Private |
| GET | `/api/adoption-requests` | Private (admin sees all) |
| GET | `/api/adoption-requests/:id` | Private |
| PATCH | `/api/adoption-requests/:id/status` | Admin only |

---

## 👤 Creating an Admin Account

When registering, include `role: "admin"` **and** the `adminSecret` field:

```json
{
  "name": "Shelter Admin",
  "email": "admin@shelter.com",
  "password": "admin123",
  "role": "admin",
  "adminSecret": "shelter_admin_secret_2024"
}
```
> The `adminSecret` value must match `ADMIN_SECRET` in `backend/.env`

---

## 🗃️ Postman Collection

Import `PetAdoption.postman_collection.json` into Postman.  
The **Login** request auto-saves the JWT token to `{{token}}` collection variable.

---

## 🌐 Deployment

| Service | Platform |
|---|---|
| Backend | Render / Railway |
| Frontend | Vercel / Netlify |
| Database | MongoDB Atlas |

Set the same `.env` variables in your hosting platform's environment settings.  
Update `VITE_API_URL` in the frontend to point to your deployed backend URL.
