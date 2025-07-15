const db = require("../db/db");

const asyncHandler = require("express-async-handler");

// AUTHENTICATION PACKAGES
const passport = require("../authenticator/passport");
const validator = require("../validation/validator");
const bcrypt = require("bcryptjs");

const { validationResult } = require("express-validator");
const { isAuthenticated } = require("../authenticator/authenticator");

const upload = require("../configuration/upload");

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
      console.log("rendering dashboard page");
      res.render("dashboard", { errors: [] });
    },
  ],

  uploadFile: [
    isAuthenticated,
    upload.single("uploadedFile"),
    (req, res) => {
      console.log("request file ", req.file);

      if (!req.file) {
        const errMsg = "file upload failed or no file selected";
        console.error(errMsg);
        return res.render("dashboard", { errors: [{ msg: errMsg }] });
      }
      console.log("File uploaded successfully");
      return res.render("dashboard", { errors: [] });
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
