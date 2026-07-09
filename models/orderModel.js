
// Model quản lý đơn hàng

const { getCollection, saveCollection } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

const COLLECTION = 'orders';

function generateCode() {
  const orders = getCollection(COLLECTION);
  const num = orders.length + 1;
  return `DH${String(num).padStart(3, '0')}`;
}

const OrderModel = {
  getAll() {
    return getCollection(COLLECTION);
  },

  findById(id) {
    const orders = getCollection(COLLECTION);
    return orders.find(o => o.id === id) || null;
  },

  getByCustomer(customerId) {
    const orders = getCollection(COLLECTION);
    return orders.filter(o => o.customerId === customerId);
  },

  search(keyword = '') {
    const orders = getCollection(COLLECTION);
    if (!keyword) return orders;
    const kw = keyword.toLowerCase();
    return orders.filter(o =>
      o.code.toLowerCase().includes(kw) ||
      (o.note || '').toLowerCase().includes(kw)
    );
  },

  filter({ status, paymentStatus, from, to } = {}) {
    let orders = getCollection(COLLECTION);
    if (status) orders = orders.filter(o => o.status === status);
    if (paymentStatus) orders = orders.filter(o => o.paymentStatus === paymentStatus);
    if (from) orders = orders.filter(o => new Date(o.orderDate) >= new Date(from));
    if (to) orders = orders.filter(o => new Date(o.orderDate) <= new Date(to + 'T23:59:59'));
    return orders;
  },

  create(data) {
    const orders = getCollection(COLLECTION);
    const subtotal = parseFloat(data.subtotal) || 0;
    const discount = parseFloat(data.discount) || 0;
    const tax = parseFloat(data.tax) || 0;
    const newOrder = {
      id: uuidv4(),
      code: generateCode(),
      customerId: data.customerId,
      staffId: data.staffId,
      orderDate: new Date().toISOString(),
      deliveryDate: data.deliveryDate || null,
      status: 'pending',
      paymentStatus: 'pending',
      paymentMethod: data.paymentMethod || 'cash',
      subtotal,
      discount,
      tax,
      total: subtotal - discount + tax,
      note: data.note || '',
      createdAt: new Date().toISOString()
    };
    orders.push(newOrder);
    saveCollection(COLLECTION, orders);
    return newOrder;
  },

  update(id, data) {
    const orders = getCollection(COLLECTION);
    const idx = orders.findIndex(o => o.id === id);
    if (idx === -1) return null;
    orders[idx] = { ...orders[idx], ...data, updatedAt: new Date().toISOString() };
    saveCollection(COLLECTION, orders);
    return orders[idx];
  },

  updateStatus(id, status) {
    return this.update(id, { status });
  },

  updatePayment(id, paymentStatus) {
    return this.update(id, { paymentStatus });
  },

  delete(id) {
    let orders = getCollection(COLLECTION);
    const before = orders.length;
    orders = orders.filter(o => o.id !== id);
    if (orders.length === before) return false;
    saveCollection(COLLECTION, orders);
    return true;
  },

  // Thống kê doanh thu
  getRevenueStats() {
    const orders = getCollection(COLLECTION);
    const completed = orders.filter(o => o.status === 'completed');
    const today = new Date().toISOString().slice(0, 10);
    const thisMonth = new Date().toISOString().slice(0, 7);

    return {
      totalOrders: orders.length,
      completedOrders: completed.length,
      pendingOrders: orders.filter(o => o.status === 'pending').length,
      deliveringOrders: orders.filter(o => o.status === 'delivering').length,
      cancelledOrders: orders.filter(o => o.status === 'cancelled').length,
      totalRevenue: completed.reduce((s, o) => s + (o.total || 0), 0),
      todayRevenue: completed
        .filter(o => o.orderDate.startsWith(today))
        .reduce((s, o) => s + (o.total || 0), 0),
      monthRevenue: completed
        .filter(o => o.orderDate.startsWith(thisMonth))
        .reduce((s, o) => s + (o.total || 0), 0)
    };
  }
};

module.exports = OrderModel;