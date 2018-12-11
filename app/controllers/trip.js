"use strict";

let tripModel = require("../../models/Trip");
let userModel = require("../../models/User");
let notificationModel = require("../../models/Notification");

let tripController = () => {

    // create trip 
    let createTrip = (req, res) => {
    if(req.user) {

        // user input validation
        if(req.body.startStop == '' || req.body.destinationStop.length == '')
        {
            req.flash("userMessage", "Please choose only places from Google Maps suggestions");
            return res.redirect('/drive');
        }
        if(req.body.retrievedStops != null)
        {
            if(!Array.isArray(req.body.retrievedStops))
            {
                if(req.body.retrievedStops.length == '')
                {
                    req.flash("userMessage", "Please choose only places from Google Maps suggestions");
                    return res.redirect('/drive');
                }
                else if(req.body.stopsDateTime == '')
                {
                    req.flash("userMessage", "Please enter stop's date of departure");
                    return res.redirect('/drive');
                }

            }   
            else if(Array.isArray(req.body.retrievedStops)) 
            {
                for(var i=0; i<req.body.retrievedStops.length; i++)
                {
                    if(req.body.retrievedStops[i].length == 0)
                    {
                        req.flash("userMessage", "Please choose only places from Google Maps suggestions");
                        return res.redirect('/drive');
                    }
                    else if(req.body.stopsDateTime[i].length == 0)
                    {
                        req.flash("userMessage", "Please enter stop's date of departure");
                        return res.redirect('/drive');
                    }
                }
            }
        }
            let trip = new tripModel();                 // initialize variable of type Trip

            // assign trip properties
            trip.title = req.body.startingPointDrive + " - " + req.body.destinationDrive;
            trip.description = req.body.description;
            trip.passengerLimit = req.body.maxPassengers;
            trip.car = req.body.carDescription;
            trip.totalPrice = 0;
            trip.driver = req.user.id;
    
            // initialize starting point of trip
            let firstStop = {
                place: req.body.startingPointDrive,     
                departureDate: req.body.dateDrive,
                order: 0,                           
                price: 0                                
            };
    
            trip.stops.push(firstStop);                     // add to the stops array
    
            // if form input with name stopsPlace is not instance of Array and the input with name stopsPrice is not null => trip has only one stop along the way
            if (!Array.isArray(req.body.stopsPlace) && req.body.stopsPrice != null) { 
    
                // initialize first stop of trip
                let stopsObj = {
                    place: req.body.stopsPlace,
                    departureDate: req.body.stopsDateTime,
                    order: 1,
                    price: req.body.stopsPrice
                };
                trip.totalPrice += parseFloat(stopsObj.price); // add stop price to total trip price
                trip.stops.push(stopsObj);                     
    
                // initialize final destination of trip
                let lastStop = {
                    place: req.body.destinationDrive,
                    departureDate: req.body.arrivalDateDrive,
                    order: 2,
                    price: req.body.destinationPrice
                };
    
                trip.totalPrice += parseFloat(lastStop.price);
                trip.stops.push(lastStop);
            }
    
            // if stopsPlace is an array => trip has more than 1 stop
            else if (Array.isArray(req.body.stopsPlace)) {
                
                // initialize each stop with form data
                for (var i = 0; i < req.body.stopsPlace.length; i++) {
                    let stopsObj = {
                        place: req.body.stopsPlace[i],
                        departureDate: req.body.stopsDateTime[i],
                        order: i + 1,
                        price: req.body.stopsPrice[i]
                    };
                    trip.totalPrice += parseFloat(stopsObj.price);
                    trip.stops.push(stopsObj);
                }
    
                let lastStop = {
                    place: req.body.destinationDrive,
                    departureDate: req.body.arrivalDateDrive,
                    order: req.body.stopsPlace.length + 1,
                    price: req.body.destinationPrice
                };
    
                trip.totalPrice += parseFloat(lastStop.price);
                trip.stops.push(lastStop);
            }
    
            // trip has no stops along the way
            else {
                let lastStop = {
                    place: req.body.destinationDrive,
                    departureDate: req.body.arrivalDateDrive,
                    order: 1,
                    price: req.body.destinationPrice
                };
    
                trip.totalPrice += parseFloat(lastStop.price);
                trip.stops.push(lastStop);
            }
    
            trip.save((err) => {                                    // save trip in database
                if (err) {
                    req.flash("userMessage", "Please fill in all form data");
                    res.redirect('back');
                } else {
                    res.redirect("/upcomingDriverTrips"); 
                }
            });
        }
    else {
        res.redirect('/login');
    }
};

// book a trip
let bookTrip = (req, res) => {
    if (req.user)
    {
        tripModel.findById(req.params.id).exec((err, trip) => {
            if (err) {
                res.status(404).render("error/404", {
                    title: "Page not found!"
                });                     
            }
            else 
            {
                let flag = false;           //  flags that trip has reached the passenger limit
                
                // each stop on passenger's subroute needs to be less than his requested number of seats
                for(var i=req.body.fromStop; i<=req.body.toStop; i++)
                {
                    if(trip.passengerLimit - trip.stops[i].passengerNumber < parseInt(req.body.seatNo))
                    { 
                        flag = true;           // one of the stops cannot acomodate passenger 
                        req.flash("limitMessage", "The number of requested seats cannot be accomodated on this trip");
                        break;                 
                    }

                    if(!flag)                  // check if passenger can be accomodated
                    {
                        // increases passenger count for each stop on subroute
                        trip.stops[i].passengerNumber += parseInt(req.body.seatNo);     
                    }
                }

                if(!flag){                              // when passenger can be accomodated  

                    let passenger = {               // initialize passenger object with form data
                        passengerID: req.user.id,
                        price: req.body.subTotalPrice,
                        startingPoint: req.body.fromStop,
                        endingPoint: req.body.toStop,
                        seats: req.body.seatNo
                    };           

                    trip.passenger.push(passenger);     // add passenger to passenger list 
                    trip.save((err) => {
                        if (err) {
                            res.status(500).render("error/500", {
                            title: "Database Connection Error!"
                        });
                        }
                    });
                    
                    // initialize new Notification instance and assign properties
                    let notification = new notificationModel();
                    notification.description = "A new passenger has registered for your trip.";
                    notification.date = new Date();
                    notification.receiver = trip.driver;
                    notification.trip = trip;
                    notification.save((err) => {    // save notification to database
                        if(err){
                            console.log(err);
                        }
                        else
                        {
                            res.redirect("/upcomingPassengerTrips"); 
                        }
                    });                                        
                }

                if(flag)                            // when passenger cannot be accomodated
                {
                    res.redirect('back');            
                }             
            }
        });
    }
    else
    {
        res.redirect('/login');
    }
};

// display edit trip form GET
let editTrip = (req,res) => {
    if(req.user)
    {
        tripModel.findById(req.params.id).populate('driver', 'id').exec((err, trip) =>{

            // only trip's driver can view edit page
            if(err || trip.driver.id != req.user.id)    
            {
                res.status(404).render("error/404", {
                    title: "Page not found!"
                });  
            }
            else 
            {
                res.render("trip/postedTripDetails", {
                title: "Edit Trip",
                user: req.user,
                trip: trip
                });

            }
        })
    }
    else{
        res.redirect('/login');
    }
};

// edit trip POST
let editTripPost = (req, res) => {
    if(req.user)
    {
        tripModel.findById(req.params.id).populate('passenger', 'passengerID').exec((err,trip) => {
            if(err)
            {
                res.status(500).render("error/500", {
                    title: "Database Connection Error!"
                }); 
            }
            else
            {
                // update trip details
                for (var i=0; i<req.body.postedStop.length; i++)
                {
                    trip.stops[i].place = req.body.postedStop[i];
                    trip.stops[i].departureDate = new Date(req.body.postedStopDate[i]);
                    trip.stops[i].price = req.body.postedStopPrice[i];
                }
                trip.car = req.body.postedCar;
                trip.description = req.body.postedDescription;    
                
                // save trip
                trip.save((err) => {
                    if (err) {
                        res.status(500).render("error/500", {
                        title: "Database Connection Error!"
                        });
                    }});

                // create a notification for each passenger of this trip
                for(var i=0; i<trip.passenger.length; i++)
                {
                    let notification = new notificationModel;
                    notification.description = "Your upcoming trip has made new changes.";
                    notification.date = new Date();
                    notification.receiver = trip.passenger[i].passengerID;
                    notification.trip = trip;

                    notification.save((err) => {
                        if(err){
                            console.log(err);
                        }
                    });
                }
                    res.redirect("/trip/" + trip.id);
            }
        });
    }   
    else
    {
        res.redirect('/login');
    }
}

// display trip details
let showTripDetailsPage = (req, res) => {

    // find trip with id passed to URL and get driver and passengers information
    tripModel.findById(req.params.id).populate("driver", "email firstName lastName").populate("passenger.passengerID").exec((err, trip) => {
        if (err) {
            res.status(500).render("error/500", {
                title: "Database Connection Error!"
            });
        } else {
            var message = req.flash("limitMessage");
            res.locals.localFrom = req.session.sessionFrom; // pass session variables to view
            res.locals.localTo = req.session.sessionTo;
            res.render("trip/tripDetails", {
                title: "Trip Details",
                user: req.user,
                trip: trip,  
                message: message               
            });
        }
    });
};

// cancel passenger trip
let cancelTripReservation = (req, res) => {
    if(req.user)
    {
        // find trip with ID passed to URL and get passenger information 
        tripModel.findById(req.params.id).populate('passenger.passengerID').exec((err, trip) => {
            if(err)
            {
                res.status(500).render("error/500", {
                title: "Database Connection Error!"
                });
            } else {
                var seatNumber = 0;      
                var from = 0;       
                var to = 0;          
                for (var i=0; i<trip.passenger.length; i++)  // loop through all the trip passengers
                {
                    if(trip.passenger.passengerID == req.user.id) // find user in the passenger list
                    {
                        seatNumber = trip.passenger[i].seats; // store passenger's number of seats
                        from = trip.passenger[i].startingPoint; // store his starting point order
                        to = trip.passenger[i].endingPoint;  // store passenger's destination order
                        break;
                    }
                }

                // delete passenger from trip's passengers list
                tripModel.findByIdAndUpdate(req.params.id, { "$pull": { "passenger": { "passengerID": req.user.id } }}, { safe: true, multi:true }, function(err, trip) {
                    if(err)
                    {
                        res.status(500).render("error/500", {
                        title: "Database Connection Error!"
                    });
                    }
                    else {

                        // loop through all the stops of the cancelling passenger's route
                        for(var i=from; i<=to; i++) 
                        {
                            // increase seat number with cancelling pssg's reserved seats
                            trip.stops[i].passengerNumber += seatNumber;
                        }
                        trip.save((err) => {
                            if(err)
                            {
                                res.status(500).render("error/500", {
                                title: "Database Connection Error!"
                                });  
                            }
                            else {

                                // create notification for driver
                                let notification = new notificationModel();
                                notification.description = "A passenger has cancelled their trip reservation.";
                                notification.trip = trip;
                                notification.receiver = trip.driver;
                                notification.date = new Date();
                                notification.save((err) => {
                                    if(err)
                                    {
                                        console.log(err);
                                    }
                                });
                                res.redirect('/upcomingPassengerTrips');
                                console.log(trip);
                                }
                            });
                    }
                    });
                }

                    
        });
    }
    else {
        res.redirect('/login');
    }   
};

// delete driver's trip
let deleteTrip = (req,res) => {
    if(req.user){
        tripModel.findById(req.params.id).populate('driver', 'id').exec((err, trip) => {
            if(err)
            {
                res.status(500).render("erro/500", {
                title: "Database Connection Error!"
                });
            }
            else
            {
                if(req.user.id == trip.driver.id)       // only driver can delete his trip
                {
                    for(var i=0; i<trip.passenger.length; i++)  // get list of all passengers
                    {
                        // create notification for each passenger of the trip
                        var notification = new notificationModel();
                        notification.description = "Your trip " + trip.title + " was cancelled.";
                        notification.date = new Date();
                        notification.trip = null;
                        notification.receiver = trip.passenger[i].passengerID;
                        notification.save((err) => {
                            if(err)
                                {
                                    console.log(err);
                                }
                        });
                    }
                    tripModel.findByIdAndRemove(req.params.id).exec((err) => {  // delete trip by Id
                        if(err)
                        {
                            res.status(500).render("error/500", {
                                title: "Database Conncetion Error!"
                            });
                        }
                        else 
                        {
                            res.redirect('/upcomingDriverTrips');
                        }
                    });   
                }            
                else
                {
                    res.status(403).render("error/403", {
                    title: "Permission denied!"
                });
                }
            }
        });
    }
    else{
        res.redirect('/login');
    }
};

    return {
        createTrip: createTrip,
        bookTrip: bookTrip,
        editTrip: editTrip,
        editTripPost: editTripPost,
        showTripDetailsPage: showTripDetailsPage,
        cancelTripReservation: cancelTripReservation,
        deleteTrip: deleteTrip
    };
}

module.exports = tripController;