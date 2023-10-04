import express from "express";
import { isAuthenticated, authorizeRoles } from "../middlewares/auth.js";
import {
  newOrder,
  myOrders,
  getSingleOrder,
  updateOrder,
  deleteOrder,
  getAllOrders,
} from "../controllers/orderController.js";

const router = express.Router();

router.route("/order/new").post(isAuthenticated, newOrder);

router.route("/orders/me").get(isAuthenticated, myOrders);

router.route("/order/:id").get(isAuthenticated, getSingleOrder);

router
  .route("/admin/orders")
  .get(isAuthenticated, authorizeRoles("admin"), getAllOrders);

router
  .route("/admin/order/:id")
  .put(isAuthenticated, authorizeRoles("admin"), updateOrder)
  .delete(isAuthenticated, authorizeRoles("admin"), deleteOrder);

export default router;
