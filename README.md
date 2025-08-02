# AI Interview Application

An AI-powered interview preparation platform that simulates real interview scenarios to help candidates identify their strengths and weaknesses before actual interviews.

## Features

- **AI-Powered Mock Interviews**: Tailored interviews based on company and role selection.
- **Voice Interaction**: Conduct interviews via voice with text history.
- **Comprehensive Feedback**: Detailed performance reports highlighting strengths and areas for improvement.
- **User Management**: Secure authentication with email verification.

## Tech Stack

### Frontend

- React with Vite
- Redux Toolkit for state management
- React Router for navigation
- Tailwind CSS for styling
- Axios for API communication

### Backend

- Node.js with Express
- MongoDB with Mongoose
- JWT for authentication
- Bcrypt for password hashing
- Nodemailer for email services

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or Atlas)

### Installation

#### Backend Setup

```bash
cd Backend
npm install
# Create .env file based on .env.example
npm run dev
```

#### Frontend Setup

```bash
cd Frontend
npm install
npm run dev
```

## Project Structure

```
├── Backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   └── utils/
│
└── Frontend/
    ├── public/
    └── src/
        ├── assets/
        ├── components/
        ├── context/
        ├── pages/
        ├── redux/
        └── services/
```

## Database Setup

### Local MongoDB

For development, you can use a local MongoDB instance. Make sure to update your `.env` file with the appropriate connection string:

```env
```env
MONGO_URI=mongodb://localhost:27017/aiinterviewapp
```
```

### MongoDB Atlas (Recommended for Production)

We recommend using MongoDB Atlas for production environments.

1. Follow the setup guide in `Backend/docs/mongodb-atlas-setup.md` to create your Atlas cluster
2. Update your `.env` file with the Atlas connection string
3. Configure appropriate network access and security settings

## Database Maintenance

The application includes utilities for database maintenance:


```bash
# Create a database backup
node Backend/utils/db-utils.js backup

# List available backups
node Backend/utils/db-utils.js list

# Restore from a backup
node Backend/utils/db-utils.js restore <backup-path>
```


For more information on database maintenance and optimization, refer to `Backend/docs/database-maintenance.md`.

## Next Steps

1. Complete interview flow and AI interaction
2. Create interview components with voice capability
3. Develop feedback report generation system
4. Add monitoring and analytics dashboard

## License

This project is licensed under the MIT License.
