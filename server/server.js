const express = require("express");
const mongoose = require("mongoose").default;
const app = express();
const cors = require("cors");
const port = 3001;

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

app.listen(port, () => {
  console.log("Server is running on port ", port);
});
