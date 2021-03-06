require('dotenv').config();
const express = require('express'); 
const helmet = require('helmet');
const app = express();
const path = require("path");

const db = require("./models/index")
db.sequelize.sync().then(function () {
  require("./conf/firstadmin");
})

/*
const db = require("./models/index")
// Test de connexion à la base de données 
db.sequelize.authenticate()
  .then(() => console.log('Connexion à la base de données réussie'))
  .catch(err => console.log('Connexion impossible: ' + err))
*/

app.use(helmet());

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  next();
}); 

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/images", express.static(path.join(__dirname, "images")));
app.use("/imagesdefault", express.static(path.join(__dirname, "imagesdefault")));
app.use('/api/users', require('./routes/user'));
app.use('/api/posts', require('./routes/post'));

module.exports = app;
