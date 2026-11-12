const db = require("../db");
const writeLog = require("../writeLog");

function updatePicture(updateData) {

}

function updateName(updateData) {

}

function updatePassword(updateData) {

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

module.exports = {
    updatePicture,
    updateName,
    updatePassword,
    deleteAccount,
    updateRole
}