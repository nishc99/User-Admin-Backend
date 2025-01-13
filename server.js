// const express = require('express');
// const connectDB = require('./config/db');
// const userRoutes = require('./routes/user');
// const dotenv = require('dotenv');
// const cors = require('cors');

// dotenv.config();

// const app = express();

// connectDB();

// app.use(cors());
// app.use(express.json({ extended: false })); 

// app.use('/api/users', userRoutes);

// app.use('/api', userRoutes);

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });


const express = require('express');
const connectDB = require('./config/db');
const userRoutes = require('./routes/user');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/users', userRoutes);

// Default Route for unmatched paths
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Global Error Handler
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
