// db.js
const mysql = require("mysql2");

// const db = mysql.createConnection({
//   host: "localhost",
//   user: "root", // change if you have different MySQL user
//   password: "", // your MySQL password
//   database: "db_lescapade"
// });

const db = mysql.createConnection(process.env.DATABASE_URL);

db.connect((err) => {
  if (err) throw err;
  console.log("✅ MySQL Connected to db_lescapade");
});

module.exports = db;
