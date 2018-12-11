"use strict";

let mongoose = require("mongoose");
let Schema = mongoose.Schema;

let tripSchema = new Schema({
    title: {
        type: String
    },
    description: {
        type: String
    },
    stops: [{
        place: {
           type: String,
        },
        departureDate: {
            type: Date,
        },        
        order: {
            type: Number
        },
        price: {
            type: Number,
        },
        passengerNumber: {
            type: Number,
            default: 0
        },
        note: {
            type: String
        }
    }],
    passengerLimit: {
        type: Number
    },
    passenger: [{
        passengerID: {
            type: Schema.Types.ObjectId,
            ref: "User"
        },
        startingPoint: {
            type: Number
        },
        endingPoint: {
            type: Number
        },
        price: {
            type: Number,
            default: 0
        }, 
        seats: {
            type: Number, 
            default: 0
        }
    }],
    totalPrice: {
        type: Number
    },
    car: {
        type: String
    },
    driver: {
        type: Schema.Types.ObjectId,
        ref: 'User'
     }
});

let Trip = mongoose.model("Trip", tripSchema);

module.exports = Trip;