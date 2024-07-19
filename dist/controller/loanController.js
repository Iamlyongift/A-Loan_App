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
exports.getAllLoans = exports.rejectLoan = exports.approveLoan = exports.getPendingLoans = exports.getUserLoans = exports.applyForLoan = void 0;
const loanModel_1 = __importDefault(require("../models/loanModel"));
const userModel_1 = __importDefault(require("../models/userModel"));
const utils_1 = require("../utils/utils");
const applyForLoan = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        // Validate the input
        const { error, value } = utils_1.applyLoanSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }
        const { amount, term } = value;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
        if (!userId) {
            return res.status(401).json({ message: "User not authenticated" });
        }
        const newLoan = new loanModel_1.default({
            user: userId,
            amount: String(amount),
            term: String(term),
            status: "pending",
        });
        yield newLoan.save();
        yield userModel_1.default.findByIdAndUpdate(userId, {
            $push: { loans: newLoan._id },
        });
        res.status(201).json({
            message: "Loan application submitted successfully",
            loan: newLoan,
        });
    }
    catch (error) {
        console.error("Error in applyForLoan:", error);
        res
            .status(500)
            .json({ message: "An error occurred while applying for the loan" });
    }
});
exports.applyForLoan = applyForLoan;
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
const getPendingLoans = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const pendingLoans = yield loanModel_1.default.find({ status: "pending" }).populate("user", "username email");
        res.status(200).json({ pendingLoans });
    }
    catch (error) {
        console.error("Error in getPendingLoans:", error);
        res
            .status(500)
            .json({ message: "An error occurred while fetching pending loans" });
    }
});
exports.getPendingLoans = getPendingLoans;
const approveLoan = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { loanId } = req.params;
        const loan = yield loanModel_1.default.findByIdAndUpdate(loanId, { status: "approved" }, { new: true });
        if (!loan) {
            return res.status(404).json({ message: "Loan not found" });
        }
        res.status(200).json({ message: "Loan approved successfully", loan });
    }
    catch (error) {
        console.error("Error in approveLoan:", error);
        res
            .status(500)
            .json({ message: "An error occurred while approving the loan" });
    }
});
exports.approveLoan = approveLoan;
const rejectLoan = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { loanId } = req.params;
        const loan = yield loanModel_1.default.findByIdAndUpdate(loanId, { status: "rejected" }, { new: true });
        if (!loan) {
            return res.status(404).json({ message: "Loan not found" });
        }
        res.status(200).json({ message: "Loan rejected successfully", loan });
    }
    catch (error) {
        console.error("Error in rejectLoan:", error);
        res
            .status(500)
            .json({ message: "An error occurred while rejecting the loan" });
    }
});
exports.rejectLoan = rejectLoan;
const getAllLoans = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const loans = yield loanModel_1.default.find().populate("user", "username email");
        res.status(200).json({ loans });
    }
    catch (error) {
        console.error("Error in getAllLoans:", error);
        res
            .status(500)
            .json({ message: "An error occurred while fetching all loans" });
    }
});
exports.getAllLoans = getAllLoans;
