// app.js
// Điểm khởi động chính của ứng dụng Quản lý Kho hàng

require('dotenv').config();

const express = require('express');
const session = require('express-session');
const flash = require('connect-flash');
const methodOverride = require('method-override');
const path = require('path');
const fs = require('fs');
const moment = require('moment');

const app = express();

// ---------- View engine ----------
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ---------- Middleware cơ bản ----------
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

// ---------- Session & Flash ----------
app.use(session({
  secret: process.env.SESSION_SECRET || 'quan-ly-kho-hang-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 8 // 8 giờ
  }
}));
app.use(flash());

// ---------- Biến dùng chung cho mọi view ----------
app.use((req, res, next) => {
  res.locals.currentUser = req.session.user || null;
  res.locals.moment = moment;
  res.locals.formatCurrency = (num) =>
    (parseFloat(num) || 0).toLocaleString('vi-VN') + ' đ';
  res.locals.currentPath = req.path;
  next();
});

// ---------- Routes ----------
app.get('/', (req, res) => res.redirect('/dashboard'));

app.use('/auth', require('./routes/authRoute'));
app.use('/dashboard', require('./routes/dashboardRoute'));
app.use('/categories', require('./routes/categoryRoute'));
app.use('/products', require('./routes/productRoute'));
app.use('/suppliers', require('./routes/supplierRoute'));
app.use('/customers', require('./routes/customerRoute'));
app.use('/orders', require('./routes/orderRoute'));
app.use('/warehouse', require('./routes/warehouseRoute'));

// ---------- 404 ----------
app.use((req, res) => {
  res.status(404).render('404', { title: 'Không tìm thấy trang' });
});

// ---------- Error handler ----------
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('500', { title: 'Lỗi hệ thống', error: err.message });
});

// ---------- Khởi động server  ----------
const PORT = process.env.PORT || 3000;

async function start() {
  const DB_FILE = path.join(__dirname, 'data', 'db.json');
  if (!fs.existsSync(DB_FILE)) {
    console.log('⚙️  Chưa có data/db.json, đang tạo dữ liệu mẫu...');
    const seed = require('./data/seed');
    await seed();
  }
  app.listen(PORT, () => {
    console.log(`✅ Server đang chạy tại http://localhost:${PORT}`);
  });
}

start();

module.exports = app;
