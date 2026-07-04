const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');
const { isAuthenticated, isAdmin, isGuest } = require('../middleware/auth');

// --- Public routes (chưa đăng nhập) ---
router.get('/login', isGuest, AuthController.getLogin);
router.post('/login', isGuest, AuthController.postLogin);

// --- Protected routes (đã đăng nhập) ---
router.get('/logout', isAuthenticated, AuthController.logout);
router.get('/profile', isAuthenticated, AuthController.getProfile);
router.post('/profile', isAuthenticated, AuthController.updateProfile);
router.post('/change-password', isAuthenticated, AuthController.changePassword);

// --- Admin only routes ---
router.get('/users', isAuthenticated, isAdmin, AuthController.listUsers);
router.post('/users/create', isAuthenticated, isAdmin, AuthController.createUser);
router.post('/users/:id/delete', isAuthenticated, isAdmin, AuthController.deleteUser);

module.exports = router;