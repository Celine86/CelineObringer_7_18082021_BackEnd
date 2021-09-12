const jwt = require('jsonwebtoken');

// Fonction de vérification globale du token afin d'autoriser la connexion générale de l'utilisateur 
exports.signin = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = jwt.verify(token, process.env.TOKEN);
    const userId = decodedToken.userId;
    if (req.body.userId && req.body.userId !== userId) {
      res.status(401).json({message: '401: Utilisateur non authentifié'})
    } else {
      next();
    }
  } catch {
    res.status(401).json({
      error: new Error('Utilisateur Non Authentifié!')
    });
  }
};

// Creation d'une fonction pour extraire l'ID d'un token afin de l'isoler et de le comparer avec l'ID utilisateur 
exports.getUserID = (req) => {
  const token = req.headers.authorization.split(' ')[1];
  const decodedToken = jwt.verify(token, process.env.TOKEN);
  const userId = decodedToken.userId;
  return userId;
}