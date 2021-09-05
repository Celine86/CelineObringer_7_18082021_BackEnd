// Import d'express
const express = require('express');
// Import du router d'express 
const router = express.Router();
// Import des "règles" concernant la route post
const postCtrl = require("../controllers/post");
// Import des règles concernant le token 
const auth = require('../middleware/auth');
// Import de multer pour les avatars
const multer = require('../middleware/multer')

// Creer un post
router.post("/create", auth.signin, multer, postCtrl.createPost);
// Voir tous les posts
router.get("/", auth.signin, postCtrl.getAllPosts);
// Voir un post 
router.get("/:id", auth.signin, postCtrl.getOnePost);
// Supprimer un post
router.delete("/:id", auth.signin, multer, postCtrl.deletePost);
// Modifier un post
router.put("/:id", auth.signin, multer, postCtrl.modifyPost);

// Ajouter un commentaire
router.post("/:id/comment", auth.signin, postCtrl.createComment);
// Supprimer un commentaire
router.delete("/comment/:id", auth.signin, postCtrl.deleteComment);
// Modifier un commentaire
router.put("/comment/:id", auth.signin, postCtrl.modifyComment);

// Ajouter un like 
router.post("/:id/like", auth.signin, postCtrl.addLike);

// Export du module 
module.exports = router;