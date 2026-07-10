
const { getCollection, saveCollection } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

const COLLECTION = 'customers';

function generateCode() {
  const customers = getCollection(COLLECTION);
  const num = customers.length + 1;
  return `KH${String(num).padStart(3, '0')}`;
}

const CustomerModel = {
  getAll() {
    return getCollection(COLLECTION);
  },

  findById(id) {
    const customers = getCollection(COLLECTION);
    return customers.find(c => c.id === id) || null;
  },

  findByCode(code) {
    const customers = getCollection(COLLECTION);
    return customers.find(c => c.code === code) || null;
  },

  search(keyword = '') {
    const customers = getCollection(COLLECTION);
    if (!keyword) return customers;
    const kw = keyword.toLowerCase();
    return customers.filter(c =>
      c.name.toLowerCase().includes(kw) ||
      c.phone.includes(kw) ||
      c.email.toLowerCase().includes(kw) ||
      c.code.toLowerCase().includes(kw)
    );
  },

  create(data) {
    const customers = getCollection(COLLECTION);
    const newCustomer = {
      id: uuidv4(),
      code: generateCode(),
      name: data.name,
      phone: data.phone || '',
      email: data.email || '',
      address: data.address || '',
      type: data.type || 'retail',   // retail | wholesale
      totalOrders: 0,
      totalSpent: 0,
      status: 'active',
      note: data.note || '',
      createdAt: new Date().toISOString()
    };
    customers.push(newCustomer);
    saveCollection(COLLECTION, customers);
    return newCustomer;
  },

  update(id, data) {
    const customers = getCollection(COLLECTION);
    const idx = customers.findIndex(c => c.id === id);
    if (idx === -1) return null;
    customers[idx] = { ...customers[idx], ...data, updatedAt: new Date().toISOString() };
    saveCollection(COLLECTION, customers);
    return customers[idx];
  },

  delete(id) {
    let customers = getCollection(COLLECTION);
    const before = customers.length;
    customers = customers.filter(c => c.id !== id);
    if (customers.length === before) return false;
    saveCollection(COLLECTION, customers);
    return true;
  },

  // Cập nhật thống kê sau khi có đơn hàng
  updateStats(customerId, orderTotal) {
    const customers = getCollection(COLLECTION);
    const idx = customers.findIndex(c => c.id === customerId);
    if (idx === -1) return;
    customers[idx].totalOrders = (customers[idx].totalOrders || 0) + 1;
    customers[idx].totalSpent = (customers[idx].totalSpent || 0) + orderTotal;
    saveCollection(COLLECTION, customers);
  },

  // Thống kê nhanh
  getStats() {
    const customers = getCollection(COLLECTION);
    return {
      total: customers.length,
      active: customers.filter(c => c.status === 'active').length,
      retail: customers.filter(c => c.type === 'retail').length,
      wholesale: customers.filter(c => c.type === 'wholesale').length
    };
  }
};

module.exports = CustomerModel;