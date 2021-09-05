// Import des models afin d'avoir le modele User et le modele Index de Sequelize
const db = require("../models"); 
// Utilisation de l'opérateur Op de sequelize 
const { Op } = require("sequelize");
// Import de jsonwebtoken
const jwt = require('jsonwebtoken');
// Import du middleware auth pour vérifier le token 
const auth = require("../middleware/auth")
// Import de bcrypt afin de chiffrer le mot de passe 
const bcrypt = require('bcrypt');
// Import de crypto-js pour chiffrer le mail
// const cryptojs = require('crypto-js');
// Import de dotenv qui charge les variables de .env dans process.env 
require('dotenv').config();
// Import de file-systeme pour les images 
const fs = require("fs");

// SIGNUP pour l'enregistrement d'un profil
exports.signup = async (req, res, next) => {
  try {
    // Vérification si le compte en train d'être créé existe déjà
    // Chiffrement du mail entré afin de le comparer aux mails en BDD
    //let encryptedMail = cryptojs.HmacSHA512(req.body.email, process.env.CRYPTO).toString();
    const user = await db.User.findOne({
      // Recherche en base de la présence d'un mail ou pseudonyme structement similaire à ceux entrés 
      where: { [Op.or]: [{username: req.body.username}, {email: req.body.email}] },
    });
    // Si la recherche retourne un résultat on indique que le psudonyme ou le mail est déjà utilisé 
    if (user !== null) {
        return res.status(401).json({ message: "Ce pseudonyme ou cet email est déjà utilisé" });
    } else {
        // Sinon le compte est créé 
        //let encryptedMail = cryptojs.HmacSHA512(req.body.email, process.env.CRYPTO).toString();
        const hashed = await bcrypt.hash(req.body.password, 10)
          db.User.create({
          username: req.body.username,
          email: req.body.email,
          password: hashed,
        });
      res.status(201).send({ message: 'Votre compte est créé' });
    }
  } catch (error) {
    return res.status(500).send({ message: "Erreur Serveur" });
  }
};

// LOGIN pour se connecter 
exports.login = async (req, res, next) => {
  try {
    // Recherche de l'utilisateur via son pseudonyme 
    const user = await db.User.findOne({
      where: {username: req.body.username},
    });
    // Si aucun résultat n'est trouvé avec ce psudonyme 
    if (user === null) {
      return res.status(401).send({ message: "Connexion impossible, merci de vérifier votre login" });
    } else {
      // Sinon on compare le mot de passe entré, en le chiffrant d'abord, à celui indiqué en base, qui est chiffré
      const hashed = await bcrypt.compare(req.body.password, user.password);
      if (!hashed) {
        // Si le mot de passe ne correspond pas au login une erreur est retournée
        return res.status(401).send({ error: "Le mot de passe est incorrect !" });
      } else {
        // Sinon la connexion est OK
        //res.status(200).send( "Vous êtes connecté" )
        res.status(200).json({
          message: 'Connexion OK',
          userId: user.id,
          token: jwt.sign({userId: user.id}, process.env.TOKEN, {expiresIn: '24h'})
      })
      }
    }
  } catch (error) {
    return res.status(500).send({ error: "Erreur Serveur" });
  }
};

// Retrouver UN utilisateur 
exports.getOneUser = async (req, res, next) => {
  try {
    const user = await db.User.findOne({ attributes: ["id", "username", "email", "avatar"],
    where: { id: req.params.id } });
    res.status(200).send({userInfos : user});
    //console.log(user);
  } catch (error) {
    return res.status(500).send({ error: "Erreur Serveur" });
  }
};

//Retrouver tous les utilisateurs 
exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await db.User.findAll({ attributes: ["id", "username", "email", "avatar"],
    where: { role: { [Op.ne]: 1, } }, });
    res.status(200).send(users);
  } catch (error) {
    return res.status(500).send({ error: "Erreur Serveur" });
  }
};

// Retrouver son compte afin de pouvoir le modifier si besoin 
exports.modifyAccount = async (req, res, next) => {
  try {
    const userId = auth.getUserID(req);
    const user = await db.User.findOne({ where: { id: req.params.id } });
    let newAvatar;
    if (req.params.id === userId){
      if (req.file && user.avatar) {
        newAvatar = `${req.protocol}://${req.get("host")}/images/${
          req.file.filename
        }`;
      const filename = user.avatar.split("/images")[1];
      fs.unlink(`images/${filename}`, (err) => {
        if (err) console.log(err);
        else {
          console.log(`Deleted file: images/${filename}`);
        }
      });
    } else if (req.file) {
      newAvatar = `${req.protocol}://${req.get("host")}/images/${
        req.file.filename
      }`;
    }
    if (newAvatar) {
      user.avatar = newAvatar;
    }
    const newUser = await user.save({ fields: ["avatar"] });
    res.status(200).json({
      user: newUser,
      message: "Votre avatar a bien été modifié",
    });
    } else {
      return res.status(401).send({ error: "Vous n'êtes pas autorisé à modifier ce profil" });
    }
  } catch (error) {
    return res.status(500).send({ error: "Erreur Serveur" });
  }
};

// Supprimer son compte
exports.deleteAccount = async (req, res) => {
  try {
      const userId = auth.getUserID(req);
      const isAdmin = await db.User.findOne({ where: { id: userId } }); 
      const user = await db.User.findOne({ where: { id: req.params.id } });
      if (req.params.id === userId || isAdmin.role === true){
      if (user.avatar !== null) {
        const filename = user.avatar.split("/images")[1];
        fs.unlink(`images/${filename}`, () => {
          db.User.destroy({ where: { id: req.params.id } });
          res.status(200).json({ message: "Compte supprimé" });
        });
        } else {
          db.User.destroy({ where: { id: req.params.id } });
          res.status(200).json({ message: "Compte supprimé" });
        }
    } else {
      return res.status(401).send({ error: "Vous n'êtes pas autorisé à supprimer ce compte" });
    } 
  } catch (error) {
    return res.status(500).send({ error: "Erreur serveur" });
  }
};