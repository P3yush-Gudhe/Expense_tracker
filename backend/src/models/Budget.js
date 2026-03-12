const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  monthlyLimit: {
    type: Number,
    required: [true, 'Please set a monthly limit'],
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Budget', budgetSchema);
