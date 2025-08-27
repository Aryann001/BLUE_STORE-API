import app from "./app.js";
import connectDB from "./config/database.js";
import dotenv from "dotenv";
import cloudinary from "cloudinary";
import Razorpay from "razorpay";

// Uncaught Exception
process.on("uncaughtException", (error) => {
  console.log(`Error: ${error.message}`);
  console.log(`Shutting Down the Server due to Uncaught Exception`);
  process.exit(1);
});

// config
dotenv.config({
  path: "./config/config.env",
});

// Connect to the database
connectDB();

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Razorpay Instance
export const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_API_KEY,
  key_secret: process.env.RAZORPAY_API_SECRET,
});

// Unhandled Promise Rejection
// NOTE: In a serverless environment, you can't gracefully close a server that you didn't create.
// The process will just exit on error.
process.on("unhandledRejection", (error) => {
  console.log(`Error: ${error.message}`);
  console.log(`Shutting Down the Server due to Unhandled Promise Rejection`);
  process.exit(1);
});

// ✅ EXPORT THE APP FOR VERCEL
export default app;
