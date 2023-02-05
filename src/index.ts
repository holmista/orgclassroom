import express, { Request } from "express";
import dotenv from "dotenv";
dotenv.config();
import authRouter from "./routes/auth.js";
import setGoogleAuthURL from "./configs/googleAuth.js";
import setGithubAuthURL from "./configs/githubAuth.js";
import { User } from "@prisma/client";

declare global {
  namespace Express {
    export interface Request {
      user?: User;
    }
  }
}

const app = express();
setGoogleAuthURL();
setGithubAuthURL();

app.use(express.json());

app.get("/", (req: Request, res) => {
  res.end("Hello World");
});

app.use("/", authRouter);

app.listen(3000, () => {
  console.log("listening on port " + process.env.PORT);
});
