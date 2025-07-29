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
      successRedirect: "/dashboard/folders",
      failureRedirect: "/",
    }),
  ],

  getDashboardPage: [
    isAuthenticated,
    async (req, res) => {
      console.log("rendering dashboard page");
      const folderId = parseInt(req.params.folderId);
      if (folderId) {
        console.log("Getting folder from folder id ", folderId);
        const folder = await db.getFolderByFolderId(folderId);
        console.log("Getting all files from folder ", folder.name);
        const files = await db.getAllFilesByFolderId(folderId);
        const filesDTO = files.map((file) => ({
          id: file.id,
          name: file.name,
        }));
        res.render("dashboard", {
          folders: [{ id: folder.id, name: folder.name }],
          files: filesDTO,
        });
      } else {
        console.log("Getting all folder from DB");
        const folders = await db.getAllFolderByUserId(req.user.id);
        console.log("Found folders ", folders);
        const foldersDTO = folders.map((folder) => ({
          id: folder.id,
          name: folder.name,
        }));
        console.log("Get all files on root");
        const files = await db.getAllFilesWithNoFolder();
        const filesDTO = files.map((file) => ({
          id: file.id,
          name: file.name,
        }));
        console.log("Found files on roots", files);
        res.render("dashboard", { folders: foldersDTO, files: filesDTO });
      }
    },
  ],

  uploadFile: [
    isAuthenticated,
    upload.single("uploadedFile"),
    async (req, res) => {
      console.log("User: ", req.user);
      // Error handler
      if (!req.file) {
        const errMsg = "file upload failed or no file selected";
        console.error(errMsg);
        req.flash("error", errMsg);
        return res.redirect("/dashboard/folders");
      }
      // create file the redirect back to dashboard page
      const successMsg = "File uploaded successfully";
      const selectedFolderId = parseInt(req.body.folderId);
      console.log("folderId: ", req.body.folderId);
      console.log("selected folder id ", selectedFolderId);
      if (!Number.isNaN(selectedFolderId)) {
        console.log("Create file in folder id ", selectedFolderId);
        await db.createFile({
          name: req.file.filename,
          ownerId: req.user.id,
          folderId: selectedFolderId,
        });

        req.flash("successMsg", successMsg);
        res.redirect(`/dashboard/folders/${selectedFolderId}`);
      } else {
        console.log("Create file in root folder");
        await db.createFile({
          name: req.file.filename,
          ownerId: req.user.id,
        });
        req.flash("successMsg", successMsg);
        res.redirect("/dashboard/folders");
      }
      console.log(successMsg);
    },
  ],

  createFolder: async (req, res) => {
    console.log("Calling DB to create folder");
    await db.createFolder({ name: req.body.folderName, ownerId: req.user.id });
    const successMsg = "Created folder successfully";
    req.flash("successMsg", successMsg);
    return res.redirect("/dashboard/folders");
  },

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
