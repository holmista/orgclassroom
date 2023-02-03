import passport from "passport";
import express from "express";
import passportConfig from "../configs/passportConfig.js";
passportConfig(passport);

const router = express.Router();

router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile"] })
);

router.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  function (req, res) {
    // Successful authentication, redirect home.
    res.redirect("/");
  }
);

export default router;
