const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const mongoose = require("mongoose");

const authRoutes = require("./routes/authRoutes");
const quizRoutes = require("./routes/quizRoutes");

dotenv.config({ path: "./.env" });

const PORT = process.env.PORT;
const MONGO_URI = process.env.MONGO_URI;

const app = express();
app.use(morgan("dev"));
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/quiz", quizRoutes);

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("Database connected");
  })
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server started on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect database and starting server", err);
  });
