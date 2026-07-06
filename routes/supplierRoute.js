
const express = require('express');
const router = express.Router();
const SupplierController = require('../controllers/supplierController');
const { isAuthenticated } = require('../middleware/auth');

router.use(isAuthenticated);

router.get('/', SupplierController.index);
router.get('/create', SupplierController.getCreate);
router.post('/create', SupplierController.postCreate);
router.get('/:id', SupplierController.show);
router.get('/:id/edit', SupplierController.getEdit);
router.post('/:id/edit', SupplierController.postEdit);
router.post('/:id/delete', SupplierController.delete);

module.exports = router;