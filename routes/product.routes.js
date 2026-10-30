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
import multer from 'multer';

const router = express.Router();

// Wrapper to catch multer errors cleanly
const handleUpload = (field, maxCount) => {
  return (req, res, next) => {
    upload.array(field, maxCount)(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({
          message: `Upload error: ${err.message} (File may be too large)`,
        });
      } else if (err) {
        return res.status(400).json({ message: err.message });
      }
      next();
    });
  };
};

router.route('/')
  .get(getProducts)
  .post(
    protect,
    authorizeRoles('admin', 'user'),
    handleUpload('images', 5),
    createProduct
  );

router.route('/:id')
  .get(getProductById)
  .put(
    protect,
    authorizeRoles('admin', 'user'),
    handleUpload('images', 5),
    updateProduct
  )
  .delete(
    protect,
    authorizeRoles('admin', 'user'),
    deleteProduct
  );

export default router;