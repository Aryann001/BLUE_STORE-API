import express from "express";
import {
  createBanner,
  deleteBanner,
  getBanner,
  updateBanner,
} from "../controllers/bannerController.js";
import { authorizeRoles, isAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

router.route(`/getbanner`).get(getBanner);

router
  .route(`/banner/create`)
  .post(isAuthenticated, authorizeRoles(`admin`), createBanner);

router
  .route(`/banner/update`)
  .put(isAuthenticated, authorizeRoles(`admin`), updateBanner);

router
  .route(`/banner/delete`)
  .delete(isAuthenticated, authorizeRoles(`admin`), deleteBanner);

export default router;
