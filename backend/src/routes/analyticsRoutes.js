const express = require('express');
const router = express.Router();
const { getAnalytics, getBudget, setBudget } = require('../controllers/analyticsController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/analytics', getAnalytics);
router.route('/budget').get(getBudget).post(setBudget);

module.exports = router;
