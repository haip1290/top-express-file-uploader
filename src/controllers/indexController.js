const userRepo = require("../db/userRepo");
const folderRepo = require("../db/folderRepo");
const fileRepo = require("../db/fileRepo");

const asyncHandler = require("express-async-handler");

// AUTHENTICATION PACKAGES
const passport = require("../authenticator/passport");
const validator = require("../validation/validator");
const bcrypt = require("bcryptjs");

const { validationResult } = require("express-validator");
const { isAuthenticated } = require("../authenticator/authenticator");

const upload = require("../configuration/upload");

const mapFilesToDTOs = (files) =>
  files.map((file) => ({
    id: file.id,
    name: file.name,
    size: file.size,
    uploadAt: file.uploadAt,
  }));
const mapFoldersToDTO = (folders) =>
  folders.map((folder) => ({ id: folder.id, name: folder.name }));

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
    // validate sig up form
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
    // sign up user after validation
    asyncHandler(async (req, res, next) => {
      console.log("Signing up user");
      const { email, password } = req.body;
      try {
        const hashedPassword = await bcrypt.hash(password, 10);
        await userRepo.createUser({ email, hashedPassword });
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
    asyncHandler(async (req, res) => {
      console.log("rendering dashboard page");
      const folderId = parseInt(req.params.folderId);

      if (folderId) {
        // if open a folder, get folder info and all files
        console.log("Getting folder from folder id ", folderId);
        const folder = await folderRepo.getFolderByFolderId(folderId);

        res.render("dashboard", {
          folders: [{ id: folder.id, name: folder.name }],
          files: mapFilesToDTOs(folder.files),
        });
      } else {
        // if user is at root, get all folders and files at root
        const userId = req.user.id;
        console.log("Getting all folder from DB");
        const folders = await folderRepo.getAllFolderByUserId(userId);
        console.log("Get all files on root");
        const files = await fileRepo.getAllFilesWithNoFolderByUserId(userId);

        res.render("dashboard", {
          folders: mapFoldersToDTO(folders),
          files: mapFilesToDTOs(files),
        });
      }
    }),
  ],

  uploadFile: [
    isAuthenticated,
    upload.single("uploadedFile"),
    async (req, res) => {
      // Error handler
      if (!req.file) {
        const errMsg = "file upload failed or no file selected";
        console.error(errMsg);
        req.flash("error", errMsg);
        return res.redirect("/dashboard/folders");
      }
      console.log("Upload file: ", req.file);
      // create file the redirect back to dashboard page
      const successMsg = "File uploaded successfully";
      const folderId = req.body.folderId;
      const selectedFolderId = parseInt(folderId);
      const isFolderSelected = !Number.isNaN(selectedFolderId);

      // file to be created
      const fileDTO = {
        name: req.file.filename,
        size: req.file.size,
        ownerId: req.user.id,
        folderId: isFolderSelected ? selectedFolderId : null,
      };
      console.log("Create file in db");
      await fileRepo.createFile(fileDTO);

      req.flash("successMsg", successMsg);
      console.log(successMsg);

      const redirectPath = isFolderSelected
        ? `/dashboard/folders/${selectedFolderId}`
        : "/dashboard/folders";
      res.redirect(redirectPath);
    },
  ],

  createFolder: asyncHandler(async (req, res) => {
    console.log("Calling DB to create folder");
    await folderRepo.createFolder({
      name: req.body.folderName,
      ownerId: req.user.id,
    });
    const successMsg = "Created folder successfully";
    req.flash("successMsg", successMsg);
    return res.redirect("/dashboard/folders");
  }),

  updateFolder: asyncHandler(async (req, res) => {
    console.log("Calling DB to update folder");
    await folderRepo.updateFolder({
      id: parseInt(req.params.folderId),
      name: req.body.folderName,
      ownerId: req.user.id,
    });
    const successMsg = "Update folder successfully";
    req.flash("successMsg", successMsg);
    return res.redirect("/dashboard/folders");
  }),

  deleteFolder: asyncHandler(async (req, res) => {
    console.log("Calling db to delete folder");
    await folderRepo.deleteFolder({
      folderId: parseInt(req.params.folderId),
      ownerId: req.user.id,
    });
    const successMsg = "Deleted folder successfully";
    req.flash("successMsg", successMsg);
    return res.redirect("/dashboard/folders");
  }),

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
