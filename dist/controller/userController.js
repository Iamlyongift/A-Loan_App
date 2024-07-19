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
exports.loginUser = exports.RegisterUser = exports.getUserDashboardData = exports.getLoanDetails = exports.getUserLoans = exports.changePassword = exports.updateUserProfile = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const userModel_1 = __importDefault(require("../models/userModel"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const loanModel_1 = __importDefault(require("../models/loanModel"));
const utils_1 = require("../utils/utils");
const jwtsecret = process.env.JWT_SECRET;
const updateUserProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("Request Body:", req.body);
        console.log("Request File:", req.file);
        const { username, email } = req.body;
        // Validate request body
        console.log("Validating request body...");
        const { error, value } = utils_1.updateProfileSchema.validate(req.body, {
            abortEarly: false,
        });
        if (error) {
            console.log("Validation error:", error.details);
            return res
                .status(400)
                .json({ Error: error.details.map((err) => err.message) });
        }
        // Find and update the user profile using the authenticated user's ID
        console.log("Updating user profile...");
        const profile = yield userModel_1.default.findByIdAndUpdate(req.user._id, {
            username,
            email,
        }, { new: true });
        if (!profile) {
            console.log("User not found with ID:", req.user._id);
            return res.status(404).json({ message: "User not found" });
        }
        console.log("User profile updated:", profile);
        res.status(200).json({ message: "User updated", profile });
    }
    catch (error) {
        console.error("An unexpected error occurred:", error);
        res.status(500).json({ message: "An unexpected error occurred" });
    }
});
exports.updateUserProfile = updateUserProfile;
// export const updateUserProfile = async (
//   req: AuthenticatedRequest,
//   res: Response
// ) => {
//   try {
//     const userId = req.user?._id;
//     const { username, email } = req.body;
//     const user = await UserModel.findByIdAndUpdate(
//       userId,
//       { username, email },
//       { new: true }
//     ).select("-password");
//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }
//     res.status(200).json({ message: "Profile updated successfully", user });
//   } catch (error) {
//     console.error("Error in updateUserProfile:", error);
//     res
//       .status(500)
//       .json({ message: "An error occurred while updating user profile" });
//   }
// };
const changePassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { oldPassword, newPassword, confirmPassword } = req.body;
        // Log request body
        console.log("Request body:", req.body);
        // Validate request body
        const { error } = utils_1.changePasswordSchema.validate(req.body, utils_1.option);
        if (error) {
            console.log("Validation error:", error.details.map((err) => err.message));
            return res
                .status(400)
                .json({ Error: error.details.map((err) => err.message) });
        }
        // Get user from request (assuming user is added to req by auth middleware)
        const userId = req.user._id;
        console.log("User ID:", userId);
        // Fetch user from database
        const user = yield userModel_1.default.findById(userId);
        if (!user) {
            console.log("User not found");
            return res.status(404).json({ message: "User not found" });
        }
        // Verify old password
        const isMatch = yield bcryptjs_1.default.compare(oldPassword, user.password);
        if (!isMatch) {
            console.log("Old password is incorrect");
            return res.status(400).json({ message: "Old password is incorrect" });
        }
        // Check if new password and confirm password match
        if (newPassword !== confirmPassword) {
            console.log("New passwords do not match");
            return res.status(400).json({ message: "New passwords do not match" });
        }
        // Hash new password
        const passwordHash = yield bcryptjs_1.default.hash(newPassword, yield bcryptjs_1.default.genSalt(12));
        console.log("New password hash generated");
        // Update password in the database
        user.password = passwordHash;
        yield user.save();
        console.log("Password updated successfully");
        res.status(200).json({ message: "Password changed successfully" });
    }
    catch (error) {
        console.error("Error changing password:", error);
        res.status(500).json({ message: "An unexpected error occurred" });
    }
});
exports.changePassword = changePassword;
const getUserLoans = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
        const loans = yield loanModel_1.default.find({ user: userId });
        res.status(200).json({ loans });
    }
    catch (error) {
        console.error("Error in getUserLoans:", error);
        res
            .status(500)
            .json({ message: "An error occurred while fetching user loans" });
    }
});
exports.getUserLoans = getUserLoans;
const getLoanDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
        const { loanId } = req.params;
        const loan = yield loanModel_1.default.findOne({ _id: loanId, user: userId });
        if (!loan) {
            return res
                .status(404)
                .json({ message: "Loan not found or does not belong to user" });
        }
        res.status(200).json({ loan });
    }
    catch (error) {
        console.error("Error in getLoanDetails:", error);
        res
            .status(500)
            .json({ message: "An error occurred while fetching loan details" });
    }
});
exports.getLoanDetails = getLoanDetails;
const getUserDashboardData = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
        const totalLoans = yield loanModel_1.default.countDocuments({ user: userId });
        const pendingLoans = yield loanModel_1.default.countDocuments({
            user: userId,
            status: "pending",
        });
        const approvedLoans = yield loanModel_1.default.countDocuments({
            user: userId,
            status: "approved",
        });
        const recentLoans = yield loanModel_1.default.find({ user: userId })
            .sort({ createdAt: -1 })
            .limit(5);
        res.status(200).json({
            totalLoans,
            pendingLoans,
            approvedLoans,
            recentLoans,
        });
    }
    catch (error) {
        console.error("Error in getUserDashboardData:", error);
        res.status(500).json({
            message: "An error occurred while fetching user dashboard data",
        });
    }
});
exports.getUserDashboardData = getUserDashboardData;
const RegisterUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Log the incoming file and body data;
        console.log("Body:", req.body);
        const { username, email, password, confirm_password, role } = req.body;
        // Validate user input
        const { error, value } = utils_1.RegisterSchema.validate(req.body, {
            abortEarly: false,
        });
        if (error) {
            return res
                .status(400)
                .json({ Error: error.details.map((err) => err.message) });
        }
        // Ensure passwords match
        if (password !== confirm_password) {
            return res.status(400).json({ Error: "Passwords do not match" });
        }
        // Hashing password
        const passwordHash = yield bcryptjs_1.default.hash(password, yield bcryptjs_1.default.genSalt(12));
        const existingUser = yield userModel_1.default.findOne({ email });
        // Create a new user document if the user doesn't already exist
        if (!existingUser) {
            const newUser = yield userModel_1.default.create({
                username,
                email,
                password: passwordHash,
                role,
            });
            return res.status(200).json({ msg: "Registration successful", newUser });
        }
        return res.status(400).json({ error: "User already exists" });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Internal server error",
        });
    }
});
exports.RegisterUser = RegisterUser;
const loginUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("Body:", req.body);
        const email = req.body.email;
        const password = req.body.password; // Fixed the variable name to 'password' from 'passWord'
        // Validate user
        console.log("Validating user...");
        const validateUser = utils_1.LoginSchema.validate(req.body, {
            abortEarly: false,
        });
        if (validateUser.error) {
            console.log("Validation error:", validateUser.error.details[0].message);
            return res
                .status(400)
                .json({ Error: validateUser.error.details[0].message });
        }
        // Verify if user exists
        console.log("Finding user by email...");
        const user = yield userModel_1.default.findOne({ email });
        if (!user) {
            console.log("User not found");
            return res.status(400).json({ error: "User not found" });
        }
        console.log("User found:", user);
        const { _id } = user;
        // Compare password
        console.log("Comparing passwords...");
        const validUser = yield bcryptjs_1.default.compare(password, user.password);
        if (!validUser) {
            console.log("Invalid password");
            return res.status(400).json({ error: "Invalid password" });
        }
        // Generate token
        console.log("Generating token...");
        const token = jsonwebtoken_1.default.sign({ _id }, jwtsecret, { expiresIn: "30d" });
        console.log("Login successful");
        return res.status(200).json({
            msg: "Login Successful",
            user,
            token,
        });
    }
    catch (error) {
        console.error("Error during login:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});
exports.loginUser = loginUser;
