"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const loanController_1 = require("../controller/loanController");
const Auth_1 = require("../middleware/Auth");
const router = express_1.default.Router();
// User routes
router.post("/apply", Auth_1.auth, loanController_1.applyForLoan);
router.get("/user-loans", Auth_1.auth, loanController_1.getUserLoans);
// Admin routes
router.get("/pending", Auth_1.auth, Auth_1.requireAdmin, loanController_1.getPendingLoans);
router.put("/approve/:loanId", Auth_1.auth, Auth_1.requireAdmin, loanController_1.approveLoan);
router.put("/reject/:loanId", Auth_1.auth, Auth_1.requireAdmin, loanController_1.rejectLoan);
router.get("/all", Auth_1.auth, Auth_1.requireAdmin, loanController_1.getAllLoans);
exports.default = router;
