"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminLogin = exports.adminRegister = exports.getAdminDashboardData = exports.getLoanStats = exports.updateUserStatus = exports.getUserDetails = exports.getAllUsers = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const userModel_1 = __importDefault(require("../models/userModel"));
const loanModel_1 = __importDefault(require("../models/loanModel"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const utils_1 = require("../utils/utils");
const jwtsecret = process.env.JWT_SECRET;
const adminKey = process.env.ADMIN_REGISTRATION_KEY;
const getAllUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("Fetching all users...");
        const users = yield userModel_1.default.find({ role: "user" }).select("-password");
        console.log("Users found:", users);
        if (!users || users.length === 0) {
            console.log("No users found");
            return res.status(404).json({ message: "No users found" });
        }
        res.status(200).json({ users });
    }
    catch (error) {
        console.error("Error in getAllUsers:", error);
        res.status(500).json({
            message: "An error occurred while fetching users",
            error: error instanceof Error ? error.message : String(error),
        });
    }
});
exports.getAllUsers = getAllUsers;
const getUserDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { _id } = req.params;
        console.log("Requested user _id:", _id); // Log the received _id
        // You might want to add a check here to ensure the _id is valid
        if (!_id || typeof _id !== "string") {
            return res.status(400).json({ message: "Invalid user ID" });
        }
        const user = yield userModel_1.default.findById(_id).select("-password");
        console.log("Found user:", user); // Log the found user (or null if not found)
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({ user });
    }
    catch (error) {
        console.error("Error in getUserDetails:", error);
        res
            .status(500)
            .json({ message: "An error occurred while fetching user details" });
    }
});
exports.getUserDetails = getUserDetails;
const updateUserStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { _id } = req.params;
        const { status } = req.body;
        if (!mongoose_1.default.Types.ObjectId.isValid(_id)) {
            return res.status(400).json({ message: "Invalid user ID format" });
        }
        if (!["active", "inactive"].includes(status)) {
            return res
                .status(400)
                .json({ message: "Invalid status. Must be 'active' or 'inactive'." });
        }
        const user = yield userModel_1.default.findByIdAndUpdate(_id, { status }, { new: true, select: "username status" });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({ message: "User status updated successfully", user });
    }
    catch (error) {
        console.error("Error in updateUserStatus:", error);
        res
            .status(500)
            .json({ message: "An error occurred while updating user status" });
    }
});
exports.updateUserStatus = updateUserStatus;
const getLoanStats = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const totalLoans = yield loanModel_1.default.countDocuments();
        const pendingLoans = yield loanModel_1.default.countDocuments({ status: "pending" });
        const approvedLoans = yield loanModel_1.default.countDocuments({
            status: "approved",
        });
        const rejectedLoans = yield loanModel_1.default.countDocuments({
            status: "rejected",
        });
        res.status(200).json({
            totalLoans,
            pendingLoans,
            approvedLoans,
            rejectedLoans,
        });
    }
    catch (error) {
        console.error("Error in getLoanStats:", error);
        res
            .status(500)
            .json({ message: "An error occurred while fetching loan statistics" });
    }
});
exports.getLoanStats = getLoanStats;
const getAdminDashboardData = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const totalUsers = yield userModel_1.default.countDocuments({ role: "user" });
        const totalLoans = yield loanModel_1.default.countDocuments();
        const pendingLoans = yield loanModel_1.default.countDocuments({ status: "pending" });
        const recentLoans = yield loanModel_1.default.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .populate("user", "username email");
        res.status(200).json({
            totalUsers,
            totalLoans,
            pendingLoans,
            recentLoans,
        });
    }
    catch (error) {
        console.error("Error in getAdminDashboardData:", error);
        res.status(500).json({
            message: "An error occurred while fetching admin dashboard data",
        });
    }
});
exports.getAdminDashboardData = getAdminDashboardData;
const adminRegister = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Validate the request body
        const { error, value } = utils_1.adminRegistrationSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }
        const { username, email, password, adminKey } = value;
        // Check if the adminKey is correct
        if (adminKey !== process.env.ADMIN_REGISTRATION_KEY) {
            return res.status(403).json({ message: "Invalid admin key" });
        }
        // Check if the username already exists
        const existingUser = yield userModel_1.default.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: "Username already exists" });
        }
        // Create admin user
        const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
        const newAdmin = new userModel_1.default({
            username,
            email,
            password: hashedPassword,
            role: "admin",
        });
        yield newAdmin.save();
        res.status(201).json({ message: "Admin created successfully" });
    }
    catch (error) {
        console.error("Error in admin registration:", error);
        res.status(500).json({ message: "Error creating admin" });
    }
});
exports.adminRegister = adminRegister;
const adminLogin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Validate the request body
        const { error, value } = utils_1.loginSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }
        const { username, password } = value;
        const user = yield userModel_1.default.findOne({ username });
        if (!user || !(yield bcryptjs_1.default.compare(password, user.password))) {
            return res.status(401).json({ message: "Invalid username or password" });
        }
        // Check if the user is an admin
        if (user.role !== "admin") {
            return res
                .status(403)
                .json({ message: "Access denied. Admin rights required." });
        }
        // In your login function
        const token = jsonwebtoken_1.default.sign({ _id: user._id, role: user.role }, jwtsecret, {
            expiresIn: "30d",
        });
        res.json({ token, role: user.role });
    }
    catch (error) {
        console.error("Error in admin login:", error);
        res.status(500).json({ message: "An error occurred during login" });
    }
});
exports.adminLogin = adminLogin;
