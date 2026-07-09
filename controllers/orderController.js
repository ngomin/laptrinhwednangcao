
// Xử lý logic quản lý đơn hàng

const OrderModel = require('../models/orderModel');
const OrderDetailModel = require('../models/orderDetailModel');
const CustomerModel = require('../models/customerModel');
const ProductModel = require('../models/productModel');

const OrderController = {
  // GET /orders
  index(req, res) {
    const { search, status, paymentStatus, from, to } = req.query;
    let orders = search ? OrderModel.search(search) : OrderModel.getAll();

    if (status || paymentStatus || from || to) {
      orders = OrderModel.filter({ status, paymentStatus, from, to });
    }

    // Gắn tên khách hàng vào mỗi đơn
    const customers = CustomerModel.getAll();
    orders = orders.map(o => ({
      ...o,
      customerName: customers.find(c => c.id === o.customerId)?.name || 'N/A'
    }));

    // Sắp xếp mới nhất lên đầu
    orders.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));

    const stats = OrderModel.getRevenueStats();

    res.render('orders/index', {
      title: 'Quản lý Đơn hàng',
      orders,
      stats,
      filters: { search: search || '', status: status || '', paymentStatus: paymentStatus || '', from: from || '', to: to || '' },
      error: req.flash('error'),
      success: req.flash('success')
    });
  },

  // GET /orders/create
  getCreate(req, res) {
    const customers = CustomerModel.getAll().filter(c => c.status === 'active');
    const products = ProductModel.getAll().filter(p => p.status === 'active' && p.stock > 0);
    res.render('orders/create', {
      title: 'Tạo Đơn hàng',
      customers,
      products,
      error: req.flash('error')
    });
  },

  // POST /orders/create
  postCreate(req, res) {
    const {
      customerId, paymentMethod, deliveryDate, discount, tax, note,
      productIds, quantities, unitPrices, productNames, units, itemDiscounts
    } = req.body;

    if (!customerId) {
      req.flash('error', 'Vui lòng chọn khách hàng.');
      return res.redirect('/orders/create');
    }

    // Tính subtotal
    const pIds = Array.isArray(productIds) ? productIds : [productIds];
    const qtys = Array.isArray(quantities) ? quantities : [quantities];
    const prices = Array.isArray(unitPrices) ? unitPrices : [unitPrices];
    const pNames = Array.isArray(productNames) ? productNames : [productNames];
    const pUnits = Array.isArray(units) ? units : [units];
    const iDiscounts = Array.isArray(itemDiscounts) ? itemDiscounts : [itemDiscounts];

    let subtotal = 0;
    const items = pIds.map((pid, i) => {
      const qty = parseInt(qtys[i]) || 0;
      const price = parseFloat(prices[i]) || 0;
      const disc = parseFloat(iDiscounts[i]) || 0;
      const total = qty * price - disc;
      subtotal += total;
      return { productId: pid, productName: pNames[i], quantity: qty, unitPrice: price, discount: disc, unit: pUnits[i], total };
    }).filter(item => item.quantity > 0);

    if (items.length === 0) {
      req.flash('error', 'Đơn hàng phải có ít nhất một sản phẩm.');
      return res.redirect('/orders/create');
    }

    const order = OrderModel.create({
      customerId,
      staffId: req.session.user.id,
      paymentMethod,
      deliveryDate,
      subtotal,
      discount: parseFloat(discount) || 0,
      tax: parseFloat(tax) || 0,
      note
    });

    OrderDetailModel.createBulk(order.id, items);

    // Trừ tồn kho
    items.forEach(item => {
      ProductModel.adjustStock(item.productId, -item.quantity);
    });

    req.flash('success', `Tạo đơn hàng ${order.code} thành công.`);
    res.redirect(`/orders/${order.id}`);
  },

  // GET /orders/:id
  show(req, res) {
    const order = OrderModel.findById(req.params.id);
    if (!order) {
      req.flash('error', 'Không tìm thấy đơn hàng.');
      return res.redirect('/orders');
    }
    const customer = CustomerModel.findById(order.customerId);
    const details = OrderDetailModel.getByOrderId(order.id);

    res.render('orders/show', {
      title: `Đơn hàng ${order.code}`,
      order,
      customer,
      details,
      error: req.flash('error'),
      success: req.flash('success')
    });
  },

  // POST /orders/:id/status
  updateStatus(req, res) {
    const { status } = req.body;
    const validStatuses = ['pending', 'confirmed', 'delivering', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      req.flash('error', 'Trạng thái không hợp lệ.');
      return res.redirect(`/orders/${req.params.id}`);
    }
    const order = OrderModel.updateStatus(req.params.id, status);
    if (!order) {
      req.flash('error', 'Không tìm thấy đơn hàng.');
      return res.redirect('/orders');
    }

    // Nếu hoàn thành → cập nhật thống kê khách hàng
    if (status === 'completed') {
      CustomerModel.updateStats(order.customerId, order.total);
    }

    req.flash('success', 'Cập nhật trạng thái đơn hàng thành công.');
    res.redirect(`/orders/${req.params.id}`);
  },

  // POST /orders/:id/payment
  updatePayment(req, res) {
    const { paymentStatus } = req.body;
    OrderModel.updatePayment(req.params.id, paymentStatus);
    req.flash('success', 'Cập nhật thanh toán thành công.');
    res.redirect(`/orders/${req.params.id}`);
  },

  // POST /orders/:id/delete
  delete(req, res) {
    const order = OrderModel.findById(req.params.id);
    if (!order || order.status !== 'cancelled') {
      req.flash('error', 'Chỉ có thể xoá đơn hàng đã huỷ.');
      return res.redirect('/orders');
    }
    OrderDetailModel.deleteByOrderId(req.params.id);
    OrderModel.delete(req.params.id);
    req.flash('success', 'Đã xoá đơn hàng.');
    res.redirect('/orders');
  }
};

module.exports = OrderController;