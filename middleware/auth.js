const jwt = require('jsonwebtoken');

// Fonction de vérification globale du token afin d'autoriser la connexion générale de l'utilisateur 
exports.signin = (req, res, next) => {
  try {
    // Récupération de la requête, des entêtes de la requête et l'en-tête autorisation de la requête
    // On sépare ensuite le Bearer de la valeur token, la case 0 est celle du bearer et la 1 celle du token
    const token = req.headers.authorization.split(' ')[1];
    // jwt.verify va vérifier que le token est bon et non expiré
    // jwt va faire une série de vérifications et si il y a un problème le code passera dans le catch
    jwt.verify(token, process.env.TOKEN);
    next();
  } catch {
    res.status(401).json({ error: 'Utilisateur Non Authentifié!' });
  }
};

// Creation d'une fonction pour extraire l'ID d'un token afin de l'isoler et de le comparer avec l'ID utilisateur 
exports.getUserID = (req) => {
  const token = req.headers.authorization.split(' ')[1];
  const decodedToken = jwt.verify(token, process.env.TOKEN);
  const userId = decodedToken.userId;
  return userId;
}