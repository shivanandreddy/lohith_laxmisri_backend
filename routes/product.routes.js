
import express from 'express';

import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/product.controller.js';

import {
  protect,
  authorizeRoles,
} from '../middlewares/auth.middleware.js';

import upload from '../middlewares/upload.middleware.js';

const router = express.Router();

// GET all products | Public
// POST product with images | Admin/User
router.route('/')
  .get(getProducts)
  .post(
    protect,
    authorizeRoles('admin', 'user'),
    upload.array('images', 5),
    createProduct
  );

// GET one product | Public
// PUT update product with additional images | Admin/User
// DELETE product | Admin/User
router.route('/:id')
  .get(getProductById)
  .put(
    protect,
    authorizeRoles('admin', 'user'),
    upload.array('images', 5),
    updateProduct
  )
  .delete(
    protect,
    authorizeRoles('admin', 'user'),
    deleteProduct
  );

export default router;
