import mongoose from "mongoose";

export async function connectDatabase() {
  if (!process.env.MONGODB_URI)
    throw new Error(
      "MONGODB_URI is missing. Copy backend/.env.example to backend/.env and configure MongoDB Atlas.",
    );
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("MongoDB connected");
}
