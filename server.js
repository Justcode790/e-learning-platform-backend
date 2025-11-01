const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const connectDB  = require('./config/db');
const authRoutes = require('./routes/auth');
const teacherRoutes = require('./routes/teachers');
const studentRoutes = require('./routes/students');
const courseRoutes = require('./routes/courses');
const uploadRoutes = require("./routes/upload");
const { errorHandler } = require('./middleware/errorHandler');

dotenv.config();

const app = express();

// CORS
// const allowedOrigin = process.env.FRONTEND_URL || 'http://localhost:5173';
// app.use(cors({ origin: allowedOrigin, credentials: true }));
app.use(cors());

// Security and logging
app.use(helmet());
app.use(morgan('dev'));

// Body parsing
app.use(express.json({ limit: '1mb' }));

// Database connection
connectDB();
app.get('/', (req, res) => {
  res.send('backend is well');
});


// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/media', uploadRoutes);

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = app;