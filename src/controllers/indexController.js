const db = require("../db/db");
const bcrypt = require("bcryptjs");
const asyncHandler = require("express-async-handler");
const passport = require("../authenticator/passport");
const validator = require("../validation/validator");
const { validationResult } = require("express-validator");
const { isAuthenticated } = require("../authenticator/authenticator");

const indexController = {
  index: (req, res) => {
    console.log("Rendering index page");
    res.render("index", { title: "Sign In form", errors: [], formData: {} });
  },

  getSignUpPage: (req, res) => {
    console.log("Rendering sign-up page");
    res.render("sign-up", { title: "Sign Up form", formData: {}, errors: [] });
  },

  signUp: [
    ...validator.validateSignUpForm,
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.log("Error validating sign up form");
        res.render("sign-up", {
          title: "Sign Up form",
          errors: errors.array(),
          formData: { email: req.body.email },
        });
      }
      next();
    },
    asyncHandler(async (req, res, next) => {
      console.log("Signing up user");
      const { email, password } = req.body;
      try {
        const hashedPassword = await bcrypt.hash(password, 10);
        await db.createUser({ email, hashedPassword });
        console.log("sign up finished");
        res.redirect("/");
      } catch (error) {
        if (error.code === "P2002") {   
          console.log("Dupplicate error sign up attempt ");
          return res.render("sign-up", {
            title: "Sign Up form",
            errors: [{ msg: "Email already taken" }],
            formData: {},
          });
        }
        console.log("Error during signing up");
        next(error);
      }
    }),
  ],

  login: [
    ...validator.validateLoginForm,
    (req, res, next) => {
      console.log("Validating login form");
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.log("Render index page with errors ", errors.array());
        res.render("index", {
          title: "Sign In form",
          errors: errors.array(),
          formData: { email: req.body.email },
        });
      }
      next();
    },
    passport.authenticate("local", {
      successRedirect: "/dashboard",
      failureRedirect: "/",
    }),
  ],

  getDashboardPage: [
    isAuthenticated,
    (req, res) => {
      res.render("dashboard");
    },
  ],

  logOut: (req, res, next) => {
    req.logout((error) => {
      if (error) {
        return next(error);
      }
      res.redirect("/");
    });
  },
};

module.exports = indexController;
