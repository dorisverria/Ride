"use strict";

let mongoose = require("mongoose");
let Schema = mongoose.Schema;

let notificationSchema = new Schema({
    description: {
        type: String
    }, 
    date: {
        type: Date
    },
    receiver: {
        type: Schema.Types.ObjectId,
        ref: "User"
    }, 
    trip: {
        type: Schema.Types.ObjectId,
        ref: "Trip"
    }
});

let Notification = mongoose.model("Notification", notificationSchema);

module.exports = Notification;