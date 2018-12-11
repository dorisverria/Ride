"use strict";

const express = require("express");
const router = new express.Router();
const pageController = require("../controllers/page")();

router.get("/", pageController.showHomePage);
router.get("/home", pageController.showHomePage);
router.get("/about", pageController.showAboutPage);

router.get("/contact", pageController.showContactPage);
router.post("/contact", pageController.postContactPage);

router.get("/ride", pageController.showRidePage);
router.post("/ride", pageController.getSearchResults);

router.get("/drive", pageController.showDrivePage);

module.exports = router;