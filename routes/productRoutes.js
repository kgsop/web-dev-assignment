const express = require('express');
const Product = require('../models/Product');
const validateObjectId = require('../middleware/validateObjectId');

const router = express.Router();
const allowedFields = ['name', 'category', 'price', 'quantity', 'lowStockThreshold'];

function validateProductBody(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return 'Request body must be a JSON object.';
  }

  const unknownFields = Object.keys(body).filter((field) => !allowedFields.includes(field));
  if (unknownFields.length > 0) {
    return `Unknown product field(s): ${unknownFields.join(', ')}.`;
  }

  return null;
}

function parsePositiveInteger(value, defaultValue, fieldName) {
  if (value === undefined) {
    return defaultValue;
  }

  const parsedValue = Number(value);
  if (!Number.isInteger(parsedValue) || parsedValue < 1) {
    const error = new Error(`${fieldName} must be a positive integer.`);
    error.status = 400;
    throw error;
  }

  return parsedValue;
}

router.post('/', async (req, res, next) => {
  const bodyError = validateProductBody(req.body);
  if (bodyError) {
    return res.status(400).json({ message: bodyError });
  }

  try {
    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
});

router.get('/', async (req, res, next) => {
  try {
    const page = parsePositiveInteger(req.query.page, 1, 'page');
    const limit = parsePositiveInteger(req.query.limit, 10, 'limit');

    if (limit > 100) {
      return res.status(400).json({ message: 'limit cannot be greater than 100.' });
    }

    const sortFields = ['price', 'name', 'quantity'];
    const sortField = req.query.sort || 'name';
    const sortOrder = req.query.order || 'asc';
    if (
      (req.query.category !== undefined && typeof req.query.category !== 'string') ||
      (req.query.search !== undefined && typeof req.query.search !== 'string')
    ) {
      return res.status(400).json({ message: 'category and search must be strings.' });
    }

    if (!sortFields.includes(sortField)) {
      return res.status(400).json({
        message: 'sort must be one of: price, name, quantity.'
      });
    }
    if (!['asc', 'desc'].includes(sortOrder)) {
      return res.status(400).json({ message: 'order must be asc or desc.' });
    }

    const filter = {};
    if (req.query.category) {
      filter.category = req.query.category;
    }
    if (req.query.search) {
      const escapedSearch = req.query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.name = { $regex: escapedSearch, $options: 'i' };
    }

    const [products, totalProducts] = await Promise.all([
      Product.find(filter)
        .sort({ [sortField]: sortOrder === 'asc' ? 1 : -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Product.countDocuments(filter)
    ]);

    res.json({
      products,
      totalProducts,
      page,
      limit,
      totalPages: Math.ceil(totalProducts / limit)
    });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', validateObjectId, async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    res.json(product);
  } catch (error) {
    next(error);
  }
});

router.put('/:id', validateObjectId, async (req, res, next) => {
  const bodyError = validateProductBody(req.body);
  if (bodyError) {
    return res.status(400).json({ message: bodyError });
  }
  if (Object.keys(req.body).length === 0) {
    return res.status(400).json({ message: 'Provide at least one product field to update.' });
  }

  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    res.json(product);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', validateObjectId, async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    res.json({ message: 'Product deleted successfully.', product });
  } catch (error) {
    next(error);
  }
});

router.patch('/:id/restock', validateObjectId, async (req, res, next) => {
  const amount = req.body && req.body.quantity;
  if (typeof amount !== 'number' || !Number.isFinite(amount) || amount <= 0) {
    return res.status(400).json({ message: 'quantity must be a positive number.' });
  }

  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { $inc: { quantity: amount } },
      { new: true, runValidators: true }
    );
    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    res.json({ message: 'Product restocked successfully.', product });
  } catch (error) {
    next(error);
  }
});

router.patch('/:id/sell', validateObjectId, async (req, res, next) => {
  const amount = req.body && req.body.quantity;
  if (typeof amount !== 'number' || !Number.isFinite(amount) || amount <= 0) {
    return res.status(400).json({ message: 'quantity must be a positive number.' });
  }

  try {
    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, quantity: { $gte: amount } },
      { $inc: { quantity: -amount } },
      { new: true, runValidators: true }
    );
    if (!product) {
      const existingProduct = await Product.exists({ _id: req.params.id });
      if (!existingProduct) {
        return res.status(404).json({ message: 'Product not found.' });
      }

      return res.status(400).json({ message: 'Not enough stock available.' });
    }

    res.json({ message: 'Product sold successfully.', product });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
