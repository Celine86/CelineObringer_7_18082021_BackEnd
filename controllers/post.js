// Import des models afin d'avoir le modele Post et le modele Index de Sequelize
const db = require("../models"); 
// Utilisation de l'opérateur Op de sequelize 
// const { Op } = require("sequelize");
// Import du middleware auth pour vérifier le token 
const auth = require("../middleware/auth")
// Import de file-systeme pour les images 
const fs = require("fs");
const { post } = require("../routes/post");

// CREATION d'un POST
exports.createPost = async (req, res, next) => {
    try {
        let imageUrl = "";
        const userId = auth.getUserID(req);
        const user = await db.User.findOne({ where: { id: userId } });
        if(user !== null) { 
            if (req.file) {
                imageUrl = `${req.protocol}://${req.get('host')}/images/${req.file.filename}`;
            } else {
                imageUrl = null;
            }
            const myPost = await db.Post.create({
                title: req.body.title,
                content: req.body.content,
                imageUrl: imageUrl,
                UserId: user.id,
            }); 
            res.status(200).json({ post: myPost, message: "Post ajouté" });
        }
        else {
            return res.status(403).send({ error: "Le post n'a pas pu être ajouté" });
        }
    } catch (error) {
        return res.status(500).send({ error: "Erreur Serveur" });
    }
};

// AFFICHER un POST
exports.getOnePost = async (req, res, next) => {
    try {
        const post = await db.Post.findOne({ 
            attributes: ["id", "title", "content", "imageUrl"], 
            include: [
                {model: db.User, attributes: ["username", "email", "avatar"]},
                {model: db.Like, 
                    attributes: ["UserId"],
                    include: [ {model: db.User, attributes: ["username"]}  ] 
                },
                {model: db.Comment, 
                    order: [["id", "DESC"]], 
                    attributes: ["comment"],
                    include: [ {model: db.User, attributes: ["username", "email"]} ]
                }, 
            ],
            where: { id: req.params.id } 
        });
        res.status(200).send(post);
    } catch (error) {
        return res.status(500).send({ error: "Erreur Serveur" });
    }
};

// AFFICHER TOUS les POSTS
exports.getAllPosts = async (req, res, next) => {
  try {
    const posts = await db.Post.findAll({ 
        limit: 10, order: [['id', 'DESC']], 
        attributes: ['id', 'title', 'content', 'imageUrl'],
        include: [
            {model: db.User, attributes: ["username", "email", "avatar"]},
            {model: db.Like, 
                attributes: ["UserId"],
                //include: [ {model: db.User, attributes: ["username"]}  ] 
            },
            {model: db.Comment, 
                order: [["id", "DESC"]],
                attributes: ["comment"],
                include: [ {model: db.User, attributes: ["username", "email"]}  ] 
            },
        ],
    });
    res.status(200).send(posts);
  } catch (error) {
    return res.status(500).send({ error: "Erreur Serveur" });
  }
};

// SUPPRIMER un POST
exports.deletePost = async (req, res, next) => {
    try {
        const userId = auth.getUserID(req);
        const isAdmin = await db.User.findOne({ where: { id: userId } });
        const thisPost = await db.Post.findOne({ where: { id: req.params.id } });
        if (userId === thisPost.UserId || isAdmin.role === true) {
            if (thisPost.imageUrl) {
              const filename = thisPost.imageUrl.split("/images")[1];
              fs.unlink(`images/${filename}`, () => {
                db.Post.destroy({ where: { id: thisPost.id } });
                res.status(200).json({ message: "Post supprimé" });
              });
            } else {
              db.Post.destroy({ where: { id: thisPost.id } }, { truncate: true });
              res.status(200).json({ message: "Post supprimé" });
            }
          } else {
            res.status(400).json({ message: "Vous n'êtes pas autotisé à supprimer ce post" });
          }
    } catch (error) {
        return res.status(500).send({ error: "Erreur Serveur" });
    }
};

// MODIFIER un POST
exports.modifyPost = async (req, res, next) => {
    try {
        let newImageUrl;
        const userId = auth.getUserID(req);
        const isAdmin = await db.User.findOne({ where: { id: userId } });
        const thisPost = await db.Post.findOne({ where: { id: req.params.id } });
        if (userId === thisPost.UserId || isAdmin.role === true) {
            if (req.file) {
                newImageUrl = `${req.protocol}://${req.get("host")}/images/${req.file.filename}`;
                if (thisPost.imageUrl) {
                    const filename = thisPost.imageUrl.split("/images")[1];
                    fs.unlink(`images/${filename}`, (err) => {
                    if (err) console.log(err);
                    else {
                        console.log(`Deleted file: images/${filename}`);
                        }
                    });
                }
            }
            if (req.body.title) {
                thisPost.title = req.body.title;
            }
            if (req.body.content) {
                thisPost.content = req.body.content;
            }
            thisPost.imageUrl = newImageUrl;
            const newPost = await thisPost.save({
                fields: ["title", "content", "imageUrl"],
            });
            res.status(200).json({ newPost: newPost, message: "le post a été modifié" });
          } 
          else {
            res.status(400).json({ message: "Vous n'êtes pas autorisé à modifier ce post" });
          }
    } catch (error) {
        return res.status(500).send({ error: "Erreur Serveur" });
    }
};

// CREATION d'un COMMENTAIRE
exports.createComment = async (req, res, next) => {    
    try {
        const userId = auth.getUserID(req);
        const user = await db.User.findOne({ where: { id: userId } });
        if (user !== null) { 
            const myComment = await db.Comment.create({
                comment: req.body.comment,
                UserId: user.id,
                PostId: req.params.id,
            }); 
            res.status(200).json({ post: myComment, message: "Commentaire ajouté" });
        }
        else {
            return res.status(403).send({ error: "Le commentaire n'a pas pu être ajouté" });
        }
    } catch (error) {
        return res.status(500).send({ error: "Erreur Serveur" });
    }
};

// SUPPRIMER un COMENTAIRE
exports.deleteComment = async (req, res, next) => {
    try {
        const userId = auth.getUserID(req);
        const isAdmin = await db.User.findOne({ where: { id: userId } });
        const thisComment = await db.Comment.findOne({ where: { id: req.params.id } });
        if (userId === thisComment.UserId || isAdmin.role === true) {
              db.Comment.destroy({ where: { id: thisComment.id } }, { truncate: true });
              res.status(200).json({ message: "Commentaire supprimé" });
            }
        else {
            res.status(400).json({ message: "Vous n'êtes pas autotisé à supprimer ce commentaire" });
          }
    } catch (error) {
        return res.status(500).send({ error: "Erreur Serveur" });
    }
};

// MODIFIER un COMMENTAIRE
exports.modifyComment = async (req, res, next) => {
    try {
        const userId = auth.getUserID(req);
        const isAdmin = await db.User.findOne({ where: { id: userId } });
        const thisComment = await db.Comment.findOne({ where: { id: req.params.id } });
        if (userId === thisComment.UserId || isAdmin.role === true) {
            if (req.body.comment) {
                thisComment.comment = req.body.comment;
            }
            const newComment = await thisComment.save({
                fields: ["comment"],
            });
            res.status(200).json({ newComment: newComment, message: "le commentaire a été modifié" });
          } 
          else {
            res.status(400).json({ message: "Vous n'êtes pas autorisé à modifier ce commentaire" });
          }
    } catch (error) {
        return res.status(500).send({ error: "Erreur Serveur" });
    }
};

// AIMER un POST
exports.addLike = async (req, res, next) => {
    try {
        const userId = auth.getUserID(req);
        const postId = req.params.id;
        // On cherche si l'utilisateur aime déjà le post en question
        const userLiked = await db.Like.findOne({ where: { UserId: userId, PostId: postId }, });
        if (userLiked) {
            await db.Like.destroy(
                { where: { UserId: userId, PostId: postId } },
                { truncate: true, restartIdentity: true }                
            );
            res.status(200).send({ message: "vous n'aimez plus ce post :(" });
        } else {
            await db.Like.create({
                UserId: userId,
                PostId: postId,
            });
            res.status(200).json({ message: "vous aimez ce post !" });
        }
    } catch (error) {
        return res.status(500).send({ error: "Erreur Serveur" });
    }
};
