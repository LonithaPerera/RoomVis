const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

const path = require('path');

// Middleware
app.use(cors());
app.use(express.json());

app.use('/api/uploads', (req, res, next) => {
  console.log('Upload request:', req.url);
  next();
}, express.static(path.join(__dirname, 'uploads')));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/furniture', require('./routes/furniture'));
app.use('/api/designs', require('./routes/designs'));
app.use('/api/admin', require('./routes/admin'));

app.get('/', (req, res) => {
  res.send('RoomVis API is running...');
});

// Database Connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch((err) => console.log('MongoDB Connection Error:', err));

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
