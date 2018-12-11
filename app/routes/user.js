"use strict";

const express = require("express");
const router = new express.Router();
const userController = require("../controllers/user")();

router.get("/register", userController.showRegisterForm);
router.post("/register", userController.registerProcess);

router.get("/login", userController.showLoginForm);
router.post("/login", userController.loginProcess);
router.get("/logout", userController.logOut);

router.get("/profile", userController.showUserProfile);
router.post("/profile", userController.updateUserProfile);
router.get("/userProfile/:id", userController.getUserDetails);

router.get("/pastPassengerTrips", userController.showUserPastTrips);
router.get("/upcomingPassengerTrips", userController.showUserUpcomingTrips);
router.get("/pastDriverTrips", userController.showDriverPastTrips);
router.get("/upcomingDriverTrips", userController.showDriverUpcomingTrips);

router.get("/messages", userController.showUserMessages);
router.post("/sendMessage/:id", userController.sendMessage);

router.get("/notifications", userController.showUserNotifications);

module.exports = router;