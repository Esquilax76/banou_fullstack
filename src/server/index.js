const env = require("env2")("./.env");
const express = require("express");
const os = require("os");
const bodyParser = require("body-parser");
var nodemailer = require("nodemailer");
var sgTransport = require("nodemailer-sendgrid-transport");
var stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
var multer = require("multer");
var path = require("path");

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static("public"));

/******************/
var mysql = require("mysql");
//Database connection
app.use(function (req, res, next) {
    res.locals.connection = mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB8PASSWORD,
        database: process.env.DB_NAME
    });
    res.locals.connection.connect();
    next();
});

/***** PRODUCTS *****/

app.get("/api/getBeers", function (req, res) {
    res.locals.connection.query("SELECT * from product WHERE isbeer = 1", function (error, results) {
        if (error) { throw error; }
        res.send(JSON.stringify(results));
    });
});

app.get("/api/getProducts", function (req, res) {
    res.locals.connection.query("SELECT * from product", function (error, results) {
        if (error) { throw error; }
        res.send(JSON.stringify(results));
    });
});

app.post("/api/patchProductActive", function (req, res) {
    res.locals.connection.query("UPDATE product SET active = ? WHERE id = ?", [req.body.active, req.body.id],  function (error, results) {
        if (error) { throw error; }
        res.send(results);
    });
});

app.get("/api/getProductById", function (req, res) {
    res.locals.connection.query("SELECT * from product WHERE id = ?", [req.query.id], function (error, results) {
        if (error) { throw error; }
        res.send(JSON.stringify(results));
    });
});

// app.get("/api/getProductByName", function (req, res) {
//     res.locals.connection.query("SELECT * from product WHERE name = ?", [req.query.name], function (error, results) {
//         if (error) { throw error; }
//         res.send(JSON.stringify(results));
//     });
// });

/***** NEWS *****/

app.get("/api/getNews", function (req, res) {
    res.locals.connection.query("SELECT * from news", function (error, results) {
        if (error) { throw error; }
        res.send(JSON.stringify(results));
    });
});

app.get("/api/getActiveNews", function (req, res) {
    res.locals.connection.query("SELECT * from news WHERE active = 1", function (error, results) {
        if (error) { throw error; }
        res.send(JSON.stringify(results));
    });
});

app.post("/api/patchNewsActive", function (req, res) {
    res.locals.connection.query("UPDATE news SET active = ? WHERE id = ?", [req.body.active, req.body.id],  function (error, results) {
        if (error) { throw error; }
        res.send(results);
    });
});

app.get("/api/getNewsById", function (req, res) {
    res.locals.connection.query("SELECT * from news WHERE id = ?", [req.query.id], function (error, results) {
        if (error) { throw error; }
        res.send(JSON.stringify(results));
    });
});

app.post("/api/postNews", function (req, res) {
    var post = { title: req.body.title, active: 1, description: req.body.description, image: req.body.image };
    res.locals.connection.query("INSERT INTO news SET ?", post, function (error, results) {
        if (error) { throw error; }
        res.send(results);
    });
});

app.post("/api/patchNews", function (req, res) {
    var post = { title: req.body.title, active: 1, description: req.body.description, image: req.body.image };
    res.locals.connection.query("UPDATE news SET ? WHERE id = ?", [post, req.body.id], function (error, results) {
        if (error) { throw error; }
        res.send(results);
    });
});

/***** PLACES *****/

app.post("/api/patchPlacesActive", function (req, res) {
    res.locals.connection.query("UPDATE find SET active = ? WHERE id = ?", [req.body.active, req.body.id],  function (error, results) {
        if (error) { throw error; }
        res.send(results);
    });
});

app.get("/api/getPlaces", function (req, res) {
    res.locals.connection.query("SELECT * from find", function (error, results) {
        if (error) { throw error; }
        res.send(JSON.stringify(results));
    });
});

app.get("/api/getPlaceById", function (req, res) {
    res.locals.connection.query("SELECT * from find WHERE id = ?", [req.query.id], function (error, results) {
        if (error) { throw error; }
        res.send(JSON.stringify(results));
    });
});

app.post("/api/postPlace", function (req, res) {
    var post = { name: req.body.name, active: 1, type: req.body.type, address: req.body.address, site: req.body.site, phone: req.body.phone, opening: req.body.opening };
    res.locals.connection.query("INSERT INTO find SET ?", post, function (error, results) {
        if (error) { throw error; }
        res.send(results);
    });
});

app.post("/api/patchPlace", function (req, res) {
    var post = { name: req.body.name, active: 1, type: req.body.type, address: req.body.address, site: req.body.site, phone: req.body.phone, opening: req.body.opening };
    res.locals.connection.query("UPDATE find SET ? WHERE id = ?", [post, req.body.id], function (error, results) {
        if (error) { throw error; }
        res.send(results);
    });
});

/***** COMMANDS *****/

app.get("/api/getCommands", function (req, res) {
    res.locals.connection.query("SELECT * from command INNER JOIN command_item ON command.id = command_item.command_id INNER JOIN product ON command_item.product_id = product.id INNER JOIN user ON command.user_id = user.id", function (error, results) {
        if (error) { throw error; }
        res.send(JSON.stringify(results));
    });
});

app.post("/api/postCommand", function (req, res) {
    var post = { address: req.body.address, date: new Date().toISOString().slice(0, 19).replace("T", " "), total_price: req.body.price, user_id: 25, status: "received", delivery: req.body.delivery };
    res.locals.connection.query("INSERT INTO command SET ?", post, function (error, results) {
        if (error) { throw error; }
        res.send(results);
    });
});

app.post("/api/postCommandItem", function (req, res) {
    var post = { quantity: req.body.quantity, size: req.body.size, package: req.body.package, price: req.body.price, command_id: req.body.command_id, product_id: req.body.product_id };
    res.locals.connection.query("INSERT INTO command_item SET ?", post, function (error, results) {
        if (error) { throw error; }
        res.send(results);
    });
});

app.post("/api/patchCommand", function (req, res) {
    res.locals.connection.query("UPDATE command SET status = ? WHERE id = ?", [req.body.status, req.body.id],  function (error, results) {
        if (error) { throw error; }
        res.send(results);
    });
});

/***** STOCK *****/

app.post("/api/patchStock", function (req, res) {
    var query = "UPDATE product SET stock_" + req.body.size + " = ? WHERE id = ?";

    res.locals.connection.query(query, [req.body.stock, req.body.id],  function (error, results) {
        if (error) { throw error; }
        res.send(results);
    });
});

app.post("/api/patchStockAfterCommand", function (req, res) {
    var query = "UPDATE product SET stock_" + req.body.size + " = stock_" + req.body.size + " - " + req.body.stock + " WHERE id = ?";

    res.locals.connection.query(query, [req.body.id],  function (error, results) {
        if (error) { throw error; }
        res.send(results);
    });
});

app.listen(8080, () => console.log("Listening on port 8080!"));

/***********************************************************/

app.post("/api/sendMail", function (req) {
    var options = {
        auth: {
            api_user: process.env.SENDGRID_API_USER,
            api_key:  process.env.SENDGRID_API_USER
        }
    };

    var client = nodemailer.createTransport(sgTransport(options));

    var email = {
        from: req.body.email,
        to:  process.env.SENDGRID_API_MAIL,
        subject: "Mail de " + req.body.name + " via le site banou",
        html: req.body.message.replace("\n", "<br/>"),
    };

    client.sendMail(email, function (err, info) {
        if (err) {
            console.log(err);
        } else {
            console.log("Message sent: " + info);
        }
    });
});

/***********************************************************/

app.post("/api/proceedPay", function (req, res) {
    const token = req.body.stripeToken;

    const charge = stripe.charges.create({
        amount: parseFloat(req.body.price) * 100,
        currency: "eur",
        description: "Payement en ligne sur le site labanou.com",
        source: token,
        statement_descriptor: "La Banou",
        receipt_email: process.env.SENDGRID_API_MAIL,
    });

    res.send(200);
});

/*************************************************************/

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        switch (req.route.path) {
            case "/api/uploadFile" :
                cb(null, "./src/client/img/shop");
                break;
            case "/api/uploadNewsFile" :
                cb(null, "./src/client/img/news");
                break;
            default :
                cb(null, "./src/client/img");
                break;
        }
    },
    filename: (req, file, cb) => {
        const newFilename = file.originalname.slice(0, file.originalname.indexOf(".")) + path.extname(file.originalname);
        cb(null, newFilename);
    },
});
const upload = multer({ storage });

app.post("/api/uploadFile", upload.single("selectedFile"), (req, res) => {
    res.send();
});

app.post("/api/uploadNewsFile", upload.single("selectedFile"), (req, res) => {
    res.send();
});
