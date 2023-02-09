import express, { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
dotenv.config();
import authRouter from "./routes/auth.js";
import setGoogleAuthURL from "./configs/googleAuth.js";
import setGithubAuthURL from "./configs/githubAuth.js";
import { User } from "@prisma/client";
import cookieParser from "cookie-parser";

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
console.log(process.env.GOOGLE_LOGIN_URL);
console.log(process.env.GITHUB_LOGIN_URL);

app.use(express.json());
app.use(cookieParser());

app.use("/", authRouter);

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.log(err);
  res.status(500).end("Something went wrong");
});

app.listen(3000, () => {
  console.log("listening on port " + process.env.PORT);
});

export default app;
