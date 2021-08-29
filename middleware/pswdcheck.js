// Import du model password-validator 
const pswdCheck = require('password-validator');
// création d'une constante afin de créer un nouveau modele basé sur le modèle existant
const pswdModel = new pswdCheck();

// règles concernant notre modèle 
pswdModel
.is().min(12)                                    
.is().max(48)                                  
.has().uppercase(1)                              
.has().lowercase(1)                              
.has().digits(1)
.has().symbols(1)                                     

// Export du module 
module.exports = (req, res, next) => {
    if (!pswdModel.validate(req.body.password)) {
        res.status(400).json({message:'Le mot de passe doit contenir au moins 12 caractères avec une majuscule, une minuscule, un chiffre et un caractère spécial'})
    } else {
        next();
    }
};