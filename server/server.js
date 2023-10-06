const express = require("express");
const bodyParser = require("body-parser");
const passport = require("./auth/auth");
const cors = require("cors");
const mongoose = require("mongoose").default;
const port = process.env.PORT || 3001;
const app = express();
const UserModel = require("./models/User");

app.use(cors());
app.use(express.json());

mongoose
  .connect("mongodb://127.0.0.1:27017/mern-todo", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("[MongoDB] Successfully connected to database.");
  })
  .catch(console.error);

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));

db.once("open", function () {
  console.log("Connection Successful!");
});

const Task = require("./models/Task");

app.get("/tasks", async (req, res) => {
  const tasks = await Task.find();
  res.json(tasks);
});

app.post("/tasks/new", (req, res) => {
  const task = new Task({ text: req.body.text });

  task.save();
  res.json(task);
});

app.delete("/tasks/delete/:id", async (req, res) => {
  const result = await Task.findByIdAndDelete(req.params.id);
  res.json(result);
});

app.put("/tasks/update/:id", async (req, res) => {
  const task = await Task.findById(req.params.id);
  task.isDone = !task.isDone;

  task.save();
  res.json(task);
});

// Login endpoint
app.post("/api/login", passport.authenticate("local"), (req, res) => {
  res.json(req.user);
});

app.post("/api/logout", (req, res) => {
  req.logout();
  res.json({ message: "Logged out successfully" });
});

app.post("/api/register", async (req, res) => {
  const { username, password, email } = req.body;
  try {
    const existingUser = await UserModel.findOne({ username });
    const existingEmail = await UserModel.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: "Username already in use." });
    }
    if (existingEmail) {
      return res.status(400).json({ message: "Email already in use." });
    }

    const newUser = new UserModel({ username, password, email });
    await newUser.save();

    res.json({ message: "Registration successful." });
  } catch (error) {
    console.error("An error occurred during registration:", error);
    res.status(500).json({ message: "Registration failed. Please try again." });
  }
});

app.get("/api/protected", (req, res) => {
  if (req.isAuthenticated()) {
    res.json({ message: "This is a protected route" });
  } else {
    res.status(401).json({ message: "Unauthorized" });
  }
});

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());
// Initialize Passport and session support

app.listen(port, () => {
  console.log("Server is running on port ", port);
});
