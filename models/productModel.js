
// Model quản lý sản phẩm

const { getCollection, saveCollection } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

const COLLECTION = 'products';

function generateCode() {
  const products = getCollection(COLLECTION);
  const num = products.length + 1;
  return `SP${String(num).padStart(3, '0')}`;
}

const ProductModel = {
  getAll() {
    return getCollection(COLLECTION);
  },

  findById(id) {
    return getCollection(COLLECTION).find(p => p.id === id) || null;
  },

  findByCode(code) {
    return getCollection(COLLECTION).find(p => p.code === code) || null;
  },

  search(keyword = '') {
    const products = getCollection(COLLECTION);
    if (!keyword) return products;
    const kw = keyword.toLowerCase();
    return products.filter(p =>
      p.name.toLowerCase().includes(kw) ||
      p.code.toLowerCase().includes(kw) ||
      (p.description || '').toLowerCase().includes(kw)
    );
  },

  filter({ categoryId, supplierId, status } = {}) {
    let products = getCollection(COLLECTION);
    if (categoryId) products = products.filter(p => p.categoryId === categoryId);
    if (supplierId) products = products.filter(p => p.supplierId === supplierId);
    if (status) products = products.filter(p => p.status === status);
    return products;
  },

  create(data) {
    const products = getCollection(COLLECTION);
    const newProduct = {
      id: uuidv4(),
      code: generateCode(),
      name: data.name,
      categoryId: data.categoryId || '',
      supplierId: data.supplierId || '',
      unit: data.unit || 'Cái',
      costPrice: parseFloat(data.costPrice) || 0,
      salePrice: parseFloat(data.salePrice) || 0,
      stock: parseInt(data.stock) || 0,
      minStock: parseInt(data.minStock) || 10,
      description: data.description || '',
      status: 'active',
      image: data.image || '',
      createdAt: new Date().toISOString()
    };
    products.push(newProduct);
    saveCollection(COLLECTION, products);
    return newProduct;
  },

  update(id, data) {
    const products = getCollection(COLLECTION);
    const idx = products.findIndex(p => p.id === id);
    if (idx === -1) return null;
    if (data.costPrice) data.costPrice = parseFloat(data.costPrice);
    if (data.salePrice) data.salePrice = parseFloat(data.salePrice);
    if (data.stock) data.stock = parseInt(data.stock);
    if (data.minStock) data.minStock = parseInt(data.minStock);
    products[idx] = { ...products[idx], ...data, updatedAt: new Date().toISOString() };
    saveCollection(COLLECTION, products);
    return products[idx];
  },

  delete(id) {
    let products = getCollection(COLLECTION);
    const before = products.length;
    products = products.filter(p => p.id !== id);
    if (products.length === before) return false;
    saveCollection(COLLECTION, products);
    return true;
  },

  // Điều chỉnh số lượng tồn kho (delta: dương = nhập, âm = xuất)
  adjustStock(id, delta) {
    const products = getCollection(COLLECTION);
    const idx = products.findIndex(p => p.id === id);
    if (idx === -1) return null;
    products[idx].stock = Math.max(0, (products[idx].stock || 0) + delta);
    saveCollection(COLLECTION, products);
    return products[idx];
  },

  // Lấy sản phẩm sắp hết hàng
  getLowStock() {
    const products = getCollection(COLLECTION);
    return products.filter(p => p.stock <= p.minStock && p.status === 'active');
  },

  getStats() {
    const products = getCollection(COLLECTION);
    const lowStock = products.filter(p => p.stock <= p.minStock);
    return {
      total: products.length,
      active: products.filter(p => p.status === 'active').length,
      inactive: products.filter(p => p.status === 'inactive').length,
      lowStock: lowStock.length,
      outOfStock: products.filter(p => p.stock === 0).length,
      totalValue: products.reduce((s, p) => s + (p.stock * p.costPrice), 0)
    };
  }
};

module.exports = ProductModel;