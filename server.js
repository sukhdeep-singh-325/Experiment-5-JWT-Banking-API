const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/jwt_banking';
const port = process.env.PORT || 5000;

mongoose
  .connect(mongoUri)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB error:', err));

app.get('/', (req, res) => {
  res.json({
    message: 'JWT Banking API is running',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      banking: '/api/banking'
    }
  });
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/banking', require('./routes/banking'));

app.listen(port, () => console.log(`Server running on port ${port}`));

module.exports = app;
