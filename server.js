require('dotenv').config();

const express = require('express');
const connectDB = require('./config/db');
const productRoutes = require('./routes/productRoutes');
const reportRoutes = require('./routes/reportRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use('/api/products', productRoutes);
app.use('/api/reports', reportRoutes);
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found.' });
});
app.use(errorHandler);

async function startServer() {
  try {
    await connectDB();
    app.listen(port, () => {
      console.log(`Inventory API is running on port ${port}.`);
    });
  } catch (error) {
    console.error('Unable to connect to MongoDB:', error.message);
    process.exit(1);
  }
}

startServer();
