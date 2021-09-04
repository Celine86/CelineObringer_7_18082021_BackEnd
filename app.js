// Import de dotenv qui charge les variables de .env dans process.env 
require('dotenv').config();
// Import de l'application Express
const express = require('express'); 
// Initialisation d'une constante app pour utiliser Express
const app = express();

// Import de l'index des models créés via Sequelize
const db = require("./models/index")
// Synchronisation des modeles avec la bdd 
db.sequelize.sync()
// Test de connexion à la base de données 
db.sequelize.authenticate()
  .then(() => console.log('Connexion à la base de données réussie'))
  .catch(err => console.log('Connexion impossible: ' + err))
// Import de l'objet Sequelize 
// const { sequelize } = require('./models/index');

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  next();
}); 

// Test de la réponse du serveur via le navigateur directement 
/*
app.get('/', function(req, res) {
    res.status(200).send('<h1>Test</h1>')
})
*/

// Utilisation de la fonction express.json qui va parser les requêtes entrantes
// Middleware qui va vérifier le header content type, et faire un JSON.parse si c'est bien du json
app.use(express.json());
// Utilisation de urlencoded qui est une méthode d'express permettant d'identifier les requêtes entrantes comme des chaines (strings) ou tableaux (arrays).
app.use(express.urlencoded({ extended: true }));

// Creation des routes
app.use('/api/users', require('./routes/user'));
app.use('/api/posts', require('./routes/post'));

// Export des modules pour utilisation dans d'autres fichiers 
module.exports = app;
