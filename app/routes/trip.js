"use strict";

const express = require("express");
const router = new express.Router();
const tripController = require("../controllers/trip")();

router.post("/drive", tripController.createTrip);

router.get("/trip/:id", tripController.showTripDetailsPage);
router.post("/tripDetails/:id", tripController.bookTrip);

router.get("/editTrip/:id", tripController.editTrip);
router.post("/editTrip/:id", tripController.editTripPost);

router.get("/deleteReservation/:id", tripController.cancelTripReservation);
router.get("/deleteTrip/:id", tripController.deleteTrip);

module.exports = router;