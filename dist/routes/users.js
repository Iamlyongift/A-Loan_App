"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Auth_1 = require("../middleware/Auth");
const userController_1 = require("../controller/userController");
const loanController_1 = require("../controller/loanController");
const router = express_1.default.Router();
router.post("/register", userController_1.RegisterUser);
router.post("/login", userController_1.loginUser);
// All routes here require user authentication
router.use(Auth_1.auth);
router.put("/update_profile", userController_1.updateUserProfile);
router.put("/change-password", userController_1.changePassword);
router.get("/loans", loanController_1.getUserLoans);
router.get("/loans/:loanId", userController_1.getLoanDetails);
router.get("/dashboard", userController_1.getUserDashboardData);
exports.default = router;
