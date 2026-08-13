import mongoose from "mongoose";

export async function connectToDatabase() {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI environment variable is not set");
  }
  mongoose.connection.once("connected", () => {
    console.log("Successfully connected to MongoDB.");
  });
  await mongoose.connect(process.env.MONGODB_URI);
}
