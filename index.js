const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const database = require("./database");

// routes
const authRoutes = require("./routes/auth.route");
const userRoutes = require("./routes/user.route");
const roleRoutes = require("./routes/role.route");

// models
const User = require("./models/user.model");
const Role = require("./models/role.model");
const EcAccount = require("./models/ecAccount.model");
const Quizzes = require("./models/quizzes.model");
const QuizzesHistory = require("./models/quizzesHistory.model");

database
  .authenticate()
  .then(() => {
    console.log("Database connection has been established successfully.");
  })
  .catch((err) => {
    console.error("Unable to connect to the database:", err);
  });

const app = express();
app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));
app.use(cors());
app.use("/public", express.static("public"));
app.set("view engine", "ejs");

app.use("/api/role", roleRoutes);
app.use("/api/user", userRoutes);
app.use("/api/auth", authRoutes);

app.get("/", async (req, res) => {
  res.send("<h2>Ed Commerce API</h2>");
});

const API_DOC = require("./api-docs.json");
app.get("/api-docs", async (req, res) => {
  res.render("pages/api-docs.ejs", { API_DOC });
});

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Server running at: http://localhost:${PORT}/`);
});
