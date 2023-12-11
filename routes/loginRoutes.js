const express = require("express");
const router = express.Router();
const connection = require("../config/database");

router.get("/login", (req, res) => {
  res.render("login", {
    error: req.session.error,
  });
  req.session.error = null;
});

router.post("/login", (req, res) => {
  const { username, password } = req.body;

  const query = "SELECT * FROM tbl_user WHERE username = ? AND password = ?";
  connection.query(query, [username, password], (err, results) => {
    if (err) throw err;

    if (results.length > 0) {
      req.session.username = username;
      req.session.role = results[0].role;
      res.redirect("/");
    } else {
      req.session.error = "Invalid Username or Password";
      res.redirect("/login");
    }
  });
});

module.exports = router;
