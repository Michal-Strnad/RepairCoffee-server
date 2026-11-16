const Ajv = require("ajv")
const ajv = new Ajv();
const userSettingsDao = require("../../dao/userSettingsDao");

const updateSchema = {
    type: "object",
    properties: {
        id: {type: "number"},
        name: {type: "string"},
        newName: {type: "string"}
    },
    required: ["id", "name", "newName"]
}

const validate = ajv.compile(updateSchema);

async function updateNameAbl(req, res) {
    try {
        //Pozadavek
        const updateData = {};
        updateData.id = req.user.id;
        updateData.name = req.user.name;
        updateData.newName = req.body.newName
    
        //kontrola, zda jsou data pozadavku ve validnim formatu
        const valid = validate(updateData);
        if(!valid) {
            return res.status(400).json({error: "Invalid data", details: validate.errors});
        }
    
        //zavolani funkce v userSettingsDao update jmena v databazi a vygenerovani response + noveho JWT tokenu
        const result = await userSettingsDao.updateName(updateData);
        res.send(result);
    
    } catch (error) {
        console.error("Error updating the name", error);
        return res.status(500).json({error: error.message});
    }
}

module.exports = updateNameAbl;