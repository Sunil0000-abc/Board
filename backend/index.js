const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT;




mongoose.connect(process.env.MONGODB_URL)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));


const UserRoutes = require("./router");
app.use("/api", UserRoutes);

app.listen(PORT, () => {
  console.log("Server running on port 8000");
});