var express = require("express");
var router = express.Router();
const connection = require("../config/database");

const multer = require("multer");
const fs = require("fs");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/images");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

router.get("/", (req, res) => {
  var getData = "SELECT * FROM tbl_product ORDER BY id desc";

  connection.query(getData, function (err, rows) {
    if (err) {
      req.flash("Error", err);
      res.render("", {
        category: "All Products",
        username: req.session.username,
        role: req.session.role,
        data: "",
      });
    } else {
      res.render("dashboard", {
        category: "All Products",
        username: req.session.username,
        role: req.session.role,
        data: rows,
      });
    }
  });
});

router.get("/food", (req, res) => {
  var getDataFood = 'SELECT * FROM tbl_product WHERE product_type = "food"';

  connection.query(getDataFood, function (err, rows) {
    if (err) {
      req.flash("Error", err);
      res.render("", {
        category: "Foods",
        username: req.session.username,
        role: req.session.role,
        data: "",
      });
    } else {
      res.render("dashboard", {
        category: "Foods",
        username: req.session.username,
        role: req.session.role,
        data: rows,
      });
    }
  });
});

router.get("/drink", (req, res) => {
  var getDataDrink = 'SELECT * FROM tbl_product WHERE product_type = "drink"';

  connection.query(getDataDrink, function (err, rows) {
    if (err) {
      req.flash("Error", err);
      res.render("", {
        category: "Drinks",
        username: req.session.username,
        role: req.session.role,
        data: "",
      });
    } else {
      res.render("dashboard", {
        category: "Drinks",
        username: req.session.username,
        role: req.session.role,
        data: rows,
      });
    }
  });
});

router.get("/view/:id", (req, res) => {
  connection.query(
    `SELECT * FROM tbl_product WHERE id = ${req.params.id}`,
    function (err, rows) {
      if (err) {
        res.redirect("dashboard");
      } else {
        if (rows.length > 0) {
          const sendData = {
            name: rows[0].product_name,
            price: rows[0].product_price,
            type: rows[0].product_type,
            description: rows[0].description,
            image: rows[0].product_image,
          };
          res.render("view", { data: sendData });
        } else {
          res.send("Data not found");
        }
      }
    }
  );
});

router.get("/add-product", function (req, res, next) {
  res.render("add-product", {
    action: "store",
    product_image: "",
    product_name: "",
    product_type: "",
    product_price: "",
    description: "",
  });
});

router.post(
  "/store",
  upload.single("product_image"),
  function (req, res, next) {
    // Check if a file is uploaded
    if (!req.file) {
      req.flash("error", "Please upload a file");
      return res.render("add-product", {
        product_image: "",
        product_name: "",
        product_type: "",
        product_price: "",
        description: "",
      });
    }

    // Continue with the rest of the code
    let image = req.file.originalname;
    let name = req.body.product_name;
    let type = req.body.product_type;
    let price = req.body.product_price;
    let description = req.body.description;
    let error = false;

    if (
      name.length === 0 ||
      type.length === 0 ||
      price.length === 0 ||
      description.length === 0
    ) {
      error = true;

      req.flash("error", "Please Input Correctly");
      return res.render("add-product", {
        product_image: image,
        product_name: name,
        product_type: type,
        product_price: price,
        description: description,
      });
    }

    if (!error) {
      let formData = {
        product_image: image,
        product_name: name,
        product_type: type,
        product_price: price,
        description: description,
      };

      connection.query(
        "INSERT INTO tbl_product SET ?",
        formData,
        function (err, results) {
          if (err) {
            req.flash("error", err);
            return res.render("add-product", {
              product_image: formData.product_image,
              product_name: formData.product_name,
              product_type: formData.product_type,
              product_price: formData.product_price,
              description: formData.description,
            });
          } else {
            req.flash("success", "Menu Data Added Successfully!");
            return res.redirect("/"); // Ganti dengan URL yang benar untuk dashboard
          }
        }
      );
    }
  }
);

router.get("/edit/:id", function (req, res, next) {
  connection.query(
    `SELECT * FROM tbl_product WHERE id = ${req.params.id}`,
    function (err, rows) {
      if (err) throw err;

      if (rows.length <= 0) {
        req.flash("error", `Menu with ID ${req.params.id} Not Found`);
        res.redirect("/");
      } else {
        res.render("edit", {
          id: rows[0].id,
          product_name: rows[0].product_name,
          product_type: rows[0].product_type,
          product_price: rows[0].product_price,
          description: rows[0].description,
          product_image: rows[0].product_image,
        });
      }
    }
  );
});

router.post(
  "/update/:id",
  upload.single("product_image"),
  function (req, res, next) {
    let name = req.body.product_name;
    let type = req.body.product_type;
    let price = req.body.product_price;
    let description = req.body.description;

    let error = false;

    if (
      name.length === 0 ||
      type.length === 0 ||
      price.length === 0 ||
      description.length === 0
    ) {
      error = true;

      req.flash("error", "Please Input Data");

      res.render("edit", {
        product_name: name,
        product_type: type,
        product_price: price,
        description: description,
      });
    }

    // If no error
    if (!error) {
      connection.query(
        // GET IMAGE FIRST
        `SELECT product_image FROM tbl_product WHERE id = ${req.params.id}`,
        function (err, results) {
          if (err) {
            req.flash("error", err);
            res.render("edit", {
              product_name: name,
              product_type: type,
              product_price: price,
              description: description,
            });
          } else {
            let previousImage = results[0].product_image;

            if (previousImage) {
              fs.unlinkSync(`public/images/${previousImage}`);
            }

            let formData = {
              product_name: name,
              product_type: type,
              product_price: price,
              description: description,
            };

            if (req.file) {
              formData.product_image = req.file.originalname;
            }

            // Update query (be sure to use prepared statements or query builder)
            connection.query(
              `UPDATE tbl_product SET ? WHERE id = ${req.params.id}`,
              formData,
              function (err) {
                if (err) {
                  req.flash("error", err);
                  res.render("edit", {
                    product_name: formData.product_name,
                    product_type: formData.product_type,
                    product_price: formData.product_price,
                    description: formData.description,
                    product_image: formData.product_image,
                  });
                } else {
                  req.flash("success", "Update Data Successfully");
                  res.redirect(`/`);
                }
              }
            );
          }
        }
      );
    }
  }
);

router.get("/delete/:idData", function (req, res) {
  let idData = req.params.idData;

  connection.query(
    `SELECT product_image FROM tbl_product WHERE id = ${idData}`,
    function (error, results) {
      if (error) {
        req.flash("error", error);
        res.redirect(`/`);
      } else {
        let deleteImage = results[0].product_image;
        if (deleteImage) fs.unlinkSync("public/images/" + deleteImage);

        connection.query(
          `DELETE FROM tbl_product WHERE id = ${idData}`,
          function (error, results) {
            if (error) {
              req.flash("error", error);
              res.redirect(`/`);
            } else {
              req.flash("Success", "Data already be deleted");
              res.redirect(`/`);
            }
          }
        );
      }
    }
  );
});

router.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/");
});

module.exports = router;
