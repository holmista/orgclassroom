import express, { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
dotenv.config();
import cors from "cors";

import authRouter from "./routes/authRouter.js";
import subjectRouter from "./routes/subjectRouter.js";
import noteRouter from "./routes/noteRouter.js";
import fileRouter from "./routes/fileRouter.js";
import setGoogleAuthURL from "./configs/googleAuth.js";
import setGithubAuthURL from "./configs/githubAuth.js";
import { User } from "@prisma/client";
import cookieParser from "cookie-parser";
import authenticate from "./middlewares/authentication/authenticate.js";
import multer from "multer";
const upload = multer();

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

app.use(
  cors({
    origin: true,
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization", "Origin", "X-Requested-With"]
  })
);

app.use(express.json());
app.use(cookieParser());
app.use(upload.array("note-files"));

app.use("/auth", authRouter);
app.use("/subjects", authenticate, subjectRouter);
app.use("/notes", authenticate, noteRouter);
app.use("/file", authenticate, fileRouter);

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.log(err);
  return res.status(500).json({ message: "Something went wrong" });
});

if (process.env.NODE_ENV !== "test") {
  app.listen(3000, () => {
    console.log("listening on port " + process.env.PORT);
  });
}

export default app;
