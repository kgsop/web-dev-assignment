const express = require('express');
const Product = require('../models/Product');

const router = express.Router();

router.get('/low-stock', async (req, res, next) => {
  try {
    const products = await Product.find({
      $expr: { $lte: ['$quantity', '$lowStockThreshold'] }
    }).sort({ category: 1, name: 1 });

    res.json({ count: products.length, products });
  } catch (error) {
    next(error);
  }
});

router.get('/category-summary', async (req, res, next) => {
  try {
    const summary = await Product.aggregate([
      {
        $group: {
          _id: '$category',
          totalProducts: { $sum: 1 },
          totalAvailableStock: { $sum: '$quantity' },
          totalInventoryValue: {
            $sum: { $multiply: ['$price', '$quantity'] }
          }
        }
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          _id: 0,
          category: '$_id',
          totalProducts: 1,
          totalAvailableStock: 1,
          totalInventoryValue: 1
        }
      }
    ]);

    res.json(summary);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
