const db = require("../../db");
const Ajv = require("ajv")
const ajv = new Ajv();
const userSettingsDao = require("../../dao/userSettingsDao");
const writeLog = require("../../writeLog");

const updateSchema = {
    type: "object",
    properties: {
        id: {type: "number"},
        name: {type: "string"},
        userId: {type: "number"},
        userName: {type: "string"},
        role: {type: "string"}
    },
    required: ["id", "name", "userId", "userName", "role"]
};

const validate = ajv.compile(updateSchema);

async function updateRoleAbl(req, res) {
    try {
        const id = req.user.id;
        const name = req.user.name;
        const userId = req.body.userId;
        const role = req.body.role;

        const [existingAdminUser] = await db.promise().execute(
            "SELECT id, name, role, email, picture, google_sub, user_password FROM users WHERE id = ?",
            [id]
        );
        const [existingUpdatedUser] = await db.promise().execute(
            "SELECT id, name, role, email, picture, google_sub, user_password FROM users WHERE id = ?",
            [userId]
        );

        const adminUser = existingAdminUser[0];

        //zjistit, zda je uzivatel admin
        if(adminUser.role != 'admin') {
            return res.status(500).json({ message: "You are not admin to perform this command" })
        }
        //zjistit, zda je zadana spravna role
        if(role !== 'user' && role !== 'volunteer' && role !== 'admin') {
            return res.status(400).json({ message: `Role ${role} does not exist. Possible roles: admin, volunteer, user`})
        }

        //zjistit, zda updatovany uzivatel existuje
        if (existingUpdatedUser.length === 0) {
            writeLog(`${name}: Role update for ID ${userId} failed, user not found`);
            return res.status(400).json({ message: `Role update for ID ${userId} failed, user not found` });
        }

        const updatedUser = existingUpdatedUser[0];

        //sestaveni updateData
        const updateData = {
            id: id,
            name: name,
            userId: updatedUser.id,
            userName: updatedUser.name,
            role: role
        }

        //kontrola, zda jsou data ve spravnem formatu
        const valid = validate(updateData);
        if(!valid) {
            return res.status(400).json({error: "Invalid data", details: validate.errors});
        }

        //odeslani dat do userSettingsDao
        const result = await userSettingsDao.updateRole(updateData);
        res.json(result);

    } catch (error) {
        console.error("Error updating the role", error);
        return res.status(500).json({error: error.message});
    }
    


}

module.exports = updateRoleAbl;