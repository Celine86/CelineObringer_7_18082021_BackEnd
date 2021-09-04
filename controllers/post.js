// Import des models afin d'avoir le modele Post et le modele Index de Sequelize
const db = require("../models"); 
// Utilisation de l'opérateur Op de sequelize 
// const { Op } = require("sequelize");
// Import du middleware auth pour vérifier le token 
const auth = require("../middleware/auth")
// Import de file-systeme pour les images 
const fs = require("fs");

// CREATION d'un POST
exports.createPost = async (req, res, next) => {
    let imageUrl = "";
    const userId = auth.getUserID(req);
    try{
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
}

// Afficher un post
exports.getOnePost = async (req, res, next) => {
    try {
        const post = await db.Post.findOne({ 
            attributes: ["id", "title", "content", "imageUrl"], 
            include: [
                {model: db.User, attributes: ["username", "email", "avatar"]},
                {model: db.Comment, 
                    order: [["createdAt", "DESC"]], 
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

//Retrouver tous les posts
exports.getAllPosts = async (req, res, next) => {
  try {
    const posts = await db.Post.findAll({ 
        limit: 10, order: [['id', 'DESC']], 
        attributes: ['id', 'title', 'content', 'imageUrl'],
        include: [
            {model: db.User, attributes: ["username", "email", "avatar"]},
            {model: db.Comment, 
                order: [["createdAt", "DESC"]],
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

// Créer un commentaire 
exports.createComment = async (req, res, next) => {
    const userId = auth.getUserID(req);
    try{
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
}
