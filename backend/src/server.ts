import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import chatbotRoutes from './routes/chatbots';
import { testConnection } from './db';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors()); // Allow frontend to call backend
app.use(express.json()); // Parse JSON requests

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/chatbots', chatbotRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});


// Start server
async function startServer() {
  // Test database connection first
  const dbConnected = await testConnection();
  
  if (!dbConnected) {
    console.error('Failed to connect to database. Exiting...');
    process.exit(1);
  }
  
  app.listen(PORT, () => {
    console.log(`
    ✅ Server running on http://localhost:${PORT}
    ✅ Database connected
    
    API Endpoints:
    - POST   /api/auth/signup
    - POST   /api/auth/login
    - GET    /api/chatbots
    - GET    /api/chatbots/:id
    - POST   /api/chatbots
    - PUT    /api/chatbots/:id
    - DELETE /api/chatbots/:id
    `);
  });
}

startServer();