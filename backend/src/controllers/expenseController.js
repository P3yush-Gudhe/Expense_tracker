const Expense = require('../models/Expense');

// @desc    Get all expenses for a user
// @route   GET /api/expenses
const getExpenses = async (req, res) => {
  try {
    const { category, startDate, endDate, search, sortBy = 'date', order = 'desc' } = req.query;
    const filter = { user: req.user._id };

    if (category && category !== 'All') filter.category = category;
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(new Date(endDate).setHours(23, 59, 59, 999));
    }
    if (search) {
      filter.$or = [
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const sortOrder = order === 'asc' ? 1 : -1;
    const expenses = await Expense.find(filter).sort({ [sortBy]: sortOrder });
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add an expense
// @route   POST /api/expenses
const addExpense = async (req, res) => {
  try {
    const { amount, category, description, date, tags } = req.body;
    const expense = await Expense.create({
      user: req.user._id,
      amount,
      category,
      description,
      date: date || new Date(),
      tags: tags || []
    });
    res.status(201).json(expense);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update an expense
// @route   PUT /api/expenses/:id
const updateExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) return res.status(404).json({ message: 'Expense not found' });
    if (expense.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    const updated = await Expense.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete an expense
// @route   DELETE /api/expenses/:id
const deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) return res.status(404).json({ message: 'Expense not found' });
    if (expense.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    await expense.deleteOne();
    res.json({ message: 'Expense removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getExpenses, addExpense, updateExpense, deleteExpense };
