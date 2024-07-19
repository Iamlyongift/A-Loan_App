import mongoose from "mongoose";
import UserModel from "./src/models/userModel";

const addStatusToUsers = async () => {
  try {
    // Connect to your database
    await mongoose.connect("mongodb://localhost:27017/Loan_app");

    // Update all users without a status field
    const result = await UserModel.updateMany(
      { status: { $exists: false } },
      { $set: { status: "active" } }
    );

    console.log(`Updated ${result.modifiedCount} users.`);
  } catch (error) {
    console.error("Error updating users:", error);
  } finally {
    await mongoose.disconnect();
  }
};

addStatusToUsers();
