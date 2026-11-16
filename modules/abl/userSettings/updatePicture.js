const multer = require('multer');
const path = require('path');
const userSettingsDao = require('../../dao/userSettingsDao')

// Nastavení úložiště pro multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../../../uploads/profile');
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const fileName = `${req.user.name}-original${ext}`;
        cb(null, fileName);
    }
});
// Limit velikosti souboru na 5 MB
const limits = {fileSize: 5 * 1024 * 1024}
//Filtr na soubory - pouze image, formaty jpeg, png, gif
const fileFitler = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.mimetype)) {
        return cb(new Error('Invalid file type. Only JPEG, PNG, and GIF are allowed.'));
    }
    cb(null, true);
}
const fileInfo = {
    storage: storage,
    limits: limits,
    fileFilter: fileFitler
}

async function updatePictureAbl(req, res) {

    const result = await userSettingsDao.updatePicture(req, res, fileInfo);
    res.send(result);
    
}

module.exports = updatePictureAbl;