const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    accountNumber: { type: String, required: true, unique: true },
    balance: { type: Number, default: 0, min: 0 },
    currency: { type: String, default: 'INR' },
    accountType: { type: String, enum: ['savings', 'current'], default: 'savings' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Account', accountSchema);
