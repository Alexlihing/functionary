const express = require("express");
const app = express();
const cors = require("cors");
const path = require("path");
const users = require("./routes/users");
const maps = require("./routes/maps");
const RAG = require("../backend/routes/pinecone");

const mongoose = require("mongoose");

//add mongoose compass connection logic
//or add other database connection logic

mongoose
  .connect("mongodb://localhost/vidly")
  .then(() => console.log("Connected to MongoDB..."))
  .catch((err) => console.error("Could not connect to MongoDB..."));

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, "public")));
app.use("/RAGservice", RAG);

//add mongoose compass connection logic

app.get("/", (req, res) => {
  res.send("hello world");
});

app.use("/api/users", users);
app.use("/api/maps", maps);

app.listen(3011, () => {
  console.log("listening on port 3011");
});
