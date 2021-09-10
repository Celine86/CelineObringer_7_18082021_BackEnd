const express = require('express'); 
const router = express.Router();
const userCtrl = require("../controllers/user");
const pswdValid = require('../middleware/pswdcheck');
const mailValid = require('../middleware/mailcheck');
const auth = require('../middleware/auth');
const multer = require('../middleware/multer')

router.post("/signup", pswdValid, mailValid, userCtrl.signup);
router.post("/login", userCtrl.login);
router.get("/profils", auth.signin, userCtrl.getAllUsers);
//router.get("/profils");
router.get("/profils/:id", auth.signin, userCtrl.getOneUser);
router.put("/profils/:id", auth.signin, multer ,userCtrl.modifyAccount);
router.delete("/profils/:id", auth.signin, multer ,userCtrl.deleteAccount);

module.exports = router;