import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import fileUpload from "express-fileupload";
import errorMiddleware from "./middlewares/error.js";
import cors from "cors";

const app = express();

//config
dotenv.config({
  path: "./config/config.env",
});

//Middleware
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(fileUpload());
app.use(
  cors({
    origin: [process.env.FRONTEND_URI],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

//Routes Import
import ProductRoute from "./routes/productRoute.js";
import UserRoute from "./routes/userRoute.js";
import OrderRoute from "./routes/orderRoute.js";
import PaymentRoute from "./routes/paymentRoute.js";
import BannerRoute from "./routes/bannerRoute.js";

//Routes
app.use("/api/v1", ProductRoute);
app.use("/api/v1", UserRoute);
app.use("/api/v1", OrderRoute);
app.use("/api/v1", PaymentRoute);
app.use("/api/v1", BannerRoute);

app.use(errorMiddleware);

export default app;
