// controllers/authController.js
// Xử lý logic xác thực: đăng nhập, đăng xuất, đổi mật khẩu

const UserModel = require('../models/userModel');

const AuthController = {
  // GET /auth/login
  getLogin(req, res) {
    if (req.session.user) return res.redirect('/dashboard');
    res.render('auth/login', {
      title: 'Đăng nhập',
      error: req.flash('error'),
      success: req.flash('success')
    });
  },

  // POST /auth/login
  async postLogin(req, res) {
    const { username, password } = req.body;

    if (!username || !password) {
      req.flash('error', 'Vui lòng nhập đầy đủ thông tin.');
      return res.redirect('/auth/login');
    }

    const user = UserModel.findByUsername(username);
    if (!user) {
      req.flash('error', 'Tên đăng nhập hoặc mật khẩu không đúng.');
      return res.redirect('/auth/login');
    }

    const isMatch = await UserModel.verifyPassword(password, user.password);
    if (!isMatch) {
      req.flash('error', 'Tên đăng nhập hoặc mật khẩu không đúng.');
      return res.redirect('/auth/login');
    }

    req.session.user = UserModel.safeUser(user);
    req.flash('success', `Chào mừng ${user.fullName}!`);
    res.redirect('/dashboard');
  },

  // GET /auth/logout
  logout(req, res) {
    req.session.destroy(() => {
      res.redirect('/auth/login');
    });
  },

  // GET /auth/profile
  getProfile(req, res) {
    const user = UserModel.findById(req.session.user.id);
    res.render('auth/profile', {
      title: 'Hồ sơ cá nhân',
      user: UserModel.safeUser(user),
      error: req.flash('error'),
      success: req.flash('success')
    });
  },

  // POST /auth/profile
  async updateProfile(req, res) {
    const { fullName, email } = req.body;
    const userId = req.session.user.id;

    await UserModel.update(userId, { fullName, email });
    req.session.user = { ...req.session.user, fullName, email };
    req.flash('success', 'Cập nhật hồ sơ thành công.');
    res.redirect('/auth/profile');
  },

  // POST /auth/change-password
  async changePassword(req, res) {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    const userId = req.session.user.id;

    if (newPassword !== confirmPassword) {
      req.flash('error', 'Mật khẩu mới không khớp.');
      return res.redirect('/auth/profile');
    }

    const user = UserModel.findById(userId);
    const isMatch = await UserModel.verifyPassword(currentPassword, user.password);
    if (!isMatch) {
      req.flash('error', 'Mật khẩu hiện tại không đúng.');
      return res.redirect('/auth/profile');
    }

    await UserModel.update(userId, { password: newPassword });
    req.flash('success', 'Đổi mật khẩu thành công.');
    res.redirect('/auth/profile');
  },

  // ============ QUẢN LÝ NGƯỜI DÙNG (Admin) ============

  // GET /auth/users
  listUsers(req, res) {
    const users = UserModel.getAll().map(u => UserModel.safeUser(u));
    res.render('auth/users', {
      title: 'Quản lý người dùng',
      users,
      error: req.flash('error'),
      success: req.flash('success')
    });
  },

  // POST /auth/users/create
  async createUser(req, res) {
    const { username, password, fullName, email, role } = req.body;
    const exists = UserModel.findByUsername(username);
    if (exists) {
      req.flash('error', 'Tên đăng nhập đã tồn tại.');
      return res.redirect('/auth/users');
    }
    await UserModel.create({ username, password, fullName, email, role });
    req.flash('success', 'Tạo người dùng thành công.');
    res.redirect('/auth/users');
  },