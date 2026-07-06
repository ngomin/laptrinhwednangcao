
// Model quản lý nhà cung cấp

const { getCollection, saveCollection } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

const COLLECTION = 'suppliers';

const SupplierModel = {
  getAll() {
    return getCollection(COLLECTION);
  },

  findById(id) {
    return getCollection(COLLECTION).find(s => s.id === id) || null;
  },

  search(keyword = '') {
    const suppliers = getCollection(COLLECTION);
    if (!keyword) return suppliers;
    const kw = keyword.toLowerCase();
    return suppliers.filter(s =>
      s.name.toLowerCase().includes(kw) ||
      s.contact.toLowerCase().includes(kw) ||
      s.phone.includes(kw) ||
      (s.taxCode || '').includes(kw)
    );
  },

  create(data) {
    const suppliers = getCollection(COLLECTION);
    const newSupplier = {
      id: uuidv4(),
      name: data.name,
      contact: data.contact || '',
      phone: data.phone || '',
      email: data.email || '',
      address: data.address || '',
      taxCode: data.taxCode || '',
      status: 'active',
      note: data.note || '',
      createdAt: new Date().toISOString()
    };
    suppliers.push(newSupplier);
    saveCollection(COLLECTION, suppliers);
    return newSupplier;
  },

  update(id, data) {
    const suppliers = getCollection(COLLECTION);
    const idx = suppliers.findIndex(s => s.id === id);
    if (idx === -1) return null;
    suppliers[idx] = { ...suppliers[idx], ...data, updatedAt: new Date().toISOString() };
    saveCollection(COLLECTION, suppliers);
    return suppliers[idx];
  },

  delete(id) {
    let suppliers = getCollection(COLLECTION);
    const before = suppliers.length;
    suppliers = suppliers.filter(s => s.id !== id);
    if (suppliers.length === before) return false;
    saveCollection(COLLECTION, suppliers);
    return true;
  },

  getStats() {
    const suppliers = getCollection(COLLECTION);
    return {
      total: suppliers.length,
      active: suppliers.filter(s => s.status === 'active').length,
      inactive: suppliers.filter(s => s.status === 'inactive').length
    };
  }
};

module.exports = SupplierModel;