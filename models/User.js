"use strict";

let mongoose = require("mongoose");
let Schema = mongoose.Schema;
let bcrypt = require("bcrypt");

let userSchema = new Schema({
    firstName: {
        type: String
    },
    lastName: {
        type: String
    }, 
    birthdate: {
        type: Date
    },
    gender: {
        type: String
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    address: {
        type: String,
        default: ""
    },
    city: {
        type: String,
        default: ""
    },
    country: {
        type: String,
        default: ""
    },
    description: {
        type: String,
        default: ""
    },
    drivingLicence: {
        type: String
    },
    profilePicture: {
        type: String
    },
    role: {
        type: String,
        enum: ["driver", "user", "admin"],
        default: "user"
    },
    messages: [{
        description: {
            type: String
        },
        sender: {
            type:Schema.Types.ObjectId,
            ref: "User" 
        },
        date: {
            type: Date
        }
    }]
}, {
    timestamps: true
});

userSchema.methods.generateHash = (password) => {
    return bcrypt.hashSync(password, bcrypt.genSaltSync());
};

userSchema.methods.validPassword = (password, userPassword) => {
    return bcrypt.compareSync(password, userPassword);
};

let User = mongoose.model("User", userSchema);

module.exports = User;