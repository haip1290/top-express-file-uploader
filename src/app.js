// give access to environment variable in .env
require("dotenv").config();

const express = require("express");
const app = express();
const session = require("express-session");
const { PrismaSessionStore } = require("@quixo3/prisma-session-store");
const { PrismaClient } = require("@prisma/client");
const passport = require("./authenticator/passport");
const flash = require("connect-flash");
const path = require("path");
const indexRouter = require("./routers/indexRouter");



//  VIEWS
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// parse body
app.use(express.urlencoded({ extended: true }));

// SESSION
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 },
    store: new PrismaSessionStore(new PrismaClient(), {
      checkPeriod: 2 * 60 * 1000, // internal to remove expired session
      dbRecordIdIsSessionId: true, // use session ID as prisma record ID
      dbRecordIdFunction: undefined,
    }),
  }),
);

app.use(passport.session());

// set up FLASH for error and success messages
app.use(flash());
app.use((req, res, next) => {
  res.locals.errors = req.flash("error");
  res.locals.successMsg = req.flash("successMsg");
  res.locals.infoMsg = req.flash("infoMsg");
  res.locals.currentUser = req.user;
  next();
});



// ROUTES
app.use("/", indexRouter);

// Global ERROR HANDLER

app.use((error, req, res, next) => {
  console.log("Global error ", error);
  res.status(500).send("Internal Server Error");
});

// SERVER

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`App is listening on port ${PORT}`);
});
