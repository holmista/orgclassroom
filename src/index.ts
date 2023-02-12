import express, { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
dotenv.config();
import authRouter from "./routes/authRouter.js";
import subjectRouter from "./routes/subjectRouter.js";
import setGoogleAuthURL from "./configs/googleAuth.js";
import setGithubAuthURL from "./configs/githubAuth.js";
import { User } from "@prisma/client";
import cookieParser from "cookie-parser";
import authenticate from "./middlewares/authentication/authenticate.js";

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
app.use(cookieParser());

app.use("/auth", authRouter);
app.use("/subjects", authenticate, subjectRouter);

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.log(err);
  res.status(500).end("Something went wrong");
});

if (process.env.NODE_ENV !== "test") {
  app.listen(3000, () => {
    console.log("listening on port " + process.env.PORT);
  });
}

export default app;
