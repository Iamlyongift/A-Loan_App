import express from "express";

import {
  applyForLoan,
  approveLoan,
  getAllLoans,
  getPendingLoans,
  getUserLoans,
  rejectLoan,
} from "../controller/loanController";
import { auth, requireAdmin } from "../middleware/Auth";

const router = express.Router();

// User routes
router.post("/apply", auth, applyForLoan);
router.get("/user-loans", auth, getUserLoans);

// Admin routes
router.get("/pending", auth, requireAdmin, getPendingLoans);
router.put("/approve/:loanId", auth, requireAdmin, approveLoan);
router.put("/reject/:loanId", auth, requireAdmin, rejectLoan);
router.get("/all", auth, requireAdmin, getAllLoans);

export default router;
