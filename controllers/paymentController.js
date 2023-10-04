import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import { razorpayInstance } from "../server.js";
import Payment from "../models/paymentModel.js";
import crypto from "crypto";

export const checkout = catchAsyncErrors(async (req, res) => {
  const options = {
    amount: Number(req.body.amount * 100),
    currency: "INR",
  };

  const order = await razorpayInstance.orders.create(options);

  res.status(200).json({
    success: true,
    order,
  });
});

export const paymentVerification = catchAsyncErrors(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    req.body;

  const body = razorpay_order_id + "|" + razorpay_payment_id;

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_API_SECRET)
    .update(body.toString())
    .digest("hex");

  const isAuthentic = expectedSignature === razorpay_signature;

  if (isAuthentic) {
    await Payment.create({
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    });

    res.redirect(
      `${process.env.FRONTEND_URI}/paymentsuccess?referance=${razorpay_payment_id}`
    );
  } else {
    res.status(400).json({
      success: false,
    });
  }
});

export const getRazorApiKey = catchAsyncErrors(async (req, res) => {
  res.status(200).json({
    success: true,
    key: process.env.RAZORPAY_API_KEY,
  });
});
