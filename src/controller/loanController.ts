import { Request, Response } from "express";
import LoanModel from "../models/loanModel";
import UserModel from "../models/userModel";
import { AuthenticatedRequest } from "../middleware/Auth";
import { applyLoanSchema } from "../utils/utils";

export const applyForLoan = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    // Validate the input
    const { error, value } = applyLoanSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { amount, term } = value;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const newLoan = new LoanModel({
      user: userId,
      amount: String(amount),
      term: String(term),
      status: "pending",
    });

    await newLoan.save();

    await UserModel.findByIdAndUpdate(userId, {
      $push: { loans: newLoan._id },
    });

    res.status(201).json({
      message: "Loan application submitted successfully",
      loan: newLoan,
    });
  } catch (error) {
    console.error("Error in applyForLoan:", error);
    res
      .status(500)
      .json({ message: "An error occurred while applying for the loan" });
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

export const getPendingLoans = async (req: Request, res: Response) => {
  try {
    const pendingLoans = await LoanModel.find({ status: "pending" }).populate(
      "user",
      "username email"
    );
    res.status(200).json({ pendingLoans });
  } catch (error) {
    console.error("Error in getPendingLoans:", error);
    res
      .status(500)
      .json({ message: "An error occurred while fetching pending loans" });
  }
};

export const approveLoan = async (req: Request, res: Response) => {
  try {
    const { loanId } = req.params;
    const loan = await LoanModel.findByIdAndUpdate(
      loanId,
      { status: "approved" },
      { new: true }
    );
    if (!loan) {
      return res.status(404).json({ message: "Loan not found" });
    }
    res.status(200).json({ message: "Loan approved successfully", loan });
  } catch (error) {
    console.error("Error in approveLoan:", error);
    res
      .status(500)
      .json({ message: "An error occurred while approving the loan" });
  }
};

export const rejectLoan = async (req: Request, res: Response) => {
  try {
    const { loanId } = req.params;
    const loan = await LoanModel.findByIdAndUpdate(
      loanId,
      { status: "rejected" },
      { new: true }
    );
    if (!loan) {
      return res.status(404).json({ message: "Loan not found" });
    }
    res.status(200).json({ message: "Loan rejected successfully", loan });
  } catch (error) {
    console.error("Error in rejectLoan:", error);
    res
      .status(500)
      .json({ message: "An error occurred while rejecting the loan" });
  }
};

export const getAllLoans = async (req: Request, res: Response) => {
  try {
    const loans = await LoanModel.find().populate("user", "username email");
    res.status(200).json({ loans });
  } catch (error) {
    console.error("Error in getAllLoans:", error);
    res
      .status(500)
      .json({ message: "An error occurred while fetching all loans" });
  }
};
