const db = require("../models"); 
const { Op } = require("sequelize");
const jwt = require('jsonwebtoken');
const auth = require("../middleware/auth")
const bcrypt = require('bcrypt');
require('dotenv').config();
const fs = require("fs");

// SIGNUP pour l'enregistrement d'un profil
exports.signup = async (req, res, next) => {
  try {
    const user = await db.User.findOne({
      where: { [Op.or]: [{username: req.body.username}, {email: req.body.email}] },
    });
    if (user !== null) {
        return res.status(401).json({ message: "Ce pseudonyme ou cet email est déjà utilisé" });
    } else {
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
    const user = await db.User.findOne({
      where: {username: req.body.username},
    });
    if (user === null) {
      return res.status(401).send({ message: "Connexion impossible, merci de vérifier votre login" });
    } else {
      const hashed = await bcrypt.compare(req.body.password, user.password);
      if (!hashed) {
        return res.status(401).send({ error: "Le mot de passe est incorrect !" });
      } else {
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