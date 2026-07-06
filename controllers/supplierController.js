
const SupplierModel = require('../models/supplierModel');
const ProductModel = require('../models/productModel');

const SupplierController = {
  index(req, res) {
    const { search, status } = req.query;
    let suppliers = SupplierModel.search(search);
    if (status) suppliers = suppliers.filter(s => s.status === status);
    const stats = SupplierModel.getStats();
    res.render('suppliers/index', {
      title: 'Quản lý Nhà cung cấp',
      suppliers, stats,
      filters: { search: search || '', status: status || '' },
      error: req.flash('error'),
      success: req.flash('success')
    });
  },

  getCreate(req, res) {
    res.render('suppliers/create', { title: 'Thêm Nhà cung cấp', supplier: {}, error: req.flash('error') });
  },

  postCreate(req, res) {
    const { name, contact, phone, email, address, taxCode, note } = req.body;
    if (!name) { req.flash('error', 'Tên nhà cung cấp không được để trống.'); return res.redirect('/suppliers/create'); }
    SupplierModel.create({ name, contact, phone, email, address, taxCode, note });
    req.flash('success', 'Thêm nhà cung cấp thành công.');
    res.redirect('/suppliers');
  },

  show(req, res) {
    const supplier = SupplierModel.findById(req.params.id);
    if (!supplier) { req.flash('error', 'Không tìm thấy nhà cung cấp.'); return res.redirect('/suppliers'); }
    const products = ProductModel.filter({ supplierId: supplier.id });
    res.render('suppliers/show', { title: supplier.name, supplier, products, error: req.flash('error'), success: req.flash('success') });
  },

  getEdit(req, res) {
    const supplier = SupplierModel.findById(req.params.id);
    if (!supplier) { req.flash('error', 'Không tìm thấy nhà cung cấp.'); return res.redirect('/suppliers'); }
    res.render('suppliers/edit', { title: 'Sửa Nhà cung cấp', supplier, error: req.flash('error') });
  },

  postEdit(req, res) {
    const { name, contact, phone, email, address, taxCode, status, note } = req.body;
    SupplierModel.update(req.params.id, { name, contact, phone, email, address, taxCode, status, note });
    req.flash('success', 'Cập nhật nhà cung cấp thành công.');
    res.redirect('/suppliers');
  },

  delete(req, res) {
    const products = ProductModel.filter({ supplierId: req.params.id });
    if (products.length > 0) {
      req.flash('error', `Không thể xoá: nhà cung cấp đang cung cấp ${products.length} sản phẩm.`);
      return res.redirect('/suppliers');
    }
    SupplierModel.delete(req.params.id);
    req.flash('success', 'Đã xoá nhà cung cấp.');
    res.redirect('/suppliers');
  }
};

module.exports = SupplierController;