import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';

// Import routes
import quizRoutes from './src/routes/quizroutes.js';
import leaderboardRoutes from './src/routes/leaderboardroutes.js';
import resultRoutes from './src/routes/resultroutes.js';
import authRoutes from './src/routes/authRoutes.js';
import { initIO } from './src/services/socket.js';


// ES Module dirname setup
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env with explicit path
if (process.env.NODE_ENV !== "production"){
dotenv.config({ path: path.join(__dirname, '.env') });
}



// Check required env vars
// Validate env vars
const PORT = process.env.PORT || 5500;
const MONGO_URI = process.env.MONGO_URI;
const JWT_SECRET = process.env.JWT_SECRET;

if (!MONGO_URI || !JWT_SECRET) {
    console.error('❌ Missing required env vars: MONGO_URI or JWT_SECRET');
    // Don't exit immediately in development to see what works
    if (process.env.NODE_ENV === 'production') {
        process.exit(1);
    }
}

const app = express();
const server = createServer(app);

// -------------------- MIDDLEWARE --------------------
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: "*", // FREE hosting safe; restrict later if custom domain added
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);


// Socket.io setup
const io = new Server(server, {
    cors: { origin: '*', 
    methods: ['GET', 'POST'] 
    },
    transports: ['websocket', 'polling']
});

io.on('connection', socket => {
    console.log('✅ Client connected:', socket.id);
    socket.on('disconnect', () => console.log('❌ Client disconnected:', socket.id));
});

// Initialize socket service
initIO(io);

// Connect to MongoDB
mongoose.connect(MONGO_URI)
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch(err => {
        console.error('❌ MongoDB Error:', err);
        process.exit(1);
    });

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/results', resultRoutes);

// Serve static frontend files
const publicPath = path.join(__dirname, 'public');
app.use(express.static(publicPath));
console.log('📁 Static files served from:', publicPath);

// SPA fallback: only return index.html for navigation (html) requests
app.get('*', (req, res, next) => {
  const accept = req.headers.accept || '';
  const ext = path.extname(req.path); // has extension like .css, .js, .png

  // If request looks like an asset (has extension) or doesn't accept HTML, let static/other handlers handle it
  if (ext || !accept.includes('text/html')) {
    return next();
  }

  // Otherwise serve the SPA entry
  res.sendFile(path.join(publicPath, 'index.html'));
});

// Start server
server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});

export { io };