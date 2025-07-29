const { Router } = require("express");
const indexController = require("../controllers/indexController");
const router = Router();

router.get("/", indexController.index);
router.get("/sign-up", indexController.getSignUpPage);
router.post("/sign-up", indexController.signUp);
router.post("/log-in", indexController.login);
router.get("/dashboard/folders", indexController.getDashboardPage);
router.get("/dashboard/folders/:folderId", indexController.getDashboardPage);
router.post("/files", indexController.uploadFile);
router.get("/log-out", indexController.logOut);
router.post("/folders", indexController.createFolder);

module.exports = router;
