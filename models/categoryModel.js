
const { getCollection, saveCollection } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

const COLLECTION = 'categories';

const CategoryModel = {
  getAll() {
    return getCollection(COLLECTION);
  },

  findById(id) {
    return getCollection(COLLECTION).find(c => c.id === id) || null;
  },

  findBySlug(slug) {
    return getCollection(COLLECTION).find(c => c.slug === slug) || null;
  },

  create(data) {
    const categories = getCollection(COLLECTION);
    const newCat = {
      id: uuidv4(),
      name: data.name,
      slug: slugify(data.name),
      description: data.description || '',
      status: 'active',
      createdAt: new Date().toISOString()
    };
    categories.push(newCat);
    saveCollection(COLLECTION, categories);
    return newCat;
  },

  update(id, data) {
    const categories = getCollection(COLLECTION);
    const idx = categories.findIndex(c => c.id === id);
    if (idx === -1) return null;
    if (data.name) data.slug = slugify(data.name);
    categories[idx] = { ...categories[idx], ...data, updatedAt: new Date().toISOString() };
    saveCollection(COLLECTION, categories);
    return categories[idx];
  },

  delete(id) {
    let categories = getCollection(COLLECTION);
    const before = categories.length;
    categories = categories.filter(c => c.id !== id);
    if (categories.length === before) return false;
    saveCollection(COLLECTION, categories);
    return true;
  }
};

function slugify(str) {
  return str
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

module.exports = CategoryModel;