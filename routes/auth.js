const router = require("express").Router();
const db = require("../modules/db");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { OAuth2Client } = require("google-auth-library");

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);




// test routy - staci ignorovat, jen pro testovani backendu ----------------------------
router.get("/test", (req, res) => {
  res.json({ message: "Test route is working" });
});

router.post("/logintest", async (req, res) => {
    const bodyData = req.body;
    console.log("Login request received:", req.body);
      res.json({ message: "Login route is working" });
  });
// --------------------------------------------------------------------------------------





//google login route
router.post("/google", async (req, res) => {
    //Vezmu si credential (dlouhy string) z requestu
    const { credential } = req.body;
    console.log("Google login request received:", req.body);

    try {
        //Overeni tokenu (credential) u Google
        const ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        //Ziskani informaci o uzivateli z payloadu tokenu po overeni
        const payload = ticket.getPayload();
        const email = payload.email;
        const name = payload.name;
        const picture = payload.picture;
        const sub = payload.sub; // Unique Google user ID
        console.log("Google login payload:", payload);

        //Odeslani response na frontend pro overeni, ze login probehl uspesne
        //res.json({ message: "Google login successful", payload });

        //Kontrola, zda uzivatel s danym Google sub existuje v databazi
        const [existingUser] = await db.promise().execute(
            "SELECT id, name, email, picture, google_sub FROM users WHERE google_sub = ?",
            [sub]
          );

        let user;

        if (existingUser.length > 0) {
            //Uzivatel existuje, vratim jeho data
            user = existingUser[0];
            console.log("Existing user found:", user);
        } else {
            //Uzivatel neexistuje, vytvorim noveho uzivatele v databazi
            const [result] = await db.promise().execute(
                "INSERT INTO users (name, email, picture, google_sub, user_password) VALUES (?, ?, ?, ?, ?)",
                [name, email, picture, sub, genPass(17)]
            );
            console.log("New user created with ID:", result.insertId);
            user = { id: result.id, name, email, picture, google_sub: sub };
        }

        //Vytvoreni JWT tokenu pro uzivatele
        const token = jwt.sign({
            id: user.id,
            name: user.name,
            email: user.email,
            picture: user.picture,
            google_sub: user.google_sub
        }, process.env.JWT_SECRET, { expiresIn: "1h" });

        //Odeslani tokenu a dat uzivatele na frontend
        res.json({ token, user: {
            id: user.id,
            name: user.name,
            email: user.email,
            picture: user.picture,
            google_sub: user.google_sub
        } });
        
    } catch (error) {
        console.error("Error verifying Google token:", error);
        return res.status(400).json({ message: "Invalid Google token" });
    }

});

//email login route
router.post("/email", async (req, res) => {
    const { email, password } = req.body;
    console.log("Email login request received:", req.body);

    try {
        //Kontrola, zda uzivatel s danym emailem existuje v databazi
        const [existingUser] = await db.promise().execute(
            "SELECT id, name, email, user_password FROM users WHERE email = ?",
            [email]
        );

        if (existingUser.length === 0) {
            console.log("User not found for email:", email);
            return res.status(400).json({ message: "User not found" });
        }

        const user = existingUser[0];

        //Kontrola hesla uzivatele
        const isMatch = await bcrypt.compare(password, user.user_password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        //Vytvoreni JWT tokenu pro uzivatele
        const token = jwt.sign({
            id: user.id,
            name: user.name,
            email: user.email
        }, process.env.JWT_SECRET, { expiresIn: "1h" });

        //Odeslani tokenu a dat uzivatele na frontend
        res.json({ token, user: {
            id: user.id,
            name: user.name,
            email: user.email
        } });

    } catch (error) {
        console.error("Error during login:", error);
        return res.status(500).json({ message: "Server error" });
    }
});


//email register route
router.post("/register", async (req, res) => {
    const { name, email, password, passwordRetype } = req.body;
    console.log("Register request received:", req.body);

    try {
        //Kontrola, zda se hesla shoduji
        if (password !== passwordRetype) {
            return res.status(400).json({ message: "Passwords do not match" });
        }

        //Kontrola, zda uzivatel s danym emailem uz existuje v databazi
        const [existingUser] = await db.promise().execute(
            "SELECT id FROM users WHERE email = ?",
            [email]
        );
        if (existingUser.length > 0) {
            return res.status(400).json({ message: "User already exists" });
        }

        //Hashovani hesla uzivatele
        const hashedPassword = await bcrypt.hash(password, 10);

        //Vytvoreni noveho uzivatele v databazi
        const [result] = await db.promise().execute(
            "INSERT INTO users (name, email, user_password) VALUES (?, ?, ?)",
            [name, email, hashedPassword]
        );

        console.log("New user created with ID:", result.insertId);

        //Vytvoreni JWT tokenu pro noveho uzivatele
        const token = jwt.sign({
            id: result.insertId,
            name,
            email
        }, process.env.JWT_SECRET, { expiresIn: "1h" });

        //Odeslani tokenu a dat uzivatele na frontend
        res.json({ token, user: {
            id: result.insertId,
            name,
            email
        } });

    } catch (error) {
        console.error("Error during registration:", error);
        return res.status(500).json({ message: "Server error" });
    }
});


//Funkce pro generovani nahodneho hesla
function genPass(len) {
    const lower = "abcdefghijklmnopqrstuvwxyz";
    const upperChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const numChars = "0123456789";
    const specialChars = "!@#$%^&*()-_=+[]{}|;:,.<>?";
    let chars = lower+upperChars+numChars+specialChars;

    let pass = "";
    for (let i = 0; i < len; i++) {
        const randIdx = Math.floor(Math.random() * chars.length);
        pass += chars[randIdx];
    }

    return pass;
}

module.exports = router;