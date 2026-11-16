const db = require("../db");
const jwt = require("jsonwebtoken");
const writeLog = require("../writeLog");
const multer = require('multer'); //pro nahravani souboru
const path = require('path'); //pro nahravani souboru
const sharp = require('sharp'); //pro nahravani souboru (konvertor)
const fs = require('fs'); //pro nahravani souboru (konvertor - pro smazani puvodniho souboru)

async function updatePicture(req, res, fileInfo) {
    //vytvoreni slozky pokud neexistuje (protoze nedavam tuto slozku na git)
    const profilePictureFolder = path.join(__dirname, '../../uploads/profile/');
    fs.mkdirSync(profilePictureFolder, {recursive: true}, (err) => {
        if (err) {
            console.error('Error creating folder:', err);
            return {status: 500, error: 'Failed to create folder.' };
        }
    });
    //zapis souboru
    const upload = multer(fileInfo).single('profilePicture');
    upload(req, res, (err) => {
            if (err) {
                return {status: 400, error: err.message};
            }
    
            if (!req.file) {
                return {status: 400, error: 'No file uploaded.'};
            }

            //konverze souboru
            const originalFilePath = `${path.join(__dirname, '../../uploads/profile/')}${req.user.name}-original${path.extname(req.file.originalname)}`;
            const converterFilePath = `${path.join(__dirname, '../../uploads/profile/')}${req.user.name}.png`;
            sharp(originalFilePath)
            .resize(96,96,{fit:'cover'})
            .toFormat('png')
            .toFile(converterFilePath, (err) => {
                if (err) {
                    return { status: 500, error: 'File conversion failed.' };
                }
                // Smazání původního souboru
                fs.unlink(originalFilePath, (unlinkErr) => {
                    if (unlinkErr) {
                        console.error('Error deleting original file:', unlinkErr);
                    }
                });
            });
        });
    //zapis do databaze
    const fileURL = `${req.protocol}://${req.get("host")}/uploads/profile/${req.user.name}.png`;
    await db.promise().execute(
        "UPDATE users SET picture = ? WHERE id = ?",
        [fileURL, req.user.id]
    );
    //log
    writeLog(`User ${req.user.name} with ID ${req.user.id} changed their picture`)
    //update JWT tokenu, ziskani novych udaju
    const newUserData = await genNewToken(req.user.id);
    return {status: 200, message: "Profile picture changed.", newUserData};
}

async function updateName(updateData) {
    await db.promise().execute(
        "UPDATE users SET name = ? WHERE id = ?",
        [updateData.newName, updateData.id]
    );
    writeLog(`User ${updateData.name} with ID ${updateData.id} changed the name to ${updateData.newName}.`)
    const newUserData = await genNewToken(updateData.id); //update JWT tokenu, ziskani novych udaju
    return {status: 200, message: "Name changed.", newUserData};
}

async function updatePassword(updateData) {

}


function deleteAccount(updateData) {
    db.promise().execute(
        "DELETE FROM users WHERE id = ?",
        [updateData.id]
    );
    writeLog(`User ${updateData.name} with ID ${updateData.id} deleted the account.`)
    return {status: 200, message: "Account deleted, you may log out."};
}

//admins
function updateRole(updateData) {

}



//obnoveni tokenu po updatu
async function genNewToken(userID) {
    const [existingUser] = await db.promise().execute(
        "SELECT id, name, role, email, user_password, picture, google_sub FROM users WHERE id = ?",
        [userID]
    );
    const user = existingUser[0];

    const token = jwt.sign(
        {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            picture: user.picture,
            google_sub: user.google_sub
        },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
    );

    const newUserData = {token, user: {
        id: user.id,
        name: user.name,
        role: user.role,
        email: user.email,
        picture: user.picture,
        google_sub: user.google_sub
        }
    }
    return newUserData;
}

module.exports = {
    updatePicture,
    updateName,
    updatePassword,
    deleteAccount,
    updateRole
}