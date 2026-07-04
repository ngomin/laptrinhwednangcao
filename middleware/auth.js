// middleware/auth.js
// Middleware kiểm tra xác thực người dùng

function isAuthenticated(req, res, next) {
  if (req.session && req.session.user) {
    res.locals.currentUser = req.session.user;
    return next();
  }
  req.flash('error', 'Vui lòng đăng nhập để tiếp tục.');
  res.redirect('/auth/login');
}

function isGuest(req, res, next) {
  if (req.session && req.session.user) {
    return res.redirect('/dashboard');
  }
  next();
}

module.exports = { isAuthenticated, isAdmin, isGuest };