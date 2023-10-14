import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import User from "../models/userModel.js";
import ErrorHandler from "../utils/errorHandler.js";
import cloudinary from "cloudinary";
import sendCookie from "../utils/sendCookie.js";
import sendEmail from "../utils/sendEmail.js";
import text from "../utils/sendEmailText.js";
import crypto from "crypto";

//REGISTER USER
export const register = catchAsyncErrors(async (req, res, next) => {
  
  let avatar = { public_id: "Profile_Pic", url: "/Profile.png" };

  if(req.body.avatar !== null){
    const result = await cloudinary.v2.uploader.upload(req.body.avatar, {
      folder: "Profile_Pics",
      width: 150,
      crop: "scale",
    });

    avatar = { public_id: result.public_id, url: result.secure_url }
  }

  const { name, email, password } = req.body;

  const user = await User.create({
    name,
    email,
    password,
    avatar,
  });

  sendCookie(user, 201, res);
});

//LOGIN USER
export const login = catchAsyncErrors(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new ErrorHandler(`Please Enter Email and Password`, 400));
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return next(new ErrorHandler(`Invalid Email and Password`, 401));
  }

  const isPasswordMatch = await user.comparePassword(password);

  if (!isPasswordMatch) {
    return next(new ErrorHandler(`Invalid Email and Password`, 401));
  }

  sendCookie(user, 200, res);
});

//LOGOUT
export const logout = catchAsyncErrors(async (req, res, next) => {
  res.cookie("userToken", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
    sameSite: process.env.NODE_ENV === "Production" ? "none" : "lax",
    secure: process.env.NODE_ENV === "Production" ? true : false,
  });

  res.status(200).json({
    success: true,
    message: `Logout Successfully`,
  });
});

//FORGOT PASSWORD
export const forgotPassword = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new ErrorHandler(`User Not Found`, 401));
  }

  const resetToken = user.getResetPasswordToken();

  await user.save({ validateBeforeSave: false });

  const resetPasswordUrl = `${process.env.FRONTEND_URI}/password/reset/${resetToken}`;

  const message = text(resetPasswordUrl, user.name);

  try {
    await sendEmail({
      email: user.email,
      subject: `Blue Store Password Recovery`,
      message,
    });

    res.status(200).json({
      success: true,
      message: `Email Sent to ${user.email} Successfully`,
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({ validateBeforeSave: false });

    return next(new ErrorHandler(error.message, 500));
  }
});

//RESET PASSWORD
export const resetPassword = catchAsyncErrors(async (req, res, next) => {
  const resetToken = req.params.token;

  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(
      new ErrorHandler(`Invalid Token or Token has been Expired`, 400)
    );
  }

  if (req.body.newPassword !== req.body.confirmPassword) {
    return next(new ErrorHandler(`Passwords Doesn't Match`, 400));
  }

  user.password = req.body.newPassword;

  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  sendCookie(user, 200, res);
});

//////////////////////////////////////--USER ROUTES--//////////////////////////////////////////

//GET USER PROFILE
export const getUserProfile = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    user,
  });
});

//UPDATE PASSWORD
export const updatePassword = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("+password");

  const isPasswordMatch = await user.comparePassword(req.body.oldPassword);

  if (!isPasswordMatch) {
    return next(new ErrorHandler(`Old Password is Incorrect`, 400));
  }

  if (req.body.newPassword !== req.body.confirmPassword) {
    return next(new ErrorHandler(`Passwords Doesn't Match`, 400));
  }

  user.password = req.body.newPassword;

  await user.save();

  sendCookie(user, 200, res);
});

//UPDATE PROFILE
export const updateProfile = catchAsyncErrors(async (req, res, next) => {
  const newUserData = {
    name: req.body.name,
    email: req.body.email,
  };

  if (req.body.avatar !== "") {
    const user = await User.findById(req.user.id);

    const imageId = user.avatar.public_id;

    await cloudinary.v2.uploader.destroy(imageId);

    const result = await cloudinary.v2.uploader.upload(req.body.avatar, {
      folder: "Profile Pics",
    });

    newUserData.avatar = {
      public_id: result.public_id,
      url: result.secure_url,
    };
  }

  await User.findByIdAndUpdate(req.user.id, newUserData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
  });
});

///////////////////////////////////--USER ROUTES FOR ADMIN--/////////////////////////////////////

//GET ALL USERS
export const getAllUsers = catchAsyncErrors(async (req, res, next) => {
  const users = await User.find();

  res.status(200).json({
    success: true,
    users,
  });
});

//GET USER DETAILS
export const getUserDetails = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new ErrorHandler(`User Not Exist with this ID`, 400));
  }

  res.status(200).json({
    success: true,
    user,
  });
});

//UPDATE USER PROFILE AND ROLE
export const updateUser = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new ErrorHandler(`User Not Exist with this ID`, 400));
  }

  const newUserData = {
    name: req.body.name,
    email: req.body.email,
    role: req.body.role,
  };

  await User.findByIdAndUpdate(req.params.id, newUserData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
  });
});

//DELETE USER
export const deleteUser = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new ErrorHandler(`User Not Exist with this ID`, 400));
  }

  const imageId = user.avatar.public_id;

  await cloudinary.v2.uploader.destroy(imageId);

  await user.deleteOne();

  res.status(200).json({
    success: true,
    message: `User Deleted Successfully`,
  });
});
