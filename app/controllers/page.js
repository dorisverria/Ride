"use strict";

let tripModel = require("../../models/Trip");
let userModel = require("../../models/User");
let notificationModel = require("../../models/Notification");

let pageController = () => {
    
    // display home page
    let showHomePage = (req, res) => {
        res.render("home", {
            title: "Home",
            user: req.user
        });
    };
    
    // display about page
    let showAboutPage = (req, res) => {
        res.render("about", {
            title: "About",
            user: req.user
        });
    };

    // display contact page
    let showContactPage = (req, res) => {
        var message = req.flash("contactMessage");
        res.render("contact", {
            title: "Contact",
            user: req.user,
            message: message,
        });
    };

    let postContactPage = (req, res) => {
        var nodemailer = require("nodemailer");
        let transporter = nodemailer.createTransport({
            service: 'gmail', 
            secure: false, 
            port: 25, 
            auth: {
                user: 'dorisverria@gmail.com',
                pass: 'permanent1'
            },
            tls: {
                rejectUnauthorized: false
            }
        });
        let HelperOptions = {
            from: req.body.email,
            to: 'dorisverria@gmail.com',
            subject: 'Contact', 
            text: req.body.comment
        };
        transporter.sendMail(HelperOptions, (err, info) => {
            if(err){
                req.flash("contactMessage", "Your message couldn't be sent!");
                return res.redirect('/contact');
            }
            else {
                req.flash("contactMessage", "Your message was sent successfully!");
                return res.redirect('/contact');
            }
      
        });
    };

    // display ride page - search for trip page
    let showRidePage = (req, res) => {
        if(req.user)                                    // checks if user is logged in
        {
            res.render("trip/ride", {
            title: "Ride",
            user: req.user                             // passes user to view
            });
        }
        else
        {
            res.redirect('/login');                   // redirect to login if user not logged in
        }
    };

    // match requested trip against trips in database and display result page
    let getSearchResults = (req, res) => {
        tripModel.find({                 // search for trips in database that satisfy the following 
            $and: [
                {
                    stops: {                                // search in the stops array of the trip
                        $elemMatch: {
                            place: req.body.from            // place matches 'from' input field
                        }
                    }
                },
                {
                    stops: {
                        $elemMatch: {
                            place: req.body.to             // place matches 'to' input field
                        }
                    }
                }
            ]
        }).exec((err, trips) => {
            if (err) {                         // display error page if error occurs while querying database
                res.status(500).render("error/500", {
                    title: "Database Connection Error!"
                });
            } else {
                req.session.sessionFrom = req.body.from;  //store input value as session variable 
                req.session.sessionTo = req.body.to;     
                res.render("trip/tripResults", {
                    title: "Trip Results",
                    user: req.user,
                    trips: trips,                       // pass returned trips collection to view
                    from: req.body.from,               // pass form input value to view 
                    to: req.body.to,
                    date: req.body.date
                });             
            }
        });
    };

    // display drive page - post a trip page
    let showDrivePage = (req, res) => {
        
        if(req.user)
        {
            let message = req.flash("userMessage");
            
            res.render("trip/drive", {
                title: "Drive",
                user: req.user,
                message: message
            });
        }
        else
        {
            res.redirect('/login');
        }
    };

    return {
        showHomePage: showHomePage,
        showAboutPage: showAboutPage,
        showContactPage: showContactPage,
        showRidePage: showRidePage,
        getSearchResults: getSearchResults,
        showDrivePage: showDrivePage,
        postContactPage: postContactPage
    };
};

module.exports = pageController;