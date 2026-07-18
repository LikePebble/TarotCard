const express = require("express");
const cors = require("cors");
const path = require("path");
const dotenv = require("dotenv");
const cardRoutes = require("./routes/cardRoutes");
const readingRoutes = require("./routes/readingRoutes");
const userRoutes = require("./routes/userRoutes");
const journalRoutes = require("./routes/journalRoutes");
const errorHandler = require("./middlewares/errorHandler");

dotenv.config();
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use("/tarotdeck", express.static("images"));

app.use("/public", express.static("public"));

app.use("/cards", cardRoutes);
app.use("/readings", readingRoutes);
app.use("/users", userRoutes);
app.use("/journal", journalRoutes);

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "demo.html"));
});

app.get("/reading", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "reading.html"));
});

app.get("/calendar", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "calendar.html"));
});

app.use(errorHandler);

app.listen(port, () => {
  console.log(`Tarot API running at http://localhost:${port}`);
  console.log(`Demo page: http://localhost:${port}/`);
});
