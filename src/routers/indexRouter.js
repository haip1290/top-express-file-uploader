const { Router } = require("express");
const indexController = require("../controllers/indexController");
const router = Router();

router.get("/", indexController.index);
router.get("/sign-up", indexController.getSignUpPage);
router.post("/sign-up", indexController.signUp);
router.post("/log-in", indexController.login);
router.get("/dashboard", indexController.getDashboardPage);
router.post("/upload-file", indexController.uploadFile);
router.get("/log-out", indexController.logOut);

module.exports = router;
