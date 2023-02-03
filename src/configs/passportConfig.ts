import passport from "passport";
import { Strategy } from "passport-google-oauth20";
import db from "../../lib/database.js";

export default function (passport: passport.PassportStatic) {
  passport.use(
    new Strategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "http://127.0.0.1:3000/auth/google/callback",
      },
      async (accessToken, refreshToken, profile, done) => {
        const user = db.user.findFirst({
          where: {
            authProvider: "google",
            authProviderId: profile.id,
          },
        });
        if (!user) {
          const newUser = db.user.create({
            data: {
              authProvider: "google",
              authProviderId: profile.id,
              name: profile.displayName,
              email: profile.emails[0].value,
            },
          });
          return done(null, newUser);
        }
        return done(null, user);
      }
    )
  );
}
