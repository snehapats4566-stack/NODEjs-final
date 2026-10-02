require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./src/config/db');
const errorHandler = require('./src/middleware/errorHandler');

// Route imports
const authRoutes = require('./src/routes/authRoutes');
const petRoutes = require('./src/routes/petRoutes');
const adoptionRoutes = require('./src/routes/adoptionRoutes');
const userRoutes = require('./src/routes/userRoutes');

// Connect to MongoDB
connectDB();

const app = express();

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded pet photos as static files
app.use('/uploads', express.static(path.join(__dirname, process.env.UPLOAD_PATH || 'uploads')));

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/pets', petRoutes);
app.use('/api/adoption-requests', adoptionRoutes);
app.use('/api', userRoutes); // Mounts /api/profile and /api/users

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: '🐾 Pet Adoption API is running.',
    timestamp: new Date().toISOString(),
  });
});

// 404 handler for unknown routes
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found.` });
});

// Global error handler (must be last)
app.use(errorHandler);

// ─── Start Server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
