// Import de jsonwebtoken 
const jwt = require('jsonwebtoken');

// Configuration du token 
module.exports = (req, res, next) => {
  try {
    // Extraction du token du header authorization, fonction split pour récupérer tout après l'espace dans le header
    const token = req.headers.authorization.split(' ')[1];
    // Verify pour décoder le token 
    const decodedToken = jwt.verify(token, process.env.TOKEN);
    // Extraction de l'ID Utilisateur
    const userId = decodedToken.userId;
    // Si la demandes contient un ID comparaison de ce dernier à celui extrait du token
    if (req.body.userId && req.body.userId !== userId) {
      // Si les tokents sont différents une erreur est renvoyée
      res.status(403).json({message: '403: Unauthorized request'})
    } else {
      // Sinon l'utilisateur est connecté
      next();
    }
  } catch {
    res.status(401).json({
      error: new Error('Invalid request!')
    });
  }
};