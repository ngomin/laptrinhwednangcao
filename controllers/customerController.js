// controllers/customerController.js
// Xử lý logic quản lý khách hàng

const CustomerModel = require('../models/customerModel');
const OrderModel = require('../models/orderModel');

const CustomerController = {
  // GET /customers
  index(req, res) {
    const { search, type, status } = req.query;
    let customers = search ? CustomerModel.search(search) : CustomerModel.getAll();

    if (type) customers = customers.filter(c => c.type === type);
    if (status) customers = customers.filter(c => c.status === status);

    const stats = CustomerModel.getStats();

    res.render('customers/index', {
      title: 'Quản lý Khách hàng',
      customers,
      stats,
      filters: { search: search || '', type: type || '', status: status || '' },
      error: req.flash('error'),
      success: req.flash('success')
    });
  },

  // GET /customers/create
  getCreate(req, res) {
    res.render('customers/create', {
      title: 'Thêm Khách hàng',
      customer: {},
      error: req.flash('error')
    });
  },

  // POST /customers/create
  postCreate(req, res) {
    const { name, phone, email, address, type, note } = req.body;
    if (!name) {
      req.flash('error', 'Tên khách hàng không được để trống.');
      return res.redirect('/customers/create');
    }
    CustomerModel.create({ name, phone, email, address, type, note });
    req.flash('success', 'Thêm khách hàng thành công.');
    res.redirect('/customers');
  },

  // GET /customers/:id
  show(req, res) {
    const customer = CustomerModel.findById(req.params.id);
    if (!customer) {
      req.flash('error', 'Không tìm thấy khách hàng.');
      return res.redirect('/customers');
    }
    const orders = OrderModel.getByCustomer(customer.id)
      .sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));

    res.render('customers/show', {
      title: customer.name,
      customer,
      orders,
      error: req.flash('error'),
      success: req.flash('success')
    });
  },

  // GET /customers/:id/edit
  getEdit(req, res) {
    const customer = CustomerModel.findById(req.params.id);
    if (!customer) {
      req.flash('error', 'Không tìm thấy khách hàng.');
      return res.redirect('/customers');
    }
    res.render('customers/edit', {
      title: 'Sửa Khách hàng',
      customer,
      error: req.flash('error')
    });
  },

  // POST /customers/:id/edit
  postEdit(req, res) {
    const { name, phone, email, address, type, note } = req.body;
    if (!name) {
      req.flash('error', 'Tên khách hàng không được để trống.');
      return res.redirect(`/customers/${req.params.id}/edit`);
    }
    const updated = CustomerModel.update(req.params.id, { name, phone, email, address, type, note });
    if (!updated) {
      req.flash('error', 'Không tìm thấy khách hàng.');
      return res.redirect('/customers');
    }
    req.flash('success', 'Cập nhật khách hàng thành công.');
    res.redirect('/customers');
  },

  // POST /customers/:id/delete
  delete(req, res) {
    const orders = OrderModel.getByCustomer(req.params.id);
    if (orders.length > 0) {
      req.flash('error', `Không thể xoá: khách hàng đang có ${orders.length} đơn hàng.`);
      return res.redirect('/customers');
    }
    CustomerModel.delete(req.params.id);
    req.flash('success', 'Đã xoá khách hàng.');
    res.redirect('/customers');
  },

  // POST /customers/:id/toggle-status
  toggleStatus(req, res) {
    const customer = CustomerModel.findById(req.params.id);
    if (!customer) {
      req.flash('error', 'Không tìm thấy khách hàng.');
      return res.redirect('/customers');
    }
    const newStatus = customer.status === 'active' ? 'inactive' : 'active';
    CustomerModel.update(req.params.id, { status: newStatus });
    req.flash('success', `Đã chuyển trạng thái khách hàng thành "${newStatus === 'active' ? 'Hoạt động' : 'Ngừng hoạt động'}".`);
    res.redirect('/customers');
  }
};

module.exports = CustomerController;
