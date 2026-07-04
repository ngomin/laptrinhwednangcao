
// Mô phỏng database dùng file JSON

const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '../data/db.json');

function readDB() {
  try {
    const raw = fs.readFileSync(DB_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Lỗi đọc database:', err);
    return {};
  }
}

function writeDB(data) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Lỗi ghi database:', err);
    return false;
  }
}

function getCollection(name) {
  const db = readDB();
  return db[name] || [];
}

function saveCollection(name, data) {
  const db = readDB();
  db[name] = data;
  return writeDB(db);
}

module.exports = { readDB, writeDB, getCollection, saveCollection };