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

## Next Steps

1. Implement user authentication routes and components
2. Design interview flow and AI interaction
3. Create interview components with voice capability
4. Develop feedback report generation system

## License

This project is licensed under the MIT License.
