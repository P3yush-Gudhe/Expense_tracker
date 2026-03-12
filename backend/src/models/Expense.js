const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: [true, 'Please add an amount']
  },
  category: {
    type: String,
    required: [true, 'Please add a category'],
    enum: ['Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Health', 'Other']
  },
  description: {
    type: String,
    trim: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  tags: [String]
}, {
  timestamps: true
});

module.exports = mongoose.model('Expense', expenseSchema);
