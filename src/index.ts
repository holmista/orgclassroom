import express from "express";
import dotenv from "dotenv";
dotenv.config();

const app = express();

app.get("/", (req, res) => {
  res.end("Hello World");
});

app.listen(3000, () => {
  console.log("listening on port " + process.env.PORT);
});
