
// Các route quản lý đơn hàng

const express = require('express');
const router = express.Router();
const OrderController = require('../controllers/orderController');
const { isAuthenticated } = require('../middleware/auth');

router.use(isAuthenticated);

router.get('/', OrderController.index);
router.get('/create', OrderController.getCreate);
router.post('/create', OrderController.postCreate);
router.get('/:id', OrderController.show);
router.post('/:id/status', OrderController.updateStatus);
router.post('/:id/payment', OrderController.updatePayment);
router.post('/:id/delete', OrderController.delete);

module.exports = router;