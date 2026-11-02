//pouziti parametru z .env souboru - musi byt uplne na zacatku souboru, aby se nacetly pred ostatnimi moduly
const dotenv = require('dotenv');
dotenv.config();
//ostatni moduly
const express = require("express");
const cors = require("cors");
const db = require("./modules/db");

//nacte port z .env nebo pouzij 5000 jako default
const PORT = process.env.PORT || 5000;

const app = express();

//middleware pro parsovani JSON requestu
app.use(express.json());
//middleware pro povoleni CORS
app.use(cors({
    origin: 'http://localhost:3000', //povoleni CORS pro vsechny domeny
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








app.listen(PORT,"0.0.0.0", () => {
  console.log(`Server is running on port ${PORT}`);
});