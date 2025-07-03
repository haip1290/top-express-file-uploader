// give access to environment variable in .env
require("dotenv").config();

const express = require("express");
const app = express();
const session = require("express-session");
const { PrismaSessionStore } = require("@quixo3/prisma-session-store");
const { PrismaClient } = require("@prisma/client");
const passport = require("./authenticator/passport");
const path = require("path");
const indexRouter = require("./routers/indexRouter");

//  VIEWS
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// SESSION
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 30 },
    store: new PrismaSessionStore(new PrismaClient(), {
      checkPeriod: 2 * 60 * 1000, // internal to remove expired session
      dbRecordIdIsSessionId: true, // use session ID as prisma record ID
      dbRecordIdFunction: undefined,
    }),
  }),
);

app.use(passport.session());

app.use(express.urlencoded({ extended: true }));

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
