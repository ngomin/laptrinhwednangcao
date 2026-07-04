// data/seed.js
// Tạo dữ liệu mẫu cho ứng dụng: chạy bằng `npm run seed`
// (Phải chạy sau khi `npm install` vì cần bcryptjs để hash mật khẩu)

const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const DB_PATH = path.join(__dirname, 'db.json');

async function seed() {
  const now = new Date().toISOString();

  // ---------- Users ----------
  const adminPass = await bcrypt.hash('admin123', 10);
  const staffPass = await bcrypt.hash('staff123', 10);

  const adminId = uuidv4();
  const staffId = uuidv4();

  const users = [
    {
      id: adminId,
      username: 'admin',
      password: adminPass,
      fullName: 'Quản trị viên',
      email: 'admin@kho.vn',
      role: 'admin',
      avatar: '',
      createdAt: now
    },
    {
      id: staffId,
      username: 'staff',
      password: staffPass,
      fullName: 'Nguyễn Văn Nhân Viên',
      email: 'staff@kho.vn',
      role: 'staff',
      avatar: '',
      createdAt: now
    }
  ];

  // ---------- Categories ----------
  const catDienTuId = uuidv4();
  const catGiaDungId = uuidv4();
  const catVanPhongId = uuidv4();

  const categories = [
    { id: catDienTuId, name: 'Điện tử', slug: 'dien-tu', description: 'Thiết bị điện tử, linh kiện', status: 'active', createdAt: now },
    { id: catGiaDungId, name: 'Gia dụng', slug: 'gia-dung', description: 'Đồ dùng gia đình', status: 'active', createdAt: now },
    { id: catVanPhongId, name: 'Văn phòng phẩm', slug: 'van-phong-pham', description: 'Dụng cụ văn phòng', status: 'active', createdAt: now }
  ];

  // ---------- Suppliers ----------
  const sup1Id = uuidv4();
  const sup2Id = uuidv4();

  const suppliers = [
    {
      id: sup1Id,
      name: 'Công ty TNHH Thiết bị Điện tử An Phát',
      contact: 'Trần Văn Phát',
      phone: '0901234567',
      email: 'anphat@supplier.vn',
      address: '12 Nguyễn Trãi, Q.1, TP.HCM',
      taxCode: '0301234567',
      status: 'active',
      note: 'Nhà cung cấp linh kiện điện tử lâu năm',
      createdAt: now
    },
    {
      id: sup2Id,
      name: 'Công ty CP Gia dụng Việt Mỹ',
      contact: 'Lê Thị Mỹ',
      phone: '0912345678',
      email: 'vietmy@supplier.vn',
      address: '88 Lê Lợi, Q.Hải Châu, Đà Nẵng',
      taxCode: '0401234567',
      status: 'active',
      note: '',
      createdAt: now
    }
  ];

  // ---------- Products ----------
  const p1Id = uuidv4();
  const p2Id = uuidv4();
  const p3Id = uuidv4();
  const p4Id = uuidv4();
  const p5Id = uuidv4();

  const products = [
    {
      id: p1Id, code: 'SP001', name: 'Bàn phím cơ Logitech K120',
      categoryId: catDienTuId, supplierId: sup1Id, unit: 'Cái',
      costPrice: 250000, salePrice: 350000, stock: 45, minStock: 10,
      description: 'Bàn phím cơ giá rẻ, bền bỉ', status: 'active', image: '', createdAt: now
    },
    {
      id: p2Id, code: 'SP002', name: 'Chuột không dây Logitech M331',
      categoryId: catDienTuId, supplierId: sup1Id, unit: 'Cái',
      costPrice: 180000, salePrice: 280000, stock: 8, minStock: 10,
      description: 'Chuột không dây êm ái', status: 'active', image: '', createdAt: now
    },
    {
      id: p3Id, code: 'SP003', name: 'Nồi cơm điện Sharp 1.8L',
      categoryId: catGiaDungId, supplierId: sup2Id, unit: 'Cái',
      costPrice: 650000, salePrice: 890000, stock: 20, minStock: 5,
      description: 'Nồi cơm điện nắp gài', status: 'active', image: '', createdAt: now
    },
    {
      id: p4Id, code: 'SP004', name: 'Bút bi Thiên Long TL-027',
      categoryId: catVanPhongId, supplierId: sup2Id, unit: 'Hộp',
      costPrice: 45000, salePrice: 65000, stock: 3, minStock: 15,
      description: 'Hộp 50 cây bút bi', status: 'active', image: '', createdAt: now
    },
    {
      id: p5Id, code: 'SP005', name: 'Quạt điện đứng Asia 16 inch',
      categoryId: catGiaDungId, supplierId: sup2Id, unit: 'Cái',
      costPrice: 420000, salePrice: 580000, stock: 0, minStock: 5,
      description: 'Quạt điện 3 tốc độ', status: 'active', image: '', createdAt: now
    }
  ];

  // ---------- Customers ----------
  const c1Id = uuidv4();
  const c2Id = uuidv4();
  const c3Id = uuidv4();

  const customers = [
    {
      id: c1Id, code: 'KH001', name: 'Phạm Thị Hoa',
      phone: '0987654321', email: 'hoa.pham@gmail.com',
      address: '23 Trần Hưng Đạo, Q.5, TP.HCM', type: 'retail',
      totalOrders: 1, totalSpent: 630000, status: 'active', note: '', createdAt: now
    },
    {
      id: c2Id, code: 'KH002', name: 'Công ty TNHH Bán lẻ Minh Khang',
      phone: '0938112233', email: 'minhkhang@company.vn',
      address: '45 Cách Mạng Tháng 8, Q.3, TP.HCM', type: 'wholesale',
      totalOrders: 1, totalSpent: 3560000, status: 'active', note: 'Khách sỉ thân thiết', createdAt: now
    },
    {
      id: c3Id, code: 'KH003', name: 'Đỗ Văn Bình',
      phone: '0909887766', email: 'binh.do@gmail.com',
      address: '101 Hai Bà Trưng, Q.1, TP.HCM', type: 'retail',
      totalOrders: 0, totalSpent: 0, status: 'active', note: '', createdAt: now
    }
  ];

  // ---------- Orders + OrderDetails ----------
  const o1Id = uuidv4();
  const o2Id = uuidv4();

  const orders = [
    {
      id: o1Id, code: 'DH001', customerId: c1Id, staffId: staffId,
      orderDate: now, deliveryDate: null,
      status: 'completed', paymentStatus: 'paid', paymentMethod: 'cash',
      subtotal: 630000, discount: 0, tax: 0, total: 630000,
      note: 'Giao trong giờ hành chính', createdAt: now
    },
    {
      id: o2Id, code: 'DH002', customerId: c2Id, staffId: adminId,
      orderDate: now, deliveryDate: null,
      status: 'completed', paymentStatus: 'paid', paymentMethod: 'transfer',
      subtotal: 3560000, discount: 100000, tax: 0, total: 3460000,
      note: 'Đơn sỉ tháng', createdAt: now
    }
  ];

  const orderDetails = [
    {
      id: uuidv4(), orderId: o1Id, productId: p1Id, productName: 'Bàn phím cơ Logitech K120',
      quantity: 1, unit: 'Cái', unitPrice: 350000, discount: 0, total: 350000
    },
    {
      id: uuidv4(), orderId: o1Id, productId: p2Id, productName: 'Chuột không dây Logitech M331',
      quantity: 1, unit: 'Cái', unitPrice: 280000, discount: 0, total: 280000
    },
    {
      id: uuidv4(), orderId: o2Id, productId: p3Id, productName: 'Nồi cơm điện Sharp 1.8L',
      quantity: 4, unit: 'Cái', unitPrice: 890000, discount: 0, total: 3560000
    }
  ];

  // ---------- Warehouse Transactions ----------
  const warehouseTransactions = [
    {
      id: uuidv4(), type: 'import', productId: p1Id, productName: 'Bàn phím cơ Logitech K120',
      quantity: 50, unit: 'Cái', unitCost: 250000, totalCost: 12500000,
      supplierId: sup1Id, note: 'Nhập đầu kỳ', staffId: adminId, createdAt: now
    },
    {
      id: uuidv4(), type: 'import', productId: p3Id, productName: 'Nồi cơm điện Sharp 1.8L',
      quantity: 24, unit: 'Cái', unitCost: 650000, totalCost: 15600000,
      supplierId: sup2Id, note: 'Nhập đầu kỳ', staffId: adminId, createdAt: now
    },
    {
      id: uuidv4(), type: 'export', productId: p1Id, productName: 'Bàn phím cơ Logitech K120',
      quantity: 1, unit: 'Cái', unitCost: 350000, totalCost: 350000,
      supplierId: null, note: 'Xuất bán DH001', staffId: staffId, createdAt: now
    },
    {
      id: uuidv4(), type: 'export', productId: p3Id, productName: 'Nồi cơm điện Sharp 1.8L',
      quantity: 4, unit: 'Cái', unitCost: 890000, totalCost: 3560000,
      supplierId: null, note: 'Xuất bán DH002', staffId: adminId, createdAt: now
    }
  ];

  const db = {
    users,
    categories,
    suppliers,
    products,
    customers,
    orders,
    orderDetails,
    warehouseTransactions
  };

  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf-8');
  console.log('✅ Đã tạo dữ liệu mẫu tại data/db.json');
  console.log('');
  console.log('Tài khoản đăng nhập mẫu:');
  console.log('  Admin  -> username: admin  | password: admin123');
  console.log('  Staff  -> username: staff  | password: staff123');
}

// Cho phép dùng theo 2 cách:
// 1) `node data/seed.js` hoặc `npm run seed` -> chạy trực tiếp, in log, thoát khi xong
// 2) `require('./data/seed')()` từ app.js -> trả về Promise để app.js có thể chờ (await) nếu cần
if (require.main === module) {
  seed().catch(err => {
    console.error('Lỗi khi tạo dữ liệu mẫu:', err);
    process.exit(1);
  });
}

module.exports = seed;
