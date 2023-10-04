import express from "express";
import {
  createProduct,
  createProductReviews,
  deleteProduct,
  deleteReviews,
  featuredProducts,
  filteredProducts,
  getAllProducts,
  getAllReviews,
  getProductDetails,
  updateProduct,
} from "../controllers/productController.js";
import { isAuthenticated, authorizeRoles } from "../middlewares/auth.js";

const router = express.Router();

router
  .route("/admin/product/new")
  .post(isAuthenticated, authorizeRoles("admin"), createProduct);

router
  .route("/admin/products")
  .get(isAuthenticated, authorizeRoles("admin"), getAllProducts);

router.route("/products/featured").get(featuredProducts);

router.route("/products/filters").get(filteredProducts);

router
  .route("/admin/product/:id")
  .put(isAuthenticated, authorizeRoles("admin"), updateProduct)
  .delete(isAuthenticated, authorizeRoles("admin"), deleteProduct);

router.route("/product/:id").get(getProductDetails);

router
  .route("/reviews")
  .get(getAllReviews)
  .delete(isAuthenticated, deleteReviews);

router.route("/review").put(isAuthenticated, createProductReviews);

export default router;
