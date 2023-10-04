import app from "./app.js";
import connectDB from "./config/database.js";
import dotenv from "dotenv";
import cloudinary from "cloudinary";
import Razorpay from "razorpay";

//Uncaught Exception
process.on("uncaughtException", (error) => {
  console.log(`Error: ${error.message}`);
  console.log(`Shutting Down the Server due to Uncaught Exception`);

  process.exit(1);
});

//config
dotenv.config({
  path: "./config/config.env",
});

connectDB();

//Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

//Razorpay Instance
export const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_API_KEY,
  key_secret: process.env.RAZORPAY_API_SECRET,
});

const server = app.listen(process.env.PORT, () => {
  console.log(`Server is listen on port: ${process.env.PORT} in ${process.env.NODE_ENV}`);
});

//Unhandled Promise Rejection
process.on("unhandledRejection", (error) => {
  console.log(`Error: ${error.message}`);
  console.log(`Shutting Down the Server due to Unhandled Promise Rejection`);

  server.close(() => {
    process.exit(1);
  });
});
