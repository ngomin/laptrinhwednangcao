
const CategoryModel = require('../models/categoryModel');
const ProductModel = require('../models/productModel');

const CategoryController = {
  index(req, res) {
    const categories = CategoryModel.getAll();
    const products = ProductModel.getAll();
    const enriched = categories.map(c => ({
      ...c,
      productCount: products.filter(p => p.categoryId === c.id).length
    }));
    res.render('categories/index', {
      title: 'Quản lý Danh mục',
      categories: enriched,
      error: req.flash('error'),
      success: req.flash('success')
    });
  },

  getCreate(req, res) {
    res.render('categories/create', { title: 'Thêm Danh mục', category: {}, error: req.flash('error') });
  },

  postCreate(req, res) {
    const { name, description } = req.body;
    if (!name) { req.flash('error', 'Tên danh mục không được để trống.'); return res.redirect('/categories/create'); }
    CategoryModel.create({ name, description });
    req.flash('success', 'Thêm danh mục thành công.');
    res.redirect('/categories');
  },

  getEdit(req, res) {
    const category = CategoryModel.findById(req.params.id);
    if (!category) { req.flash('error', 'Không tìm thấy danh mục.'); return res.redirect('/categories'); }
    res.render('categories/edit', { title: 'Sửa Danh mục', category, error: req.flash('error') });
  },

  postEdit(req, res) {
    const { name, description, status } = req.body;
    CategoryModel.update(req.params.id, { name, description, status });
    req.flash('success', 'Cập nhật danh mục thành công.');
    res.redirect('/categories');
  },

  delete(req, res) {
    const products = ProductModel.filter({ categoryId: req.params.id });
    if (products.length > 0) {
      req.flash('error', `Không thể xoá: danh mục đang có ${products.length} sản phẩm.`);
      return res.redirect('/categories');
    }
    CategoryModel.delete(req.params.id);
    req.flash('success', 'Đã xoá danh mục.');
    res.redirect('/categories');
  }
};

module.exports = CategoryController;