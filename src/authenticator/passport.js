const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");
const userRepo = require("../db/userRepo");

const strategy = async (email, password, done) => {
  try {
    const user = await userRepo.getUserByEmail(email);

    if (!user) {
      return done(null, false, { message: "Incorrect email" });
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return done(null, false, { message: "Incorrect password" });
    }
    return done(null, user);
  } catch (error) {
    return done(error);
  }
};

passport.use(new LocalStrategy({ usernameField: "email" }, strategy));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await userRepo.getUserById(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

module.exports = passport;
