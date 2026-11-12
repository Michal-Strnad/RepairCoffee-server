const jwt = require("jsonwebtoken");

const requireAuth = (req, res, next) => {
    const header = req.headers.authorization || "";

    if (!header.startsWith("Bearer ")) {
        return res.status(401).json({ message: "No token provided" });
    }

    const token = header.slice(7); // Remove "Bearer " prefix

    try {
        //overeni tokenu, vytahne data z tokenu a prida je do req.user, aby byly dostupne
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next(); //pokud je token validni, pokracuje na dalsi middleware nebo routu
    } catch (err) {
        return res.status(401).json({ message: "Invalid token" });
    }
};

module.exports = requireAuth;