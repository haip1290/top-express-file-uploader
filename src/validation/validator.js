const { body } = require("express-validator");

const emailErrMsg = "must be an email";
const requireErrMsg = "is required";
const lengthErrMsg = "must be between 5 to 20 characters";

const validateSignUpForm = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage(`email ${requireErrMsg}`)
    .isEmail()
    .withMessage(emailErrMsg)
    .escape(),
  body("password")
    .trim()
    .notEmpty()
    .withMessage(`password ${requireErrMsg}`)
    .isLength({ min: 5, max: 20 })
    .withMessage(`password ${lengthErrMsg}`)
    .escape(),
  body("confirmPw")
    .trim()
    .custom((value, { req }) => {
      console.log("confirm pw", value);
      console.log("password", req.body.password);
      if (value !== req.body.password) {
        throw new Error("Confirm password do not match");
      }
      return true;
    }),
];

const validateLoginForm = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage(`email ${requireErrMsg}`)
    .isEmail()
    .withMessage(emailErrMsg)
    .escape(),
  body("password")
    .trim()
    .notEmpty()
    .withMessage(`password ${requireErrMsg}`)
    .isLength({ min: 5, max: 20 })
    .withMessage(`password ${lengthErrMsg}`)
    .escape(),
];

module.exports = { validateLoginForm, validateSignUpForm };
