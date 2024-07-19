import mongoose, { Document, Schema } from "mongoose";

export interface LoanType extends Document {
  user: mongoose.Types.ObjectId;
  amount: number;
  term: number;
  status: "pending" | "approved" | "rejected";
}

const loanSchema = new Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: String, required: true },
    term: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

const LoanModel = mongoose.model<LoanType>("Loan", loanSchema);

export default LoanModel;
