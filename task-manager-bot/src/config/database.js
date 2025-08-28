const { Sequelize } = require('sequelize');
const path = require('path');
require('dotenv').config();

const dbPath = process.env.DATABASE_PATH || './database/taskmanager.db';
const fullPath = path.resolve(dbPath);

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: fullPath,
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

module.exports = sequelize;

