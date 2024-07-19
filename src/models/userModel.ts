import mongoose, { Document, Schema } from "mongoose";

export interface UserType extends Document {
  username: string;
  email: string;
  password: string;
  role: "user" | "admin";
  status: "active" | "inactive";
  loans?: mongoose.Types.ObjectId[];
}

const userSchema = new Schema(
  {
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    loans: [{ type: mongoose.Schema.Types.ObjectId, ref: "Loan" }],
  },
  { timestamps: true }
);

const UserModel = mongoose.model<UserType>("User", userSchema);

export default UserModel;
