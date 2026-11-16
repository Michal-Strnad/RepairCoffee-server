const Ajv = require("ajv")
const ajv = new Ajv();
const db = require("../../db");
const userSettingsDao = require("../../dao/userSettingsDao");

const updateSchema = {
    type: "object",
    properties: {
        id: {type: "number"},
        name: {type: "string"}
    },
    required: ["id", "name"]
}

const validate = ajv.compile(updateSchema);

function deleteAccountAbl(req, res) {
    try {
        const updateData = {};
        updateData.id = req.user.id;
        updateData.name = req.user.name;

        //kontrola, zda jsou data ve validnim formatu
        const valid = validate(updateData);
        if(!valid) {
            return res.status(400).json({error: "Invalid data", details: validate.errors});
        }

        //zavolani funkce v userSettingsDao pro vymazani v databazi a vygenerovani response
        const result = userSettingsDao.deleteAccount(updateData);
        res.send(result);

    } catch (error) {
        console.error("Error deleting account", error);
        return res.status(500).json({error: error.message});
    }
}

module.exports = deleteAccountAbl;