require('dotenv').config();

module.exports = {
  jwtSecret: process.env.JWT_SECRET || 'supersecretjwtkey_changeinproduction',
  jwtExpire: '15m',
  refreshExpireDays: 7,
  mongoUri: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/jwt_banking',
  port: process.env.PORT || 5000
};
