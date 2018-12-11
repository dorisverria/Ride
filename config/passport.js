"use strict";

let LocalStrategy = require("passport-local").Strategy;
let userModel = require("../models/User");

let passportConfig = (passport) => {
    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser((id, done) => {
        userModel.findById(id, (err, user) => {
            done(err, user);
        });
    });

    passport.use("local-signup", new LocalStrategy({
        usernameField: "email",
        passwordField: "password",
        passReqToCallback: true
    }, (req, email, password, done) => {
        process.nextTick(() => {
            userModel.findOne({
                "email": email
            }, (err, user) => {
                if (err) {
                    return done(err);
                }

                if (user) {
                    return done(null, false, req.flash("registerMessage", "This email has already been used!"));
                } else {
                    let newUser = new userModel();
                    
                    newUser.firstName = req.body.firstName;
                    newUser.lastName = req.body.lastName;
                    newUser.birthdate = req.body.birthdate;
                    newUser.email = email;
                    if (password.length >= 8) {
                        if (password == req.body.confirmPassword)
                            newUser.password = newUser.generateHash(password);
                        else 
                            return done(null, false, req.flash("registerMessage", "Confirm password and password do not match!"));
                    } else {
                        return done(null, false, req.flash("registerMessage", "Password is too short!"));
                    }

                    newUser.save((err, user) => {
                        if (err) {
                            throw err;
                        } else {
                            return done(null, newUser);
                        }
                    });
                }
            });
        });
    }));

    passport.use("local-login", new LocalStrategy({
        usernameField: "email",
        passwordField: "password",
        passReqToCallback: true
    }, (req, email, password, done) => {
        userModel.findOne({
            "email": email
        }, (err, user) => {
            if (err) {
                return done(err);
            }

            if (!user) {
                return done(null, false, req.flash("loginMessage", "No user was found with this email!"));
            }

            if (!user.validPassword(password, user.password)) {
                return done(null, false, req.flash("loginMessage", "Password is not correct!"));
            }

            return done(null, user);
        });
    }));
};

module.exports = passportConfig;