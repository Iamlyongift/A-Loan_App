import mongoose from "mongoose";
import { Request, Response } from "express";
import UserModel from "../models/userModel";
import LoanModel from "../models/loanModel";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { AuthenticatedRequest } from "../middleware/Auth";
import { adminRegistrationSchema, loginSchema } from "../utils/utils";
const jwtsecret = process.env.JWT_SECRET as string;
const adminKey = process.env.ADMIN_REGISTRATION_KEY;

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    console.log("Fetching all users...");
    const users = await UserModel.find({ role: "user" }).select("-password");
    console.log("Users found:", users);

    if (!users || users.length === 0) {
      console.log("No users found");
      return res.status(404).json({ message: "No users found" });
    }

    res.status(200).json({ users });
  } catch (error) {
    console.error("Error in getAllUsers:", error);
    res.status(500).json({
      message: "An error occurred while fetching users",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

export const getUserDetails = async (req: Request, res: Response) => {
  try {
    const { _id } = req.params;
    console.log("Requested user _id:", _id); // Log the received _id

    // You might want to add a check here to ensure the _id is valid
    if (!_id || typeof _id !== "string") {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const user = await UserModel.findById(_id).select("-password");
    console.log("Found user:", user); // Log the found user (or null if not found)

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error("Error in getUserDetails:", error);
    res
      .status(500)
      .json({ message: "An error occurred while fetching user details" });
  }
};

export const updateUserStatus = async (req: Request, res: Response) => {
  try {
    const { _id } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(_id)) {
      return res.status(400).json({ message: "Invalid user ID format" });
    }

    if (!["active", "inactive"].includes(status)) {
      return res
        .status(400)
        .json({ message: "Invalid status. Must be 'active' or 'inactive'." });
    }

    const user = await UserModel.findByIdAndUpdate(
      _id,
      { status },
      { new: true, select: "username status" }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User status updated successfully", user });
  } catch (error) {
    console.error("Error in updateUserStatus:", error);
    res
      .status(500)
      .json({ message: "An error occurred while updating user status" });
  }
};

export const getLoanStats = async (req: Request, res: Response) => {
  try {
    const totalLoans = await LoanModel.countDocuments();
    const pendingLoans = await LoanModel.countDocuments({ status: "pending" });
    const approvedLoans = await LoanModel.countDocuments({
      status: "approved",
    });
    const rejectedLoans = await LoanModel.countDocuments({
      status: "rejected",
    });

    res.status(200).json({
      totalLoans,
      pendingLoans,
      approvedLoans,
      rejectedLoans,
    });
  } catch (error) {
    console.error("Error in getLoanStats:", error);
    res
      .status(500)
      .json({ message: "An error occurred while fetching loan statistics" });
  }
};

export const getAdminDashboardData = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const totalUsers = await UserModel.countDocuments({ role: "user" });
    const totalLoans = await LoanModel.countDocuments();
    const pendingLoans = await LoanModel.countDocuments({ status: "pending" });
    const recentLoans = await LoanModel.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("user", "username email");

    res.status(200).json({
      totalUsers,
      totalLoans,
      pendingLoans,
      recentLoans,
    });
  } catch (error) {
    console.error("Error in getAdminDashboardData:", error);
    res.status(500).json({
      message: "An error occurred while fetching admin dashboard data",
    });
  }
};

export const adminRegister = async (req: Request, res: Response) => {
  try {
    // Validate the request body
    const { error, value } = adminRegistrationSchema.validate(req.body);

    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { username, email, password, adminKey } = value;

    // Check if the adminKey is correct
    if (adminKey !== process.env.ADMIN_REGISTRATION_KEY) {
      return res.status(403).json({ message: "Invalid admin key" });
    }

    // Check if the username already exists
    const existingUser = await UserModel.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: "Username already exists" });
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash(password, 10);
    const newAdmin = new UserModel({
      username,
      email,
      password: hashedPassword,
      role: "admin",
    });

    await newAdmin.save();

    res.status(201).json({ message: "Admin created successfully" });
  } catch (error) {
    console.error("Error in admin registration:", error);
    res.status(500).json({ message: "Error creating admin" });
  }
};
export const adminLogin = async (req: Request, res: Response) => {
  try {
    // Validate the request body
    const { error, value } = loginSchema.validate(req.body);

    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { username, password } = value;

    const user = await UserModel.findOne({ username });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    // Check if the user is an admin
    if (user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Access denied. Admin rights required." });
    }
    // In your login function
    const token = jwt.sign({ _id: user._id, role: user.role }, jwtsecret, {
      expiresIn: "30d",
    });

    res.json({ token, role: user.role });
  } catch (error) {
    console.error("Error in admin login:", error);
    res.status(500).json({ message: "An error occurred during login" });
  }
};
