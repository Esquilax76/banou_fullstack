const express = require("express");
const os = require("os");
const bodyParser = require("body-parser");
var nodemailer = require("nodemailer");
var sgTransport = require("nodemailer-sendgrid-transport");
var stripe = require("stripe")("sk_test_InomwOUxGWocLPppEHI4e3sH");

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static("public"));

// /******************/
var mysql = require("mysql");
//Database connection
app.use(function (req, res, next) {
    res.locals.connection = mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "",
        database: "banou"
    });
    res.locals.connection.connect();
    next();
});

// app.get("/api/getUser", function (req, res) {
//     res.locals.connection.query("SELECT * from user", function (error, results) {
//         if (error) { throw error; }
//         res.send(JSON.stringify(results));
//     });
// });

// app.get("/api/getId", function (req, res) {
//     res.locals.connection.query("SELECT * from user WHERE id = 1", function (error, results) {
//         if (error) { throw error; }
//         res.send(JSON.stringify(results));
//     });
// });

app.get("/api/getCommands", function (req, res) {
    res.locals.connection.query("SELECT * from command INNER JOIN command_item ON command.id = command_item.command_id INNER JOIN product ON command_item.product_id = product.id INNER JOIN user ON command.user_id = user.id", function (error, results) {
        if (error) { throw error; }
        res.send(JSON.stringify(results));
    });
});

// app.post("/api/postUser", function (req, res) {
//     var post = { name: req.body.username };
//     res.locals.connection.query("INSERT INTO user SET ?", post, function (error, results) {
//         if (error) { throw error; }
//         res.send(results);
//     });
// });

app.post("/api/postCommand", function (req, res) {
    var post = { address: req.body.address, date: new Date().toISOString().slice(0, 19).replace("T", " "), price: req.body.price, user_id: 25 };
    res.locals.connection.query("INSERT INTO command SET ?", post, function (error, results) {
        if (error) { throw error; }
        res.send(results);
    });
});

app.post("/api/postCommandItem", function (req, res) {
    var post = { quantity: req.body.quantity, package: req.body.package, price: req.body.price, command_id: req.body.command_id, product_id: req.body.product_id };
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

app.listen(8080, () => console.log("Listening on port 8080!"));

/***********************************************************/

app.post("/api/sendMail", function (req) {
    var options = {
        auth: {
            api_user: "Clement_Routier",
            //api_key: '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'
            api_key: "BFDlet69!"
        }
    };

    var client = nodemailer.createTransport(sgTransport(options));

    var email = {
        from: req.body.email,
        to: "routierclement@gmail.com",
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
    console.log("ok pay");
    // Token is created using Checkout or Elements!
    // Get the payment token ID submitted by the form:
    const token = req.body.stripeToken; // Using Express

    const charge = stripe.charges.create({
      amount: 100,
      currency: 'usd',
      description: 'Payement en ligne sur le site labanou.com',
      source: token,
      statement_descriptor: "La Banou",
      receipt_email: 'routierclement@gmail.com',
    });

    res.send(200);
});

