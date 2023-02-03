import db from "./database.js";
import { Request } from "express";
import { User } from "@prisma/client";

declare global {
  namespace Express {
    export interface Request {
      user?: User;
    }
  }
}

class Session {
  setUser(user: User, req: Request) {
    req.user = user;
  }
}

export default Session;
