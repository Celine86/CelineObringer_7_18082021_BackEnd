// Import de multer
const multer = require('multer');

// Type de fichiers autorisés
const MIME_TYPES = {
  'image/jpg': 'jpg',
  'image/jpeg': 'jpg',
  'image/png': 'png'
};

// Configuration de multer afin que les images soient envoyées dans images et le nom du fichier formaté 
const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, 'avatars');
  },
  filename: (req, file, callback) => {
    const name = file.originalname.split(' ').join('_');
    const extension = MIME_TYPES[file.mimetype];
    callback(null, name + Date.now() + '.' + extension);
  }
});

// Export du module 
module.exports = multer({storage: storage}).single('image');