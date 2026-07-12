
// Route trang tổng quan

const express = require('express');
const router = express.Router();
const DashboardController = require('../controllers/dashboardController');
const { isAuthenticated } = require('../middleware/auth');

router.use(isAuthenticated);

router.get('/', DashboardController.index);

module.exports = router;