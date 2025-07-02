const db = require("../db/db");
const bcrypt = require("bcryptjs");
const asyncHandler = require("express-async-handler");
const passport = require("../authentication/passport");

const indexController = {
  index: (req, res) => {
    console.log("Rendering index page");
    res.render("index", { title: "Sign In form" });
  },

  getSignUpPage: (req, res) => {
    res.render("sign-up", { title: "Sign Up form" });
  },

  signUp: asyncHandler(async (req, res) => {
    console.log("Signing up user");
    const { email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    await db.createUser({ email, hashedPassword });
    console.log("sign up finished");
    res.redirect("/");
  }),

  login: passport.authenticate("local", {
    successRedirect: "/dashboard",
    failureRedirect: "/",
  }),

  getDashboardPage: (req, res) => {
    res.render("dashboard");
  },
};

module.exports = indexController;
