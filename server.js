const express = require('express');
const cors = require('cors');
const app = express();
const path = require('path');
const db = require('./config/db');

// Connect DB
db.authenticate()
  .then(() => console.log('Database connected... 😎'))
  .catch(err => console.error('Database connection failed:', err));

// Middleware
app.use(cors());
app.use(express.json());

// Serve uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/student', require('./routes/student.routes'));
app.use('/api/institute', require('./routes/institute.routes'));
app.use('/api/admin', require('./routes/admin.routes'));

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke! Our developers are crying 😭');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}...`));