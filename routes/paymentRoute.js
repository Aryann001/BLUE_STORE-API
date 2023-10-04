import express from "express";
import {
  checkout,
  getRazorApiKey,
  paymentVerification,
} from "../controllers/paymentController.js";
import { isAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

router.route(`/checkout`).post(isAuthenticated, checkout);

router.route(`/paymentverification`).post(isAuthenticated, paymentVerification);

router.route(`/getrazorapikey`).get(isAuthenticated, getRazorApiKey);

export default router;
