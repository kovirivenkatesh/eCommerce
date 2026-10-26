import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { Sequelize } from 'sequelize-typescript';
import { User } from './models/User';
import { Product } from './models/Product';
import { Order } from './models/Order';
import { PaymentAttempt } from './models/PaymentAttempt';

dotenv.config();

const useSsl = process.env.DB_SSL === 'true';
const sslCaPath = process.env.DB_SSL_CA_PATH?.trim();

if (useSsl && !sslCaPath) {
  throw new Error('DB_SSL_CA_PATH is required when DB_SSL=true.');
}

export const sequelize = new Sequelize({
  dialect: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 3306),
  username: process.env.DB_USER || 'Venky_Dev',
  password: process.env.DB_PASSWORD || 'Venky@23428969',
  database: process.env.DB_NAME || 'ecommerce_db',
  dialectOptions: useSsl && sslCaPath
    ? { ssl: { ca: fs.readFileSync(path.resolve(__dirname, sslCaPath)) } }
    : {},
  models: [User, Product, Order, PaymentAttempt],
  logging: false,
});

export async function syncDatabase() {
  await sequelize.authenticate();
  await sequelize.sync();
  console.log('Database synchronized successfully.');
}
