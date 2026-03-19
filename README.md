# Experiment 5: JWT-Based Authentication for Banking API

## Aim
To implement JWT-based authentication for banking API endpoints.

## Objectives
- Create user registration and login endpoints
- Generate and verify JWTs
- Protect banking routes
- Implement token refresh mechanisms
- Add account-level security

## Hardware/Software Requirements
- Node.js 18+
- Express.js
- MongoDB
- jsonwebtoken library
- Postman for testing

## Tech Stack
| Technology | Purpose |
|---|---|
| Node.js | Runtime environment |
| Express.js | Web framework |
| MongoDB + Mongoose | Database |
| bcryptjs | Password hashing |
| jsonwebtoken | JWT generation & verification |
| dotenv | Environment variables |

## Project Structure
```
Experiment-5-JWT-Banking-API/
├── config/
│   └── keys.js          # JWT secret, DB URI, expiry settings
├── middleware/
│   └── auth.js          # JWT verification + role-based auth
├── models/
│   ├── User.js          # User schema with bcrypt hashing
│   ├── Account.js       # Bank account schema
│   └── RefreshToken.js  # Refresh token schema
├── routes/
│   ├── auth.js          # Register, Login, Refresh, Logout
│   └── banking.js       # Protected banking endpoints
├── server.js            # Entry point
└── package.json
```

## API Endpoints

### Auth Routes (`/api/auth`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | /register | Register new user | No |
| POST | /login | Login and get tokens | No |
| POST | /refresh | Refresh access token | No |
| POST | /logout | Revoke refresh token | No |

### Banking Routes (`/api/banking`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | /accounts | Create bank account | Yes |
| GET | /accounts | Get all my accounts | Yes |
| GET | /accounts/:id | Get single account | Yes |
| POST | /accounts/:id/deposit | Deposit money | Yes |
| POST | /accounts/:id/withdraw | Withdraw money | Yes |
| GET | /profile | Get user profile | Yes |
| POST | /admin/block-user/:id | Block a user | Admin only |
| GET | /admin/users | Get all users | Admin only |

## How to Run Locally

1. Clone the repo:
```bash
git clone https://github.com/sukhdeep-singh-325/Experiment-5-JWT-Banking-API.git
cd Experiment-5-JWT-Banking-API
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```env
MONGO_URI=mongodb://127.0.0.1:27017/jwt_banking
JWT_SECRET=your_super_secret_key
PORT=5000
```

4. Start the server:
```bash
npm run dev
```

## Postman Testing

### 1. Register
```
POST http://localhost:5000/api/auth/register
Body: { "name": "John", "email": "john@test.com", "password": "pass123", "role": "customer" }
```

### 2. Login (get accessToken + refreshToken)
```
POST http://localhost:5000/api/auth/login
Body: { "email": "john@test.com", "password": "pass123" }
```

### 3. Create Bank Account (protected)
```
POST http://localhost:5000/api/banking/accounts
Header: Authorization: Bearer <accessToken>
```

### 4. Deposit
```
POST http://localhost:5000/api/banking/accounts/<accountId>/deposit
Header: Authorization: Bearer <accessToken>
Body: { "amount": 5000 }
```

### 5. Withdraw
```
POST http://localhost:5000/api/banking/accounts/<accountId>/withdraw
Header: Authorization: Bearer <accessToken>
Body: { "amount": 1000 }
```

### 6. Refresh Token
```
POST http://localhost:5000/api/auth/refresh
Body: { "refreshToken": "<refreshToken>" }
```

## Security Features
- Passwords hashed using **bcrypt** (salt rounds: 10)
- JWT signed with secret key, expires in **15 minutes**
- Refresh tokens valid for **7 days**, stored in DB
- Token expiry error handling with clear messages
- Role-based access control (customer / admin)
- Account blocking functionality (admin only)
- Invalid token detection and rejection

## Output Summary
- User registration and login with secure password storage
- JWT generation on successful login
- Protected route access using Bearer tokens
- Token expiry and invalid token handling
- Refresh token rotation mechanism
- Admin routes with role-based authorization
