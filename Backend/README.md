# AI Interview Backend API

The backend API for the AI Interview application, built with Node.js, Express, and MongoDB.

## Features

- User Authentication (Register, Login, Email Verification)
- Password Management (Reset Password, Change Password)
- Profile Management
- Interview Session Management
- Feedback Report Generation

## API Endpoints

### Authentication

- **POST /api/auth/register** - Register a new user
  - Request: `{ name, email, password }`
  - Response: `{ message }`

- **POST /api/auth/login** - Login a user
  - Request: `{ email, password }`
  - Response: `{ token, user }`

- **POST /api/auth/verify-email** - Verify email with OTP
  - Request: `{ email, code }`
  - Response: `{ message }`

- **POST /api/auth/forgot-password** - Request password reset
  - Request: `{ email }`
  - Response: `{ message }`

- **POST /api/auth/reset-password** - Reset password with OTP
  - Request: `{ email, code, password }`
  - Response: `{ message }`

### User Management

- **GET /api/users/profile** - Get user profile
  - Headers: `Authorization: Bearer {token}`
  - Response: `{ user }`

- **PUT /api/users/profile** - Update user profile
  - Headers: `Authorization: Bearer {token}`
  - Request: `{ name, profileImage }`
  - Response: `{ message, user }`

- **PUT /api/users/change-password** - Change password
  - Headers: `Authorization: Bearer {token}`
  - Request: `{ currentPassword, newPassword }`
  - Response: `{ message }`

## Setup Instructions

1. Clone the repository
2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:

   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/ai-interview-app
   JWT_SECRET=your_jwt_secret_key
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_email_app_password
   ```

4. Run the development server:

   ```bash
   npm run dev
   ```

## Scripts

- `npm start` - Start the server
- `npm run dev` - Start the server with nodemon for development
- `npm test` - Run tests
- `npm run seed` - Seed the database with initial data

## Folder Structure

```plaintext
backend/
├── config/           # Configuration files
├── controllers/      # Route controllers
├── middleware/       # Custom middleware
├── models/           # Database models
├── routes/           # API routes
├── test/             # Test files
├── utils/            # Utility functions
├── .env              # Environment variables
├── .env.example      # Example environment variables
├── .gitignore        # Git ignore file
├── package.json      # Dependencies and scripts
└── server.js         # Entry point
```

## Dependencies

- express - Web framework
- mongoose - MongoDB ODM
- jsonwebtoken - JWT authentication
- bcrypt - Password hashing
- nodemailer - Email sending
- dotenv - Environment variables
- cors - CORS middleware
- nodemon - Development server
