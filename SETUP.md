# Physio-Note Development Setup

## Quick Start Guide

### 1. Install Dependencies

```bash
# Install root dependencies (for running both servers concurrently)
npm install

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 2. Configure Environment Variables

#### Server Configuration
```bash
cd server
cp .env.example .env
```

Edit `server/.env` and add your MongoDB Atlas connection string:
```env
PORT=5000
MONGODB_URI=your_mongodb_atlas_connection_string_here
JWT_SECRET=your_jwt_secret_key_here
NODE_ENV=development
```

#### Client Configuration
```bash
cd ../client
cp .env.example .env
```

The default configuration should work for local development.

### 3. Set Up MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account (if you don't have one)
3. Create a new cluster
4. Click "Connect" → "Connect your application"
5. Copy the connection string and paste it into `server/.env`
6. Replace `<password>` with your database user password

### 4. Run the Application

From the root directory:

```bash
# Run both client and server concurrently
npm run dev
```

Or run them separately:

```bash
# Terminal 1 - Backend
cd server && npm run dev

# Terminal 2 - Frontend
cd client && npm run dev
```

The application will be available at:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000

## Development Workflow

### API Testing

Test the health endpoint:
```bash
curl http://localhost:5000/api/health
```

### Project Structure

```
Physio-Note/
├── client/                    # React frontend
│   ├── src/
│   │   ├── components/       # Reusable components
│   │   ├── context/          # React context (Auth)
│   │   ├── pages/            # Page components
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
│
├── server/                    # Express backend
│   ├── src/
│   │   ├── models/           # MongoDB models
│   │   ├── routes/           # API routes
│   │   ├── middleware/       # Express middleware
│   │   └── server.js
│   └── package.json
│
└── package.json              # Root package for scripts
```

## Available Scripts

### Root Level
- `npm run dev` - Run both client and server
- `npm run server:dev` - Run only server
- `npm run client:dev` - Run only client
- `npm run install:all` - Install all dependencies

### Server
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon

### Client
- `npm run dev` - Start Vite dev server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Next Steps

1. Complete patient management features
2. Implement session scheduling with calendar
3. Add voice-to-text integration for notes
4. Implement AI suggestions for clinical documentation
5. Add file upload for patient documents
6. Implement reporting and analytics

## Troubleshooting

### MongoDB Connection Issues
- Verify your IP address is whitelisted in MongoDB Atlas
- Check that your connection string is correct
- Ensure your database user has proper permissions

### Port Already in Use
If port 5000 or 5173 is already in use, change the PORT in `.env` files.

### Module Not Found
Run `npm install` in the appropriate directory (root, server, or client).
