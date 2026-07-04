// routes/productRoute.js
const express = require('express');
const router = express.Router();
const ProductController = require('../controllers/productController');
const { isAuthenticated } = require('../middleware/auth');

router.use(isAuthenticated);

router.get('/', ProductController.index);
router.get('/create', ProductController.getCreate);
router.post('/create', ProductController.postCreate);
router.get('/:id', ProductController.show);
router.get('/:id/edit', ProductController.getEdit);
router.post('/:id/edit', ProductController.postEdit);
router.post('/:id/delete', ProductController.delete);

module.exports = router;