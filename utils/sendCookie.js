const sendCookie = (user, statusCode, res) => {
  const token = user.getJwtToken();

  const options = {
    httpOnly: true,
    expires: new Date(
      Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    sameSite: process.env.NODE_ENV === "Production" ? "none" : "lax",
    secure: process.env.NODE_ENV === "Production" ? true : false,
  };

  res.status(statusCode).cookie("userToken", token, options).json({
    success: true,
    user,
    token,
  });
};

export default sendCookie;
