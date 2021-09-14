// creation d'un module pour vérifier le mot de passe à l'aide d'une Regex 
module.exports = (req, res, next) => {
    const checkEmail = function(email) {
        let mailFormat = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/
        if(email !== '' && email.match(mailFormat)){
            next();
        }
        else{
            res.status(401).json({error: 'Merci de vérifier votre mail. Il doit être sous la forme pseudo@mail.mail. Par exemple JohnDoe@groupomania.group'});
        }
    }
    checkEmail(req.body.email)
  };