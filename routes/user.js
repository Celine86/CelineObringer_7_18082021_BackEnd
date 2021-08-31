// Import d'express
const express = require('express');
// Import du router d'express 
const router = express.Router();
// Import des "règles" concernant la route user 
const userCtrl = require("../controllers/user");
// Import des règles concernant la validation du mot de passe 
const pswdValid = require('../middleware/pswdcheck');
// Import des règles concernant la validation de l'email
const mailValid = require('../middleware/mailcheck')

// Signup et Login
router.post("/signup", pswdValid, mailValid, userCtrl.signup);
router.post("/login", userCtrl.login);
// Voir un ou tous les profils 
//router.get("/profils", userCtrl.getAllUsers);
//router.get("/profils/:id", usersCtrl.getUser);

// Export du module 
module.exports = router;