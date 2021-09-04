// creation d'un module pour vérifier le mot de passe à l'aide d'une Regex 
module.exports = (req, res, next) => {
    const checkEmail = function(email) {
        let mailFormat = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/
        if(email !== '' && email.match(mailFormat)){
            next();
        }
        else{
            res.status(400).json({message: 'mail non valide'});
        }
    }
    checkEmail(req.body.email)
  };