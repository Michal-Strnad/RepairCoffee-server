const userSettingsDao = require("../../dao/userSettingsDao");
const db = require("../../db");

async function getUsersAbl(req, res) {

    const id = req.user.id;

    const [existingAdminUser] = await db.promise().execute(
        "SELECT id, name, role, email, picture, google_sub, user_password FROM users WHERE id = ?",
        [id]
    );
    const adminUser = existingAdminUser[0];

    if(adminUser.role != 'admin') {
        return res.status(500).json({ message: "You are not admin to perform this command" })
    }
    
    const users = await userSettingsDao.getUsers();
    res.send(users);
}

module.exports = getUsersAbl;