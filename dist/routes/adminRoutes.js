"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const adminController_1 = require("../controller/adminController");
const Auth_1 = require("../middleware/Auth");
const router = express_1.default.Router();
// All routes here require admin privileges
router.use(Auth_1.auth, Auth_1.requireAdmin);
router.get("/users", adminController_1.getAllUsers);
router.get("/users/:userId", adminController_1.getUserDetails);
router.put("/users/:userId/status", adminController_1.updateUserStatus);
router.get("/loan-stats", adminController_1.getLoanStats);
router.get("/dashboard", adminController_1.getAdminDashboardData);
exports.default = router;
