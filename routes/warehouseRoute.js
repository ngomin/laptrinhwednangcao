
const express = require('express');
const router = express.Router();
const WarehouseController = require('../controllers/warehouseController');
const { isAuthenticated } = require('../middleware/auth');

router.use(isAuthenticated);

router.get('/', WarehouseController.index);
router.get('/import', WarehouseController.getImport);
router.post('/import', WarehouseController.postImport);
router.get('/export', WarehouseController.getExport);
router.post('/export', WarehouseController.postExport);
router.get('/adjust', WarehouseController.getAdjust);
router.post('/adjust', WarehouseController.postAdjust);

module.exports = router;