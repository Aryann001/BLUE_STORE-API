import mongoose from "mongoose";

const connectDb = () => {
  mongoose
    .connect(process.env.DB_URI, {
      dbName: "BlueStore",
    })
    .then((data) =>
      console.log(`DB is connected with server : ${data.connection.host}`)
    );
};

export default connectDb;
