// server.js (top)
const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]); // google DNS — temporary
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth", require("./routes/auth"));
app.use("/api/invitations", require("./routes/invitations"));

app.get("/", (req, res) =>
  res.json({ message: "SmartLearningICT API running ✅" }),
);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    app.listen(process.env.PORT || 5000, () =>
      console.log(`🚀 Server running on port ${process.env.PORT || 5000}`),
    );
  })
  .catch((err) => console.error("❌ MongoDB connection error:", err));
