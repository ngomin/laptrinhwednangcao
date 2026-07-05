const express = require('express');
const router = express.Router();
const CustomerController = require('../controllers/customerController');
const { isAuthenticated } = require('../middleware/auth');

router.use(isAuthenticated);

router.get('/', CustomerController.index);
router.get('/create', CustomerController.getCreate);
router.post('/create', CustomerController.postCreate);
router.get('/:id', CustomerController.show);
router.get('/:id/edit', CustomerController.getEdit);
router.post('/:id/edit', CustomerController.postEdit);
router.post('/:id/delete', CustomerController.delete);
router.post('/:id/toggle-status', CustomerController.toggleStatus);

module.exports = router;