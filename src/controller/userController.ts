import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import UserModel from "../models/userModel";
import jwt from "jsonwebtoken";
import LoanModel from "../models/loanModel";
import { AuthenticatedRequest } from "../middleware/Auth";
import {
  changePasswordSchema,
  LoginSchema,
  RegisterSchema,
  option,
  updateProfileSchema,
} from "../utils/utils";

const jwtsecret = process.env.JWT_SECRET as string;

export const updateUserProfile = async (req: Request | any, res: Response) => {
  try {
    console.log("Request Body:", req.body);
    console.log("Request File:", req.file);

    const { username, email } = req.body;

    // Validate request body
    console.log("Validating request body...");
    const { error, value } = updateProfileSchema.validate(req.body, {
      abortEarly: false,
    });
    if (error) {
      console.log("Validation error:", error.details);
      return res
        .status(400)
        .json({ Error: error.details.map((err: any) => err.message) });
    }

    // Find and update the user profile using the authenticated user's ID
    console.log("Updating user profile...");
    const profile = await UserModel.findByIdAndUpdate(
      req.user._id,
      {
        username,
        email,
      },
      { new: true }
    );

    if (!profile) {
      console.log("User not found with ID:", req.user._id);
      return res.status(404).json({ message: "User not found" });
    }

    console.log("User profile updated:", profile);
    res.status(200).json({ message: "User updated", profile });
  } catch (error) {
    console.error("An unexpected error occurred:", error);
    res.status(500).json({ message: "An unexpected error occurred" });
  }
};

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

export const changePassword = async (req: Request | any, res: Response) => {
  try {
    const { oldPassword, newPassword, confirmPassword } = req.body;

    // Log request body
    console.log("Request body:", req.body);

    // Validate request body
    const { error } = changePasswordSchema.validate(req.body, option);
    if (error) {
      console.log(
        "Validation error:",
        error.details.map((err: any) => err.message)
      );
      return res
        .status(400)
        .json({ Error: error.details.map((err: any) => err.message) });
    }

    // Get user from request (assuming user is added to req by auth middleware)
    const userId = req.user._id;
    console.log("User ID:", userId);

    // Fetch user from database
    const user = await UserModel.findById(userId);
    if (!user) {
      console.log("User not found");
      return res.status(404).json({ message: "User not found" });
    }

    // Verify old password
    const isMatch = await bcrypt.compare(oldPassword, user.password);
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
    const passwordHash = await bcrypt.hash(
      newPassword,
      await bcrypt.genSalt(12)
    );
    console.log("New password hash generated");

    // Update password in the database
    user.password = passwordHash;
    await user.save();
    console.log("Password updated successfully");

    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Error changing password:", error);
    res.status(500).json({ message: "An unexpected error occurred" });
  }
};

export const getUserLoans = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const userId = req.user?._id;
    const loans = await LoanModel.find({ user: userId });
    res.status(200).json({ loans });
  } catch (error) {
    console.error("Error in getUserLoans:", error);
    res
      .status(500)
      .json({ message: "An error occurred while fetching user loans" });
  }
};

export const getLoanDetails = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const userId = req.user?._id;
    const { loanId } = req.params;

    const loan = await LoanModel.findOne({ _id: loanId, user: userId });
    if (!loan) {
      return res
        .status(404)
        .json({ message: "Loan not found or does not belong to user" });
    }

    res.status(200).json({ loan });
  } catch (error) {
    console.error("Error in getLoanDetails:", error);
    res
      .status(500)
      .json({ message: "An error occurred while fetching loan details" });
  }
};

export const getUserDashboardData = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const userId = req.user?._id;

    const totalLoans = await LoanModel.countDocuments({ user: userId });
    const pendingLoans = await LoanModel.countDocuments({
      user: userId,
      status: "pending",
    });
    const approvedLoans = await LoanModel.countDocuments({
      user: userId,
      status: "approved",
    });
    const recentLoans = await LoanModel.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      totalLoans,
      pendingLoans,
      approvedLoans,
      recentLoans,
    });
  } catch (error) {
    console.error("Error in getUserDashboardData:", error);
    res.status(500).json({
      message: "An error occurred while fetching user dashboard data",
    });
  }
};

export const RegisterUser = async (req: Request, res: Response) => {
  try {
    // Log the incoming file and body data;
    console.log("Body:", req.body);
    const { username, email, password, confirm_password, role } = req.body;

    // Validate user input
    const { error, value } = RegisterSchema.validate(req.body, {
      abortEarly: false,
    });

    if (error) {
      return res
        .status(400)
        .json({ Error: error.details.map((err: any) => err.message) });
    }

    // Ensure passwords match
    if (password !== confirm_password) {
      return res.status(400).json({ Error: "Passwords do not match" });
    }

    // Hashing password
    const passwordHash = await bcrypt.hash(password, await bcrypt.genSalt(12));

    const existingUser = await UserModel.findOne({ email });

    // Create a new user document if the user doesn't already exist
    if (!existingUser) {
      const newUser = await UserModel.create({
        username,
        email,
        password: passwordHash,
        role,
      });
      return res.status(200).json({ msg: "Registration successful", newUser });
    }
    return res.status(400).json({ error: "User already exists" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  try {
    console.log("Body:", req.body);

    const email = req.body.email;
    const password = req.body.password; // Fixed the variable name to 'password' from 'passWord'

    // Validate user
    console.log("Validating user...");
    const validateUser = LoginSchema.validate(req.body, {
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
    const user = await UserModel.findOne({ email });

    if (!user) {
      console.log("User not found");
      return res.status(400).json({ error: "User not found" });
    }
    console.log("User found:", user);

    const { _id } = user;

    // Compare password
    console.log("Comparing passwords...");
    const validUser = await bcrypt.compare(password, user.password);

    if (!validUser) {
      console.log("Invalid password");
      return res.status(400).json({ error: "Invalid password" });
    }

    // Generate token
    console.log("Generating token...");
    const token = jwt.sign({ _id }, jwtsecret, { expiresIn: "30d" });

    console.log("Login successful");
    return res.status(200).json({
      msg: "Login Successful",
      user,
      token,
    });
  } catch (error) {
    console.error("Error during login:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
