import dotenv from 'dotenv';
import { Sequelize } from 'sequelize-typescript';
import { User } from './models/User';
import { Product } from './models/Product';
import { Order } from './models/Order';
import { PaymentAttempt } from './models/PaymentAttempt';

dotenv.config();

export const sequelize = new Sequelize({
  dialect: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 3306),
  username: process.env.DB_USER || 'Venky_Dev',
  password: process.env.DB_PASSWORD || 'Venky@23428969',
  database: process.env.DB_NAME || 'ecommerce_db',
  models: [User, Product, Order, PaymentAttempt],
  logging: false,
});

export async function syncDatabase() {
  await sequelize.authenticate();
  await sequelize.sync({ alter: true });
  console.log('Database synchronized successfully.');
}
