// models/userModel.js
// Model người dùng hệ thống

const { getCollection, saveCollection } = require('../config/database');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const COLLECTION = 'users';

const UserModel = {
  // Lấy tất cả users
  getAll() {
    return getCollection(COLLECTION);
  },

  // Tìm user theo ID
  findById(id) {
    const users = getCollection(COLLECTION);
    return users.find(u => u.id === id) || null;
  },

  // Tìm user theo username
  findByUsername(username) {
    const users = getCollection(COLLECTION);
    return users.find(u => u.username === username) || null;
  },

  // Tìm user theo email
  findByEmail(email) {
    const users = getCollection(COLLECTION);
    return users.find(u => u.email === email) || null;
  },

  // Tạo user mới
  async create(data) {
    const users = getCollection(COLLECTION);
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const newUser = {
      id: uuidv4(),
      username: data.username,
      password: hashedPassword,
      fullName: data.fullName,
      email: data.email,
      role: data.role || 'staff',
      avatar: data.avatar || '',
      createdAt: new Date().toISOString()
    };
    users.push(newUser);
    saveCollection(COLLECTION, users);
    const { password, ...safeUser } = newUser;
    return safeUser;
  },

  // Cập nhật user
  async update(id, data) {
    const users = getCollection(COLLECTION);
    const idx = users.findIndex(u => u.id === id);
    if (idx === -1) return null;
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }
    users[idx] = { ...users[idx], ...data, updatedAt: new Date().toISOString() };
    saveCollection(COLLECTION, users);
    return users[idx];
  },

  // Xoá user
  delete(id) {
    let users = getCollection(COLLECTION);
    const before = users.length;
    users = users.filter(u => u.id !== id);
    if (users.length === before) return false;
    saveCollection(COLLECTION, users);
    return true;
  },

  // Xác thực mật khẩu
  async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  },
