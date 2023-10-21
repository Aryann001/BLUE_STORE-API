import express from "express";
import {
  deleteUser,
  forgotPassword,
  getAllUsers,
  getUserDetails,
  getUserProfile,
  login,
  logout,
  register,
  resetPassword,
  updatePassword,
  updateProfile,
  updateUser,
} from "../controllers/userController.js";
import { isAuthenticated, authorizeRoles } from "../middlewares/auth.js";

const router = express.Router();

router.route("/register").post(register);

router.route("/login").post(login);

router.route("/logout").get(logout);

router.route("/password/forgot").post(forgotPassword);

router.route("/password/reset/:token").put(resetPassword);

//USER ROUTES
router.route("/profile").get(isAuthenticated, getUserProfile);

router.route("/password/update").put(isAuthenticated, updatePassword);

router.route("/profile/update").put(isAuthenticated, updateProfile);

//USER ROUTES FOR ADMIN
router
  .route("/admin/users")
  .get(isAuthenticated, authorizeRoles("admin"), getAllUsers);

router
  .route("/admin/user/:id")
  .get(getUserDetails)
  .put(isAuthenticated, authorizeRoles("admin"), updateUser)
  .delete(isAuthenticated, authorizeRoles("admin"), deleteUser);

export default router;
