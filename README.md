# CodeSprint

CodeSprint is a modern web platform that connects developers with clients, facilitating project collaboration and professional networking in the software development industry.

![CodeSprint Logo](frontend/public/logo.png)

## Features

### For Developers

- 🚀 Create and manage professional profiles
- 💼 Browse available projects and job opportunities
- 🔄 Toggle between developer and client modes
- 📊 Track project progress and milestones
- 💬 Real-time messaging with clients

### For Clients

- 👥 Find skilled developers for projects
- 📝 Post project requirements and opportunities
- 💼 Manage ongoing projects
- ⭐ Rate and review developers
- 💬 Direct communication with developers

## Technology Stack

### Frontend

- React.js with hooks for state management
- Material-UI (MUI) for modern UI components
- Ant Design icons for enhanced visual elements
- React Router for navigation
- Axios for API communication

### Backend

- Node.js with Express.js
- MySQL database
- JWT for authentication
- Bcrypt for password hashing
- Nodemailer for email notifications

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MySQL (v8.0 or higher)
- npm or yarn package manager

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/codesprint.git
cd codesprint
```

2. Install frontend dependencies:

```bash
cd frontend
npm install
```

3. Install backend dependencies:

```bash
cd ../backend
npm install
```

4. Set up environment variables:

Create a `.env` file in the backend directory with the following variables:

```env
DB_HOST=localhost
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=codesprint
JWT_SECRET=your_jwt_secret
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_email_app_password
FRONTEND_URL=http://localhost:3000
```

5. Initialize the database:

```bash
mysql -u root -p < backend/database/init.sql
```

### Running the Application

1. Start the backend server:

```bash
cd backend
npm start
```

2. Start the frontend development server:

```bash
cd frontend
npm start
```

The application will be available at `http://localhost:3000`

## Project Structure

```
codesprint/
├── frontend/
│   ├── public/
│   └── src/
│       ├── components/
│       ├── contexts/
│       ├── pages/
│       └── App.js
├── backend/
│   ├── routes/
│   ├── database/
│   ├── middleware/
│   └── index.js
└── README.md
```

## Key Features Implementation

### Authentication

- JWT-based authentication system
- Email verification for new accounts
- Secure password hashing
- Protected routes and API endpoints

### User Modes

- Dual mode system (Developer/Client)
- Seamless mode switching
- Mode-specific features and views

### Profile Management

- Comprehensive developer profiles
- Portfolio integration
- Skills and experience showcase
- Project history tracking

### Project Management

- Project creation and listing
- Status tracking
- Milestone management
- Communication tools

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

Your Name - [@yourtwitter](https://twitter.com/yourtwitter)
Project Link: [https://github.com/yourusername/codesprint](https://github.com/yourusername/codesprint)

## Acknowledgments

- Material-UI for the component library
- Ant Design for the icon set
- All contributors who have helped shape this project
