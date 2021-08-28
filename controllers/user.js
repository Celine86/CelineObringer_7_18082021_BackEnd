// Import des models afin d'avoir le modele User et le modele Index de Sequelize
const db = require("../models"); 
// Utilisation de l'opérateur Op de sequelize 
const { Op } = require("sequelize");
// Import de bcrypt afin de chiffrer le mot de passe 
const bcrypt = require('bcrypt');
// Import de crypto-js pour chiffrer le mail
const cryptojs = require('crypto-js');
// Import de dotenv qui charge les variables de .env dans process.env 
require('dotenv').config();

// SIGNUP pour l'enregistrement d'un profil
exports.signup = async (req, res) => {
  try {
    // Vérification si le compte en train d'être créé existe déjà
    // Chiffrement du mail entré afin de le comparer aux mails en BDD
    let encryptedMail = cryptojs.HmacSHA512(req.body.email, process.env.CRYPTO).toString();
    const user = await db.User.findOne({
      // Recherche en base de la présence d'un mail ou pseudonyme structement similaire à ceux entrés 
      where: { [Op.or]: [{username: req.body.username}, {email: encryptedMail}] },
    });
    // Si la recherche retourne un résultat on indique que le psudonyme ou le mail est déjà utilisé 
    if (user !== null) {
        return res.status(400).json({ error: "Ce pseudonyme ou cet email est déjà utilisé" });
    } else {
        // Sinon le compte est créé 
        let encryptedMail = cryptojs.HmacSHA512(req.body.email, process.env.CRYPTO).toString();
        const hashed = await bcrypt.hash(req.body.password, 10)
          const newUser = await db.User.create({
          username: req.body.username,
          email: encryptedMail,
          password: hashed
        });
      res.status(201).send( 'Votre compte est créé' );
    }
  } catch (error) {
    return res.status(400).send({ error: "Le compte n'a pas pu être créé, veuillez réessayer plus tard" });
  }
};

// LOGIN pour se connecter 
exports.login = async (req, res) => {
  try {
    // Recherche de l'utilisateur via son pseudonyme 
    const user = await db.User.findOne({
      where: {username: req.body.username},
    });
    // Si aucun résultat n'est trouvé avec ce psudonyme 
    if (user === null) {
      return res.status(400).send({ error: "Connexion impossible, merci de vérifier votre login" });
    } else {
      // Sinon on compare le mot de passe entré, en le chiffrant d'abord, à celui indiqué en base, qui est chiffré
      const hashed = await bcrypt.compare(req.body.password, user.password);
      if (!hashed) {
        // Si le mot de passe ne correspond pas au login une erreur est retournée
        return res.status(401).send({ error: "Le mot de passe est incorrect !" });
      } else {
        // Sonin la connexion est OK
        res.status(200).send( "Vous êtes connecté" )
      }
    }
  } catch (error) {
    return res.status(400).send({ error: "Connexion impossible, veuillez réessayer plus tard" });
  }
};