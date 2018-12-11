"use strict";

let passport = require("passport");
let tripModel = require("../../models/Trip");
let userModel = require("../../models/User");
let notificationModel = require("../../models/Notification");

let userController = () => {

    // display registration form
    let showRegisterForm = (req, res) => {
        res.render("user/register", {
            title: "Register",
            message: req.flash("registerMessage")
        });
    };

    // registration logic
    let registerProcess = passport.authenticate("local-signup", { // user passport library
        successRedirect: "/home",
        failureRedirect: "/register",
        failureFlash: true
    });

    // display login form
    let showLoginForm = (req, res) => {
        res.render("user/login", {
            title: "Login",
            message: req.flash("loginMessage")
        });
    };

    // login logic
    let loginProcess = passport.authenticate("local-login", {
        successRedirect: "/home",
        failureRedirect: "/login",
        failureFlash: true
    });

    // logout process
    let logOut = (req,res) => {
        req.logout();
        res.redirect('/');
    };

    // display user profile page
    let showUserProfile = (req, res) => {
        if(req.user) 
        {
            res.render("user/profile", {
                title: "Profile",
                user: req.user
            });
        }
        else
        {   
            res.redirect('/login');
        }
        
    };

    // update user profile logic
    let updateUserProfile = (req, res) => {
        if(req.user)
        {
            userModel.findById(req.user.id).exec((err, user) => {
                if(err)
                {
                    res.status(500).render("error/500", {
                    title: "Database Connection Error!"
                    });
                }
                else 
                {
                    // update user's data
                    user.firstName = req.body.firstName;
                    user.lastName = req.body.lastName;
                    user.birthdate = req.body.birthdate;
                    user.gender = req.body.gender;
                    user.address = req.body.address;
                    user.city = req.body.city;
                    user.country = req.body.country;
                    user.description = req.body.userDescription;

                    // save to database
                    user.save((err) => {
                        if (err) {
                            res.status(500).render("error/500", {
                            title: "Database Connection Error!"
                            });
                        } else {
                            res.redirect('/profile');  
                        }
                        });          
                }
            })
        }
        else 
        {
            res.redirect('/login');
        }
    }

    // display past booked trips
    let showUserPastTrips = (req, res) => {
        if(req.user)
        {
            tripModel.find({'passenger.passengerID': req.user.id}).populate("driver", "email firstName lastName").exec((err, trips) => {
                if(err)
                {
                    res.status(500).render("error/500", {
                    title: "Database Connection Error!"
                    });
                }
                else
                {
                    res.render("user/pastBookedTrips", {
                    title: "Past Passenger Trips",
                    user: req.user,
                    trips: trips
                    });
                }
            });  
        }
        else
        {
            res.redirect('/login');
        }
    };

    // display upcoming booked trips
    let showUserUpcomingTrips = (req, res) => {
        if(req.user)
        {
            tripModel.find({'passenger.passengerID': req.user.id}).populate("driver", "email firstName lastName").exec((err, trips) => {
                if(err)
                {
                    res.status(500).render("error/500", {
                    title: "Database Connection Error!"
                    });
                }
                else
                {
                    res.render("user/upcomingBookedTrips", {
                    title: "Upcoming Passenger Trips",
                    user: req.user,
                    trips: trips
                    });
                }
            });  
        }
        else
        {
            res.redirect('/login');
        }
    };

    // display upcoming posted trips
    let showDriverUpcomingTrips = (req, res) => {
        if(req.user)
        {
            tripModel.find({driver: req.user.id}).exec((err, trips) => {
                if(err)
                {
                    res.status(500).render("error/500", {
                    title: "Database Connection Error!"
                    });
                }
                else 
                {
                    res.render("user/upcomingPostedTrips", {
                    title: "Upcoming Driver Trips",
                    user: req.user,
                    trips: trips,
                    });
                }
            });
        }
        else
        {
            res.redirect('/login');
        }
    };

    // show user's past posted trips
    let showDriverPastTrips = (req, res) => {
        if(req.user) 
        {
            tripModel.find({driver: req.user.id}).exec((err, trips) => {
                if(err)
                {
                    res.status(500).render("error/500", {
                    title: "Database Connection Error!"
                    });
                }
                else if (!trips) {
                    res.status(404).render("error/404", {
                        title: "Trip not found!"
                    });
                }
                else 
                {
                    res.render("user/pastPostedTrips", {
                        title: "Past Driver Trips",
                        user: req.user,
                        trips: trips
                    });
                }
            });
        }
        else 
        {
            res.redirect('/login');
        }
    };

    // display user's notifications page
    let showUserNotifications = (req, res) => {
        if(req.user)
        {
            notificationModel.find({receiver: req.user.id}).populate('trip', 'id').exec((err, notifications) => {
                if(err)
                {
                    res.status(500).render("error/500", {
                    title: "Database Connection Error!"
                    });
                }
                else
                {
                    res.render("user/notifications", {
                    title: "User Notifications",
                    user: req.user,
                    notifications: notifications
                    });
                }
            })
        }
        else
        {
            res.redirect('/login');
        }        
    };

    // display user's details page
    let getUserDetails = (req, res) => {
        if(req.user)
        {
            userModel.findById(req.params.id).exec((err, user) =>{
                if(err)
                {
                    res.status(500).render("error/500", {
                    title: "Database Connection Error!"
                    });
                }
                else
                {
                    res.render("user/userDetails", {
                    title: "User Profile",
                    user: user,
                    loggedUser: req.user
                    });
                }
            });
            
        }
        else 
        {
            res.redirect('/login');
        }
    };

    // display user's messages page
    let showUserMessages = (req, res) => {
        if(req.user)
        {
            userModel.findById(req.user.id).populate('messages.sender').exec((err, user) =>
            {
                if(err)
                {
                    res.status(500).render("error/500", {
                        title: "Database Connection Error!"
                    });
                }
                else
                {
                    res.render("user/messages", {
                    title: "User Messages",
                    user: user
                    });
                }
            });
        }
        else
        {
            res.redirect('/login');
        }
    };
    
    // send a message to a user
    let sendMessage = (req, res) => {
        if(req.user)
        {
            userModel.findById(req.params.id).exec((err, user) => {
                if(err)
                {
                    res.status(500).render("error/500", { 
                    title: "Database Connection Error!"
                });
                }
                else
                {
                    // initialize message with form data
                    let message = {
                        description: req.body.messageDescription,
                        sender: req.user,
                        date: new Date(),
                    };

                    // push message into receiver user's messages list
                    user.messages.push(message);
                    user.save((err) => {
                        if(err)
                        {
                            res.status(500).render("error/500", {
                            title: "Database Connection Error"
                        });
                        }
                        else{
                            res.redirect('back');
                        }
                    });
                }
            });    
        }
        else
        {
            res.redirect('/login');
        }
    };

    return {
        showRegisterForm: showRegisterForm,
        registerProcess: registerProcess,
        showLoginForm: showLoginForm,
        loginProcess: loginProcess,
        logOut: logOut,
        showUserProfile: showUserProfile,
        updateUserProfile: updateUserProfile,
        showUserPastTrips: showUserPastTrips,
        showUserUpcomingTrips: showUserUpcomingTrips,
        showDriverUpcomingTrips: showDriverUpcomingTrips,
        showDriverPastTrips: showDriverPastTrips,
        showUserMessages: showUserMessages,
        showUserNotifications: showUserNotifications,
        getUserDetails: getUserDetails,
        sendMessage: sendMessage
    };
};

module.exports = userController;