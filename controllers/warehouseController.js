
// Xử lý logic quản lý kho: nhập/xuất/điều chỉnh

const WarehouseModel = require('../models/warehouseModel');
const ProductModel = require('../models/productModel');
const SupplierModel = require('../models/supplierModel');

const WarehouseController = {
  // GET /warehouse
  index(req, res) {
    const { type, productId, from, to } = req.query;
    const transactions = WarehouseModel.filter({ type, productId, from, to });
    const stats = WarehouseModel.getStats();
    const products = ProductModel.getAll();
    const suppliers = SupplierModel.getAll();

    const enriched = transactions.map(t => ({
      ...t,
      supplierName: t.supplierId ? suppliers.find(s => s.id === t.supplierId)?.name : null
    }));

    res.render('warehouse/index', {
      title: 'Quản lý Kho',
      transactions: enriched,
      stats,
      products,
      filters: { type: type || '', productId: productId || '', from: from || '', to: to || '' },
      error: req.flash('error'),
      success: req.flash('success')
    });
  },

  // GET /warehouse/import
  getImport(req, res) {
    const products = ProductModel.getAll().filter(p => p.status === 'active');
    const suppliers = SupplierModel.getAll().filter(s => s.status === 'active');
    res.render('warehouse/import', {
      title: 'Nhập kho',
      products, suppliers,
      error: req.flash('error')
    });
  },

  // POST /warehouse/import
  postImport(req, res) {
    const { productId, quantity, unitCost, supplierId, note } = req.body;
    if (!productId || !quantity) {
      req.flash('error', 'Vui lòng chọn sản phẩm và nhập số lượng.');
      return res.redirect('/warehouse/import');
    }
    const product = ProductModel.findById(productId);
    if (!product) { req.flash('error', 'Sản phẩm không tồn tại.'); return res.redirect('/warehouse/import'); }

    const qty = parseInt(quantity);
    WarehouseModel.import({
      productId,
      productName: product.name,
      quantity: qty,
      unit: product.unit,
      unitCost: parseFloat(unitCost) || product.costPrice,
      supplierId: supplierId || null,
      note,
      staffId: req.session.user.id
    });
    ProductModel.adjustStock(productId, qty);

    req.flash('success', `Nhập kho thành công: ${qty} ${product.unit} ${product.name}.`);
    res.redirect('/warehouse');
  },

  // GET /warehouse/export
  getExport(req, res) {
    const products = ProductModel.getAll().filter(p => p.status === 'active' && p.stock > 0);
    res.render('warehouse/export', {
      title: 'Xuất kho',
      products,
      error: req.flash('error')
    });
  },

  // POST /warehouse/export
  postExport(req, res) {
    const { productId, quantity, note } = req.body;
    const product = ProductModel.findById(productId);
    if (!product) { req.flash('error', 'Sản phẩm không tồn tại.'); return res.redirect('/warehouse/export'); }

    const qty = parseInt(quantity);
    if (qty > product.stock) {
      req.flash('error', `Số lượng xuất (${qty}) vượt quá tồn kho (${product.stock}).`);
      return res.redirect('/warehouse/export');
    }

    WarehouseModel.export({
      productId,
      productName: product.name,
      quantity: qty,
      unit: product.unit,
      unitCost: product.salePrice,
      note,
      staffId: req.session.user.id
    });
    ProductModel.adjustStock(productId, -qty);

    req.flash('success', `Xuất kho thành công: ${qty} ${product.unit} ${product.name}.`);
    res.redirect('/warehouse');
  },

  // GET /warehouse/adjust
  getAdjust(req, res) {
    const products = ProductModel.getAll().filter(p => p.status === 'active');
    res.render('warehouse/adjust', {
      title: 'Điều chỉnh tồn kho',
      products,
      error: req.flash('error')
    });
  },

  // POST /warehouse/adjust
  postAdjust(req, res) {
    const { productId, newStock, note } = req.body;
    const product = ProductModel.findById(productId);
    if (!product) { req.flash('error', 'Sản phẩm không tồn tại.'); return res.redirect('/warehouse/adjust'); }

    const targetStock = parseInt(newStock);
    const delta = targetStock - product.stock;

    WarehouseModel.adjust({
      productId,
      productName: product.name,
      quantity: delta,
      unit: product.unit,
      note: note || `Điều chỉnh từ ${product.stock} → ${targetStock}`,
      staffId: req.session.user.id
    });
    ProductModel.update(productId, { stock: targetStock });

    req.flash('success', `Điều chỉnh tồn kho thành công: ${product.name} = ${targetStock} ${product.unit}.`);
    res.redirect('/warehouse');
  }
};

module.exports = WarehouseController;