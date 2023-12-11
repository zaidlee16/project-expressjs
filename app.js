const express = require("express");
const path = require("path");
// const cookieParser = require("cookie-parser");
const logger = require("morgan");
const bodyParser = require("body-parser");
const session = require("express-session");
const flash = require("connect-flash");

const loginRouter = require("./routes/loginRoutes");
const dashboardRouter = require("./routes/dashboard");
const editRouter = require("./routes/dashboard");

const app = express();

app.use(flash());

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  session({ secret: "projectpas1", resave: true, saveUninitialized: true })
);
app.use(flash());

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", loginRouter);
app.use("/", dashboardRouter);
app.use("/edit", editRouter);

app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
