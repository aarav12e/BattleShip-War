# ⚓ Battleship War — MERN Stack Game

A full-stack Battleship game with Google OAuth (Gmail only), AI opponent, leaderboard, and Vercel deployment.

---

## 📁 Project Structure

```
battleship-war/
├── server/          ← Express + MongoDB backend
│   ├── config/passport.js
│   ├── middleware/authMiddleware.js
│   ├── models/User.js  Game.js
│   ├── routes/auth.js  game.js  leaderboard.js
│   ├── index.js
│   ├── vercel.json
│   └── package.json
│
└── client/          ← React + Vite frontend
    ├── src/
    │   ├── components/Grid  Fleet  Navbar
    │   ├── context/AuthContext
    │   ├── pages/Login  Game  Leaderboard  Profile  AuthCallback
    │   └── utils/gameLogic.js
    ├── vercel.json
    └── package.json
```

---

## 🔧 Resources You Need

### 1. MongoDB Atlas (Free Tier)
1. Go to https://cloud.mongodb.com
2. Create a free **M0** cluster
3. Database Access → Add user (username + password)
4. Network Access → Add IP `0.0.0.0/0` (allow all — needed for Vercel)
5. Connect → Drivers → Copy the connection string
   ```
   mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/battleship-war
   ```

### 2. Google Cloud Console (OAuth 2.0)
1. Go to https://console.cloud.google.com
2. Create a **New Project** → name it "Battleship War"
3. APIs & Services → **Enable APIs**:
   - Google+ API
   - People API
4. APIs & Services → **Credentials** → Create OAuth 2.0 Client ID
   - Application type: **Web application**
   - Authorized JavaScript origins:
     ```
     http://localhost:5173
     https://your-frontend.vercel.app
     ```
   - Authorized redirect URIs:
     ```
     http://localhost:5000/auth/google/callback
     https://your-backend.vercel.app/auth/google/callback
     ```
5. Copy `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`
6. OAuth consent screen → Add your Gmail as test user

### 3. Vercel Account
- Sign up at https://vercel.com (free)
- Deploy both repos separately

---

## 🚀 Local Development

### Backend
```bash
cd server
npm install
cp .env.example .env
# Fill in .env values
npm run dev
```

### Frontend
```bash
cd client
npm install
cp .env.example .env
# Set VITE_API_URL=http://localhost:5000
npm run dev
```

---

## ▲ Vercel Deployment

### Deploy Backend First
```bash
cd server
npx vercel --prod
```
Set these environment variables in Vercel dashboard:
```
MONGODB_URI        = mongodb+srv://...
GOOGLE_CLIENT_ID   = 123....apps.googleusercontent.com
GOOGLE_CLIENT_SECRET = GOCSPX-...
JWT_SECRET         = (generate: openssl rand -hex 32)
FRONTEND_URL       = https://battleship-war-client.vercel.app
BACKEND_URL        = https://battleship-war-server.vercel.app
NODE_ENV           = production
```

### Deploy Frontend
```bash
cd client
npx vercel --prod
```
Set this environment variable:
```
VITE_API_URL = https://battleship-war-server.vercel.app
```

### Update Google Console
After deploying, go back to Google Cloud Console and add:
- Authorized origins: `https://battleship-war-client.vercel.app`
- Redirect URI: `https://battleship-war-server.vercel.app/auth/google/callback`

---

## 🎮 Game Rules

| Grid | Columns A–M (13) × Rows 1–14 (14) = 182 cells |
|------|------|
| Ships | 6 total |

| Ship | Size |
|------|------|
| Carrier | 5 cells |
| Battleship | 4 cells |
| Cruiser | 3 cells |
| Submarine | 3 cells |
| Destroyer | 2 cells |
| Patrol Boat | 2 cells |

### Scoring
| Event | Points |
|-------|--------|
| Hit | +100 |
| Ship sunk | +500 |
| Victory | +2000 |
| Miss | -20 |
| Each 10 seconds | -5 |
| Turns over 30 | -10/turn |

---

## 🔐 Security Features
- Gmail-only login (`@gmail.com` enforced server-side)
- JWT tokens (7-day expiry)
- CORS restricted to frontend URL
- No session storage — stateless API

---

## 🤖 AI Strategy
The AI uses a **Hunt/Target** algorithm:
- **Hunt mode**: Fires in a checkerboard pattern to cover 50% of cells efficiently
- **Target mode**: After a hit, fires at adjacent cells
- **Line extension**: After 2 hits in a line, extends in both directions

---

## 📦 Tech Stack
| Layer | Tech |
|-------|------|
| Frontend | React 18, Vite, React Router v6 |
| Backend | Express.js, Node.js |
| Database | MongoDB Atlas + Mongoose |
| Auth | Google OAuth 2.0 + Passport.js + JWT |
| Deployment | Vercel (both frontend & backend) |
| Fonts | Orbitron, Share Tech Mono |
