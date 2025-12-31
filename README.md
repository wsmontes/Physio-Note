# Physio-Note

An AI-powered medical scribe application designed specifically for physiotherapists, inspired by Heidi AI Medical Scribe.

## ⚠️ IMPORTANT NOTICE

**This application is currently NOT ready for production use with real patient data.**

- ❌ Not HIPAA compliant (no audit trails, encryption at rest, or BAA agreements)
- ❌ Security rating: 2/5 (Development/Demo only)
- ✅ Safe for: Testing, demos, portfolio, development with fake data

**See [PRODUCTION_WARNING.md](PRODUCTION_WARNING.md) for legal implications and requirements.**

**For deployment:** See [RENDER_QUICKSTART.md](RENDER_QUICKSTART.md) (15-min guide) or [DEPLOYMENT.md](DEPLOYMENT.md) (comprehensive guide)

---

## 🎯 Overview

Physio-Note streamlines documentation for physiotherapy sessions, helping practitioners focus more on patient care and less on paperwork. The application uses AI to assist with note-taking, treatment planning, and clinical documentation.

## 🛠 Tech Stack

### Frontend
- **React** with **Vite** - Modern, fast development
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Navigation and routing
- **Axios** - API communication
- **React Hook Form** - Form management
- **date-fns** - Date formatting

### Backend
- **Node.js** with **Express** - RESTful API server
- **MongoDB Atlas** - Cloud database solution
- **Mongoose** - MongoDB object modeling
- **JWT** - Authentication and authorization
- **OpenAI API** - AI-powered features
  - **Whisper** - Audio transcription
  - **GPT-5-nano** - Clinical note generation (most cost-efficient model)
- **Multer** - File upload handling

### AI Features
- **Voice-to-Text Transcription** - Real-time session transcription using Whisper
- **Smart SOAP Note Generation** - Auto-generate structured clinical notes with GPT-5-nano
- **Exercise Prescription Generator** - AI-powered home exercise program creation
- **Billing Code Suggestions** - Automated CPT code recommendations

## 📁 Project Structure

```
Physio-Note/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # Reusable React components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services
│   │   ├── hooks/         # Custom React hooks
│   │   ├── utils/         # Utility functions
│   │   └── App.jsx        # Main App component
│   ├── public/            # Static assets
│   └── package.json
│
├── server/                # Backend Node.js application
│   ├── src/
│   │   ├── config/        # Configuration files
│   │   ├── controllers/   # Route controllers
│   │   ├── models/        # MongoDB models
│   │   ├── routes/        # API routes
│   │   ├── middleware/    # Express middleware
│   │   └── server.js      # Entry point
│   └── package.json
│
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- MongoDB Atlas account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/Physio-Note.git
   cd Physio-Note
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies
   npm install

   # Install server dependencies
   cd server
   npm install

   # Install client dependencies
   cd ../client
   npm install
   ```

3. **Set up environment variables**

   Create `.env` files in both `client` and `server` directories:

   **server/.env**
   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_atlas_connection_string
   JWT_SECRET=your_jwt_secret_key
   NODE_ENV=development
   
   # OpenAI API Configuration
   OPENAI_API_KEY=your_openai_api_key
   OPENAI_MODEL=gpt-5-nano
   OPENAI_WHISPER_MODEL=whisper-1
   ```

   **client/.env**
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

4. **Start the development servers**

   ```bash
   # From root directory - run both client and server
   npm run dev

   # Or run separatelImplemented)

- 🎤 **Voice-to-Text Transcription** - Record or upload audio sessions, auto-transcribe with Whisper
- 📝 **AI-Powered SOAP Notes** - Generate structured clinical documentation with GPT-5-nano
- 👤 **Patient Management** - Comprehensive patient records with medical history
- 📊 **Session Tracking** - Track physiotherapy sessions with detailed assessments
- 💪 **Exercise Prescription** - AI-generated home exercise programs
- 📈 **Progress Tracking** - Range of motion, strength tests, functional assessments
- 💰 **Billing Code Suggestions** - Automated CPT code recommendations
- 🔒 **HIPAA-Focused Security** - Secure, encrypted data storage
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile

## 🎯 Physiotherapy-Specific Features

### Clinical Assessments
- Range of Motion (ROM) measurements
- Manual Muscle Testing (0-5 scale)
- Functional testing and scoring
- Postural assessment
- Gait analysis
- Pain scale tracking (0-10)

### Treatment Documentation
- SOAP note structure (Subjective, Objective, Assessment, Plan)
- Treatment interventions with sets/reps/duration
- Modalities used (ultrasound, TENS, heat/ice, etc.)
- Patient response tracking
- Goals progress monitoring

### Exercise Management
- Exercise prescriptions with detailed instructions
- Home exercise programs
- Exercise types: strengthening, stretching, balance, aerobic, functional
- Progression tracking

### Templates
- Initial evaluation templates
- Progress note templates
- Discharge summary templates
- Re-evaluation templates
- Exercise prescription templates
- Multiple specialty templates (orthopedic, sports, neuro, etc.)
   - Frontend: `http://localhost:5173`
   - Backend API: `http://localhost:5000`

## 📚 Core Features (Planned)

- 🎤 **Voice-to-Text** - Real-time transcription during patient sessions
- 📝 **AI-Assisted Documentation** - Smart suggestions for clinical notes
- 👤 **Patient Management** - Comprehensive patient records
- 📊 **Treatment Plans** - Track progress and plan interventions
- 📅 **Appointment Scheduling** - Manage sessions and follow-ups
- 🔒 **HIPAA Compliant** - Secure, encrypted data storage
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile

## 🗃 Database Schema

### Collections

- **users** - Physiotherapist accounts and profiles
- **patients** - Patient information and medical history
- **sessions** - Therapy session records
- **notes** - Clinical documentation and transcriptions
- **treatments** - Treatment plans and exercises

## 🔐 Authentication

The application uses JWT (JSON Web Tokens) for secure authentication:
- User registration and login
- Protected routes and API endpoints
- Token refresh mechanism

## 🧪 Testing

```bash
# Run backend tests
cd server && npm test

# Run frontend tests
cd client && npm test
```

## 📦 Deployment

### Backend (Example using Render/Railway)
1. Connect your GitHub repository
2. Set environment variables
3. Deploy from the `server` directory

### Frontend (Example using Vercel/Netlify)
1. Connect your GitHub repository
2. Set build command: `cd client && npm run build`
3. Set publish directory: `client/dist`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Inspired by [Heidi AI Medical Scribe](https://www.heidihealth.com/)
- Built for the physiotherapy community

## 📧 Contact

For questions or support, please open an issue in the GitHub repository.

---

**Note**: This project is under active development. Features and documentation will be updated regularly.
