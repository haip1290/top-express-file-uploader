const { Router } = require("express");
const indexController = require("../controllers/indexController");
const router = Router();

router.get("/", indexController.index);
router.get("/sign-up", indexController.getSignUpPage);
router.post("/sign-up", indexController.signUp);
router.post("/log-in", indexController.login);
router.get("/log-out", indexController.logOut);

router.get("/dashboard/folders", indexController.getDashboardPage);
router.get("/dashboard/folders/:folderId", indexController.getDashboardPage);

router.post("/files", indexController.uploadFile);

router.post("/folders", indexController.createFolder);
router.post("/folders/:folderId/update", indexController.updateFolder);
router.post("/folders/:folderId/delete", indexController.deleteFolder);

module.exports = router;
