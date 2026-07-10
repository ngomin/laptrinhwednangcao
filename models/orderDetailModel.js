// models/orderDetailModel.js

const { getCollection, saveCollection } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

const COLLECTION = 'orderDetails';

const OrderDetailModel = {
  getAll() {
    return getCollection(COLLECTION);
  },

  // Lấy chi tiết theo đơn hàng
  getByOrderId(orderId) {
    const details = getCollection(COLLECTION);
    return details.filter(d => d.orderId === orderId);
  },

  // Tạo chi tiết đơn hàng (một sản phẩm)
  create(data) {
    const details = getCollection(COLLECTION);
    const quantity = parseInt(data.quantity) || 0;
    const unitPrice = parseFloat(data.unitPrice) || 0;
    const discount = parseFloat(data.discount) || 0;
    const newDetail = {
      id: uuidv4(),
      orderId: data.orderId,
      productId: data.productId,
      productName: data.productName,
      quantity,
      unit: data.unit || 'Cái',
      unitPrice,
      discount,
      total: quantity * unitPrice - discount
    };
    details.push(newDetail);
    saveCollection(COLLECTION, details);
    return newDetail;
  },

  // Tạo nhiều chi tiết cùng lúc
  createBulk(orderId, items) {
    const details = getCollection(COLLECTION);
    const newItems = items.map(item => {
      const quantity = parseInt(item.quantity) || 0;
      const unitPrice = parseFloat(item.unitPrice) || 0;
      const discount = parseFloat(item.discount) || 0;
      return {
        id: uuidv4(),
        orderId,
        productId: item.productId,
        productName: item.productName,
        quantity,
        unit: item.unit || 'Cái',
        unitPrice,
        discount,
        total: quantity * unitPrice - discount
      };
    });
    newItems.forEach(i => details.push(i));
    saveCollection(COLLECTION, details);
    return newItems;
  },

  // Xoá toàn bộ chi tiết của một đơn
  deleteByOrderId(orderId) {
    let details = getCollection(COLLECTION);
    details = details.filter(d => d.orderId !== orderId);
    saveCollection(COLLECTION, details);
  },

  // Tính tổng tiền hàng từ chi tiết
  calcSubtotal(orderId) {
    const details = this.getByOrderId(orderId);
    return details.reduce((sum, d) => sum + (d.total || 0), 0);
  }
};

module.exports = OrderDetailModel;