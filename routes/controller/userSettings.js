const express = require("express");
const router = express.Router();

router.post("/updatePicture", require("../../modules/abl/userSettings/updatePicture"));
router.post("/updateName", require("../../modules/abl/userSettings/updateName"));
router.post("/updatePassword", require("../../modules/abl/userSettings/updatePassword"));
router.post("/deleteAccount", require("../../modules/abl/userSettings/deleteAccount"));
router.post("/updateRole", require("../../modules/abl/userSettings/updateRole")); //admins

module.exports = router;