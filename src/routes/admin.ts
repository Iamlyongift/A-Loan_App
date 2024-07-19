import express from "express";

import {
  adminLogin,
  adminRegister,
  getAdminDashboardData,
  getAllUsers,
  getLoanStats,
  getUserDetails,
  updateUserStatus,
} from "../controller/adminController";
import { auth, requireAdmin } from "../middleware/Auth";

const router = express.Router();

router.post("/register", adminRegister);
router.post("/login", adminLogin);
// All routes here require admin privileges
router.use(auth, requireAdmin);

router.get("/users", getAllUsers);
router.get("/users/:_id", getUserDetails);
router.put("/users/:_id/status", updateUserStatus);
router.get("/loan-stats", getLoanStats);
router.get("/dashboard", getAdminDashboardData);

export default router;
