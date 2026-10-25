const mysql = require('mysql2/promise');

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'Venky_Dev',
  password: process.env.DB_PASSWORD || 'Venky@23428969',
  database: process.env.DB_NAME || 'ecommerce_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

let connection;

async function ensureDatabase() {
  const adminConnection = await mysql.createConnection({
    host: dbConfig.host,
    port: dbConfig.port,
    user: dbConfig.user,
    password: dbConfig.password,
  });

  await adminConnection.query(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\``);
  await adminConnection.end();
}

async function getDb() {
  if (!connection) {
    await ensureDatabase();
    connection = await mysql.createConnection(dbConfig);
  }
  return connection;
}

module.exports = { getDb, dbConfig, ensureDatabase };
