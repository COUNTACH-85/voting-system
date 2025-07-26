# VoteSystem - Secure Digital Voting Platform

A modern, secure, and transparent digital voting platform built with Next.js 14, MongoDB, and Tailwind CSS. This platform supports three distinct user roles: **Admin**, **Candidate**, and **Voter**, each with specific functionalities and dashboards.

## 🚀 Features

### Universal Authentication

- Single login/registration page for all user types
- Role-based access control
- Secure password hashing with bcryptjs
- JWT token-based authentication

### Admin Dashboard (`/admin`)

- **Candidate Management**: Add and remove candidates
- **Real-time Statistics**: View total candidates, votes, and leading candidate
- **Secure Operations**: Only authenticated admins can perform administrative actions

### Voter Dashboard (`/voter`)

- **Vote Casting**: Cast votes for candidates with duplicate prevention
- **Real-time Updates**: Live vote count updates with 5-second polling
- **Vote Status**: Track voting history and prevent multiple votes
- **Candidate Viewing**: Browse all candidates with their information

### Candidate Dashboard (`/candidate`)

- **Personal Profile**: View name, party, and vote count
- **Campaign Statistics**: Track campaign progress and duration
- **Vote Monitoring**: Real-time vote count updates

## 🛠️ Technology Stack

- **Frontend**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS v4
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT tokens with bcryptjs
- **Backend**: Next.js API Routes
- **Language**: JavaScript (JSX)

## 📋 Prerequisites

- Node.js 18+
- MongoDB (local or cloud instance)
- npm or yarn package manager

## 🚀 Quick Start

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd voting-system
npm install
```

### 2. Environment Setup

Create a `.env.local` file in the root directory:

```env
# MongoDB Connection String
MONGODB_URI=mongodb://localhost:27017/voting-system

# JWT Secret Key (generate a strong key for production)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

### 3. Database Setup

Ensure MongoDB is running and accessible. The application will automatically create the necessary collections and indexes.

### 4. Create Admin User

To create an admin user, you can either:

**Option A: Use the registration page**

1. Start the development server
2. Go to `http://localhost:3000/?mode=register`
3. Register with role "candidate" (admins are created manually)
4. Use MongoDB Compass or mongo shell to update the user's role to "admin"

**Option B: Direct database insertion**

```javascript
// In MongoDB shell or Compass
db.users.insertOne({
  name: "System Administrator",
  email: "admin@votesystem.com",
  password: "$2a$12$...", // bcrypt hash of "admin123"
  role: "admin",
  createdAt: new Date(),
  updatedAt: new Date(),
});
```

### 5. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
voting-system/
├── src/
│   ├── app/
│   │   ├── page.js                 # Landing page with authentication
│   │   ├── admin/page.js           # Admin dashboard
│   │   ├── voter/page.js           # Voter dashboard
│   │   ├── candidate/page.js       # Candidate dashboard
│   │   ├── api/                    # API routes
│   │   │   ├── auth/
│   │   │   │   ├── register/route.js
│   │   │   │   └── login/route.js
│   │   │   ├── candidates/
│   │   │   │   ├── route.js
│   │   │   │   └── [id]/route.js
│   │   │   ├── vote/route.js
│   │   │   └── voter-status/[userId]/route.js
│   │   ├── layout.js               # Root layout
│   │   └── globals.css             # Global styles
│   ├── components/                  # Reusable components
│   │   ├── AuthForm.jsx
│   │   ├── CandidateCard.jsx
│   │   ├── LoadingSpinner.jsx
│   │   ├── Modal.jsx
│   │   └── Navbar.jsx
│   ├── lib/                        # Utility functions
│   │   ├── auth.js                 # JWT authentication helpers
│   │   └── mongodb.js              # Database connection
│   └── models/                     # Mongoose models
│       ├── Candidate.js
│       ├── User.js
│       └── Voter.js
├── tailwind.config.js              # Tailwind CSS configuration
├── next.config.mjs                 # Next.js configuration
└── package.json
```

## 🔐 API Endpoints

### Authentication

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Candidates

- `GET /api/candidates` - Fetch all candidates
- `POST /api/candidates` - Add new candidate (Admin only)
- `DELETE /api/candidates/[id]` - Remove candidate (Admin only)

### Voting

- `POST /api/vote` - Cast vote
- `GET /api/voter-status/[userId]` - Check voter status

## 🎨 UI/UX Features

- **Responsive Design**: Fully responsive across mobile, tablet, and desktop
- **Modern UI**: Clean, professional interface with Tailwind CSS
- **Real-time Updates**: Live vote counting and candidate list updates
- **Custom Modals**: Replaced native alerts with custom modal components
- **Loading States**: Comprehensive loading indicators and feedback
- **Error Handling**: Graceful error handling with user-friendly messages

## 🔒 Security Features

- **Password Hashing**: bcryptjs for secure password storage
- **JWT Authentication**: Token-based session management
- **Role-based Access**: Strict role verification for all operations
- **Duplicate Vote Prevention**: Atomic operations prevent double voting
- **Input Validation**: Comprehensive server-side validation
- **CORS Protection**: Built-in Next.js security features

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically

### Other Platforms

The application can be deployed to any platform that supports Next.js:

- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 🧪 Testing

To test the application:

1. **Register as a Voter**: Create a voter account and test voting functionality
2. **Register as a Candidate**: Create a candidate account to view candidate dashboard
3. **Admin Operations**: Use the admin account to add/remove candidates
4. **Vote Casting**: Test the voting system with multiple voters
5. **Real-time Updates**: Verify that vote counts update in real-time

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:

- Create an issue in the GitHub repository
- Check the documentation in the `/docs` folder
- Review the API documentation above

## 🔄 Version History

- **v1.0.0**: Initial release with core voting functionality
- Complete role-based access control
- Real-time vote counting
- Responsive design implementation
- Security features implementation
