const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const usersRoutes = require("./routes/users-routes");
const bookingsRoutes = require("./routes/bookings-routes");
const roomsRoutes = require("./routes/rooms-routes");
const customersRoutes = require("./routes/customers-routes");
const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(cors());

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE");

  next();
});

app.use("/api/users", usersRoutes);
app.use("/api/bookings", bookingsRoutes);
app.use("/api/rooms", roomsRoutes);
app.use("/api/customers", customersRoutes);

app.use((req, res, next) => {
  return res.status(404).json({
    message: "Could not find this route.",
  });
});

mongoose
  .connect(
    `mongodb+srv://anubhavsinha:anubhav@12345@cluster0.ijn7xu3.mongodb.net/hotel-app?retryWrites=true&w=majority`,
    { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true }
  )
  .then(() => {
    console.log("app started on port 5000");
    app.listen(5000);
  })
  .catch((err) => {
    console.log(err);
  });
