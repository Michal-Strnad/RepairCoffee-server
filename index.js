//pouziti parametru z .env souboru - musi byt uplne na zacatku souboru, aby se nacetly pred ostatnimi moduly
const dotenv = require('dotenv');
dotenv.config();
//ostatni moduly
const express = require("express");
const cors = require("cors");
//moje moduly
const db = require("./modules/db");
const requireAuth = require("./modules/requireAuth");

//nacte port z .env nebo pouzij 5000 jako default
const PORT = process.env.PORT || 5000;

const app = express();

//middleware pro parsovani JSON requestu
app.use(express.json());
//middleware pro povoleni CORS
app.use(cors({
    origin: process.env.REACT_URL || 'http://localhost:3000', //Povoleni pristupu z reactu (zablokovane jsou vsechny ostatni pristupy, takze node je plne oddelen od zbytku site)
    credentials: true //povoleni zasilani cookies
}));




//test webpage
app.get("/", (req, res) => {
  res.send("Hello World!");
});

//pripojeni k databazi
db.getConnection((err, connection) => {
    if (err) {
      console.error("Error connecting to the database:", err);
      return;
    }
    console.log("Connected to the database!");
    //connection.release();
});

//routes
app.use("/auth", require("./routes/auth"));
app.use("/userSettings", requireAuth, require("./routes/controller/userSettings"));



//testovaci routa pro ziskani dat z databaze podle JWT tokenu ---------------------
app.get("/profile", requireAuth, async (req, res) => {
  const currentname = req.user.name; 

  const [testData] = await db.promise().execute(
    "SELECT id, name, role, created_at FROM users WHERE name = ?",
    [currentname]
  );

  res.json({ testData1: "Zkouska nacteni dat z databaze pode uzivatele", testData2: testData });
});
// ---------------------------------------------------------------------------------------------



app.listen(PORT,"0.0.0.0", () => {
  console.log(`Server is running on port ${PORT}`);
});