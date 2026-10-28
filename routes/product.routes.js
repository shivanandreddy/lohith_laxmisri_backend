import express from 'express';
import { 
  getProducts, 
  getProductById, 
  createProduct, 
  updateProduct, 
  deleteProduct 
} from '../controllers/product.controller.js';
import { protect, authorizeRoles } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.route('/')
  .get(getProducts)
  .post(protect, authorizeRoles('admin', 'user'), createProduct);

router.route('/:id')
  .get(getProductById)
  .put(protect, authorizeRoles('admin', 'user'), updateProduct)
  .delete(protect, authorizeRoles('admin', 'user'), deleteProduct);

export default router;