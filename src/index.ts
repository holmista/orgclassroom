import express, { Request } from "express";
import dotenv from "dotenv";
dotenv.config();
import { User } from "@prisma/client";

declare global {
  namespace Express {
    export interface Request {
      user?: User;
    }
  }
}

const app = express();

app.get("/", (req: Request, res) => {
  res.end("Hello World");
  req.user;
});

app.listen(3000, () => {
  console.log("listening on port " + process.env.PORT);
});
