// Import d'express
const express = require('express');
// Import du router d'express 
const router = express.Router();
// Import des "règles" concernant la route user 
const userCtrl = require("../controllers/user");

// Signup et Login
router.post("/signup", userCtrl.signup);
router.get("/login", userCtrl.login);
// Voir un ou tous les profils 
//router.post("/profils", userCtrl.getallusers);
//router.post("/profils/:id", usersCtrl.getuser);

// Export du module 
module.exports = router;