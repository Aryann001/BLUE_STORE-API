import ErrorHandler from "../utils/errorHandler.js";

export default (err, req, res, next) => {
  err.message = err.message || "Internal Server Error";
  err.statusCode = err.statusCode || 500;

  //Cast Error
  if (err.name === "CastError") {
    const message = `Resource Not Found. Invalid: ${err.path}`;
    err = new ErrorHandler(message, 400);
  }

  //Mongoose Duplicate Key Error
  if (err.code === 11000) {
    const message = `Duplicate ${Object.keys(err.keyValue)} Entered`;
    err = new ErrorHandler(message, 400);
  }

  //Wrong JWT Token Error
  if (err.name === "JsonWebTokenError") {
    const message = `JWT is Invalid, Try Again Later`;
    err = new ErrorHandler(message, 400);
  }

  //JWT Token Expire Error
  if (err.name === "TokenExpiredError") {
    const message = `JWT is Expired, Try Again Later`;
    err = new ErrorHandler(message, 400);
  }

  res.status(err.statusCode).json({
    success: false,
    message: err.message,
  });
};
