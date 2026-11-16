const db = require("../db");
const jwt = require("jsonwebtoken");
const writeLog = require("../writeLog");

async function updatePicture(updateData) {

}

async function updateName(updateData) {
    await db.promise().execute(
        "UPDATE users SET name = ? WHERE id = ?",
        [updateData.newName, updateData.id]
    );
    writeLog(`User ${updateData.name} with ID ${updateData.id} changed the name to ${updateData.newName}.`)
    const newUserData = await genNewToken(updateData.id); //update JWT tokenu, ziskani novych udaju
    return {status: "Name changed.", newUserData};
}

async function updatePassword(updateData) {

}


function deleteAccount(updateData) {
    db.promise().execute(
        "DELETE FROM users WHERE id = ?",
        [updateData.id]
    );
    writeLog(`User ${updateData.name} with ID ${updateData.id} deleted the account.`)
    return {status: "Account deleted, you may log out."};
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