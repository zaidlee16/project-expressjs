var mysql = require("mysql");

var connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  database: "db_market",
  password: "",
});

connection.connect(function (error) {
  if (!!error) {
    console.log(error);
  } else {
    console.log("Database Connected");
  }
});

module.exports = connection;
