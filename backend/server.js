require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { getDb } = require('./config/db');
const productRoutes = require('./routes/productRoutes');
const authRoutes = require('./routes/authRoutes');
const orderRoutes = require('./routes/orderRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running successfully.' });
});

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

async function startServer() {
  try {
    const db = await getDb();
    await db.query('SELECT 1');
    console.log('MySQL connected successfully.');
  } catch (error) {
    console.warn('MySQL connection failed. Starting server in fallback mode.');
    console.warn(error.message);
  }

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
