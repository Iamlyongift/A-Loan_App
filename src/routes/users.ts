import express from "express";

import { auth } from "../middleware/Auth";
import {
  changePassword,
  getLoanDetails,
  getUserDashboardData,
  loginUser,
  RegisterUser,
  updateUserProfile,
} from "../controller/userController";
import { getUserLoans } from "../controller/loanController";

const router = express.Router();

router.post("/register", RegisterUser);
router.post("/login", loginUser);
// All routes here require user authentication
router.use(auth);

router.put("/update_profile", updateUserProfile);
router.put("/change-password", changePassword);
router.get("/loans", getUserLoans);
router.get("/loans/:loanId", getLoanDetails);
router.get("/dashboard", getUserDashboardData);

export default router;
