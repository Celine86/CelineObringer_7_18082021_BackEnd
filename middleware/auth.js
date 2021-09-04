// Import de jsonwebtoken 
const jwt = require('jsonwebtoken');

// Fonction de vérification globale du token afin d'autoriser la connexion générale de l'utilisateur 
exports.signin = (req, res, next) => {
  try {
    // Extraction du token du header authorization, fonction split pour récupérer tout après l'espace dans le header
    const token = req.headers.authorization.split(' ')[1];
    // Verify pour décoder le token 
    const decodedToken = jwt.verify(token, process.env.TOKEN);
    // Extraction de l'ID Utilisateur
    const userId = decodedToken.userId;
    // Si la demandes contient un ID comparaison de ce dernier à celui extrait du token
    if (req.body.userId && req.body.userId !== userId) {
      // Si les tokens sont différents une erreur est renvoyée
      res.status(403).json({message: '403: Accès Refusé'})
    } else {
      // Sinon l'utilisateur est connecté
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