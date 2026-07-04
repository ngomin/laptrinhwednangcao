
// Xử lý logic quản lý sản phẩm

const ProductModel = require('../models/productModel');
const CategoryModel = require('../models/categoryModel');
const SupplierModel = require('../models/supplierModel');

const ProductController = {
  // GET /products
  index(req, res) {
    const { search, categoryId, supplierId, status } = req.query;
    let products = search ? ProductModel.search(search) : ProductModel.getAll();

    if (categoryId || supplierId || status) {
      products = ProductModel.filter({ categoryId, supplierId, status });
      if (search) {
        const kw = search.toLowerCase();
        products = products.filter(p => p.name.toLowerCase().includes(kw) || p.code.toLowerCase().includes(kw));
      }
    }

    const categories = CategoryModel.getAll();
    const suppliers = SupplierModel.getAll();
    const stats = ProductModel.getStats();

    // Gắn tên danh mục và nhà cung cấp
    products = products.map(p => ({
      ...p,
      categoryName: categories.find(c => c.id === p.categoryId)?.name || '',
      supplierName: suppliers.find(s => s.id === p.supplierId)?.name || ''
    }));

    res.render('products/index', {
      title: 'Quản lý Sản phẩm',
      products,
      categories,
      suppliers,
      stats,
      filters: { search: search || '', categoryId: categoryId || '', supplierId: supplierId || '', status: status || '' },
      error: req.flash('error'),
      success: req.flash('success')
    });
  },

  // GET /products/create
  getCreate(req, res) {
    const categories = CategoryModel.getAll().filter(c => c.status === 'active');
    const suppliers = SupplierModel.getAll().filter(s => s.status === 'active');
    res.render('products/create', {
      title: 'Thêm Sản phẩm',
      categories,
      suppliers,
      product: {},
      error: req.flash('error')
    });
  },

  // POST /products/create
  postCreate(req, res) {
    const { name, categoryId, supplierId, unit, costPrice, salePrice, stock, minStock, description } = req.body;
    if (!name) {
      req.flash('error', 'Tên sản phẩm không được để trống.');
      return res.redirect('/products/create');
    }
    if (parseFloat(salePrice) < parseFloat(costPrice)) {
      req.flash('error', 'Giá bán phải lớn hơn hoặc bằng giá nhập.');
      return res.redirect('/products/create');
    }
    ProductModel.create({ name, categoryId, supplierId, unit, costPrice, salePrice, stock, minStock, description });
    req.flash('success', 'Thêm sản phẩm thành công.');
    res.redirect('/products');
  },

  // GET /products/:id
  show(req, res) {
    const product = ProductModel.findById(req.params.id);
    if (!product) {
      req.flash('error', 'Không tìm thấy sản phẩm.');
      return res.redirect('/products');
    }
    const category = CategoryModel.findById(product.categoryId);
    const supplier = SupplierModel.findById(product.supplierId);

    const WarehouseModel = require('../models/warehouseModel');
    const transactions = WarehouseModel.getByProduct(product.id).slice(0, 10);

    res.render('products/show', {
      title: product.name,
      product,
      category,
      supplier,
      transactions,
      error: req.flash('error'),
      success: req.flash('success')
    });
  },

  // GET /products/:id/edit
  getEdit(req, res) {
    const product = ProductModel.findById(req.params.id);
    if (!product) {
      req.flash('error', 'Không tìm thấy sản phẩm.');
      return res.redirect('/products');
    }
    const categories = CategoryModel.getAll();
    const suppliers = SupplierModel.getAll();
    res.render('products/edit', {
      title: 'Sửa Sản phẩm',
      product,
      categories,
      suppliers,
      error: req.flash('error')
    });
  },

  // POST /products/:id/edit
  postEdit(req, res) {
    const { name, categoryId, supplierId, unit, costPrice, salePrice, stock, minStock, description, status } = req.body;
    if (!name) {
      req.flash('error', 'Tên sản phẩm không được để trống.');
      return res.redirect(`/products/${req.params.id}/edit`);
    }
    const updated = ProductModel.update(req.params.id, { name, categoryId, supplierId, unit, costPrice, salePrice, stock, minStock, description, status });
    if (!updated) {
      req.flash('error', 'Không tìm thấy sản phẩm.');
      return res.redirect('/products');
    }
    req.flash('success', 'Cập nhật sản phẩm thành công.');
    res.redirect('/products');
  },

  // POST /products/:id/delete
  delete(req, res) {
    ProductModel.delete(req.params.id);
    req.flash('success', 'Đã xoá sản phẩm.');
    res.redirect('/products');
  }
};

module.exports = ProductController;