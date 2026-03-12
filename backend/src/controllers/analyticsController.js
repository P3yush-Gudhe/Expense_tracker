const Expense = require('../models/Expense');
const Budget = require('../models/Budget');

// @desc    Get analytics summary
// @route   GET /api/analytics
const getAnalytics = async (req, res) => {
  try {
    const userId = req.user._id;
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    // Total this month
    const monthlyExpenses = await Expense.find({
      user: userId,
      date: { $gte: firstDayOfMonth, $lte: lastDayOfMonth }
    });
    const monthlyTotal = monthlyExpenses.reduce((sum, e) => sum + e.amount, 0);

    // Category breakdown for this month
    const categoryBreakdown = await Expense.aggregate([
      { $match: { user: userId, date: { $gte: firstDayOfMonth, $lte: lastDayOfMonth } } },
      { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $sort: { total: -1 } }
    ]);

    // Monthly trend (last 6 months)
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    const monthlyTrend = await Expense.aggregate([
      { $match: { user: userId, date: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { year: { $year: '$date' }, month: { $month: '$date' } },
          total: { $sum: '$amount' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Budget info
    const budget = await Budget.findOne({ user: userId });

    // Recent transactions
    const recentExpenses = await Expense.find({ user: userId }).sort({ date: -1 }).limit(5);

    res.json({
      monthlyTotal,
      monthlyExpenses: monthlyExpenses.length,
      categoryBreakdown,
      monthlyTrend,
      budget: budget ? budget.monthlyLimit : null,
      recentExpenses
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get/Set budget
// @route   GET /api/budget
const getBudget = async (req, res) => {
  try {
    const budget = await Budget.findOne({ user: req.user._id });
    res.json(budget || { monthlyLimit: 0 });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   POST /api/budget
const setBudget = async (req, res) => {
  try {
    const { monthlyLimit } = req.body;
    const budget = await Budget.findOneAndUpdate(
      { user: req.user._id },
      { monthlyLimit },
      { new: true, upsert: true }
    );
    res.json(budget);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getAnalytics, getBudget, setBudget };
