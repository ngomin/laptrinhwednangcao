
const express = require('express');
const router = express.Router();
const CategoryController = require('../controllers/categoryController');
const { isAuthenticated } = require('../middleware/auth');

router.use(isAuthenticated);

router.get('/', CategoryController.index);
router.get('/create', CategoryController.getCreate);
router.post('/create', CategoryController.postCreate);
router.get('/:id/edit', CategoryController.getEdit);
router.post('/:id/edit', CategoryController.postEdit);
router.post('/:id/delete', CategoryController.delete);

module.exports = router;