"use strict";

//load the customize.js file

// load the .env file
require("dotenv").config();

// gather the tools we need
const bodyParser = require("body-parser");
const flash = require("connect-flash");
const express = require("express");
const mongoose = require("mongoose");
const morgan = require("morgan");
const passport = require("passport");
const path = require("path");
const session = require("express-session");

// set the port
const port = process.env.PORT;

// initialize the application
let app = express();

// configure passport
require("./config/passport")(passport);

// connect to the database
mongoose.connect(process.env.MLAB, {
    useNewUrlParser: true
});

// set up the application
app.use(express.static(path.join(__dirname, "public")));
app.use(morgan("dev"));

// setup the session
app.use(session({
    secret: process.env.SECRET,
    saveUninitialized: false,
    resave: false
}));

// use body-parser for incoming requests
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

// setup passport
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

// set the views and template engine
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

// application routes
let pageRouter = require("./app/routes/page");
let userRouter = require("./app/routes/user");
let tripRouter = require("./app/routes/trip");

// application
app.use("/", pageRouter);
app.use("/", userRouter);
app.use("/", tripRouter);

// 404 error for any other page
app.use("*", (req, res) => {
    res.status(404).render("error/404", {
        title: "Page not Found!"
    });
});

// launch the application
app.listen(port, () => {
    console.log(`seniorproject is listening on port ${port}`);
});