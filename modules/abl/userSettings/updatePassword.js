const Ajv = require("ajv")
const ajv = new Ajv();
const userSettingsDao = require("../../dao/userSettingsDao");

const updateSchema = {
    type: "object",
    properties: {
        id: {type: "number"},
        name: {type: "string"},
        newPassword: {type: "string"},
        newPasswordRetype: {type: "string"}
    },
    required: ["id", "name", "newPassword", "newPasswordRetype"]
};

const validate = ajv.compile(updateSchema);

async function updatePasswordAbl(req, res) {
    try {
        //Pozadavek
        const updateData = {};
        updateData.id = req.user.id;
        updateData.name = req.user.name;
        updateData.newPassword = req.body.newPassword;
        updateData.newPasswordRetype = req.body.newPasswordRetype;

        //kontrola, zda jsou data v odpovidajicim formatu
        const valid = validate(updateData);
        if(!valid) {
            return res.status(400).json({error: "Invalid data", details: validate.errors});
        }
        //kontrola, zda se hesla shoduji
        if(updateData.newPassword != updateData.newPasswordRetype) {
            return res.status(400).json({error: "Passwords do not match"});
        }

        const result = await userSettingsDao.updatePassword(updateData);
            res.send(result);
            
        } catch (error) {
            console.error("Error updating the password", error);
            return res.status(500).json({error: error.message});
    }

}

module.exports = updatePasswordAbl;