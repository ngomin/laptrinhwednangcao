
// Model quản lý nhập/xuất/điều chỉnh kho

const { getCollection, saveCollection } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

const COLLECTION = 'warehouseTransactions';

const WarehouseModel = {
  getAll() {
    return getCollection(COLLECTION).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  findById(id) {
    return getCollection(COLLECTION).find(t => t.id === id) || null;
  },

  getRecent(limit = 10) {
    return this.getAll().slice(0, limit);
  },

  getByProduct(productId) {
    return getCollection(COLLECTION).filter(t => t.productId === productId);
  },

  filter({ type, productId, supplierId, from, to } = {}) {
    let txs = getCollection(COLLECTION);
    if (type) txs = txs.filter(t => t.type === type);
    if (productId) txs = txs.filter(t => t.productId === productId);
    if (supplierId) txs = txs.filter(t => t.supplierId === supplierId);
    if (from) txs = txs.filter(t => new Date(t.createdAt) >= new Date(from));
    if (to) txs = txs.filter(t => new Date(t.createdAt) <= new Date(to + 'T23:59:59'));
    return txs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  // Nhập kho
  import(data) {
    return this._create({ ...data, type: 'import' });
  },

  // Xuất kho
  export(data) {
    return this._create({ ...data, type: 'export' });
  },

  // Điều chỉnh tồn kho
  adjust(data) {
    return this._create({ ...data, type: 'adjust' });
  },

  _create(data) {
    const txs = getCollection(COLLECTION);
    const quantity = parseFloat(data.quantity) || 0;
    const unitCost = parseFloat(data.unitCost) || 0;
    const newTx = {
      id: uuidv4(),
      type: data.type,        // import | export | adjust
      productId: data.productId,
      productName: data.productName || '',
      quantity,
      unit: data.unit || 'Cái',
      unitCost,
      totalCost: quantity * unitCost,
      supplierId: data.supplierId || null,
      note: data.note || '',
      staffId: data.staffId,
      createdAt: new Date().toISOString()
    };
    txs.push(newTx);
    saveCollection(COLLECTION, txs);
    return newTx;
  },

  getStats() {
    const txs = getCollection(COLLECTION);
    const thisMonth = new Date().toISOString().slice(0, 7);
    const monthTxs = txs.filter(t => t.createdAt.startsWith(thisMonth));
    return {
      totalImports: txs.filter(t => t.type === 'import').length,
      totalExports: txs.filter(t => t.type === 'export').length,
      monthImports: monthTxs.filter(t => t.type === 'import').length,
      monthExports: monthTxs.filter(t => t.type === 'export').length,
      totalImportValue: txs.filter(t => t.type === 'import').reduce((s, t) => s + t.totalCost, 0)
    };
  }
};

module.exports = WarehouseModel;