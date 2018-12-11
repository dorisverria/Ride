
$(document).on('click', '.btn-add', function (e) {
    e.preventDefault();

    var controlForm = $('.controls form:first'),
        currentEntry = $(this).parents('.entry:first'),
        newEntry = $(currentEntry.clone()).appendTo(controlForm);

    newEntry.find('input').val('');
    controlForm.find('.entry:not(:last) .btn-add')
        .removeClass('btn-add').addClass('btn-remove')
        .removeClass('btn-success').addClass('btn-danger')
        .html('<span class="glyphicon glyphicon-minus"></span>');
}).on('click', '.btn-remove', function (e) {
    $(this).parents('.entry:first').remove();

    e.preventDefault();
    return false;
});

// function to activate google maps autocomplete api 
function activatePlacesSearch() {
    var startingPointRide = document.getElementById('startingPointRide');
    var destinationRide = document.getElementById('destinationRide');
    var startingPointDrive = document.getElementById('startingPointDrive');
    var destinationDrive = document.getElementById('destinationDrive');
    var options = {
        types: ['(cities)']
    };
    var autocompleteStartRide = new google.maps.places.Autocomplete(startingPointRide);
    var autocompleteDestRide = new google.maps.places.Autocomplete(destinationRide);
    var autocompleteStartDrive = new google.maps.places.Autocomplete(startingPointDrive, options);
    var autocompleteDestDrive = new google.maps.places.Autocomplete(destinationDrive, options);

    autocompleteDestDrive.addListener('place_changed', function () {
        var place = autocompleteDestDrive.getPlace();
        var placeName = place.name;
        $("#destinationStop").val(placeName);
    });

    autocompleteStartDrive.addListener('place_changed', function () {
        var place = autocompleteStartDrive.getPlace();
        var placeName = place.name;
        $("#startStop").val(placeName);
    });
};

var startDate = document.getElementById("startDateTime");
if(startDate)
{
    startDate.addEventListener('change', function () {
        var start = $("#startStop").val();
        var destination = $("#destinationStop").val();
        var inputtedTime = $("#startDateTime");
        var estimationTime = $("#destinationDateTime");
        var stops = document.getElementsByName('stopsPlace');

        if (stops != null && start != null && destination != null && inputtedTime != null)
        {        
            var service = new google.maps.DistanceMatrixService();
            service.getDistanceMatrix({
                origins: [start],
                destinations: [destination],
                travelMode: google.maps.TravelMode.DRIVING,
                unitSystem: google.maps.UnitSystem.METRIC,
                avoidHighways: false,
                avoidTolls: false
            }, function (response, status) {
                if (status == google.maps.DistanceMatrixStatus.OK && response.rows[0].elements[0].status != "ZERO_RESULTS") {
                    var duration = response.rows[0].elements[0].duration.value;
                    var inputtedTimeDate = new Date(inputtedTime.val()).toISOString();
                    var inputtedTimeDateObj = getDate(inputtedTimeDate);
                    var estimatedDate = inputtedTimeDateObj.addSeconds(duration);
                    console.log(inputtedTimeDateObj);
                    console.log(estimatedDate);
                    estimationTime.val(estimatedDate.toDateTimeLocal());            
                } else {
                    window.alert("Unable to find a road from start to destination.");
                }
            });
        }
});
}


var room = 0;
//function to add stop fields
function addFields() {
    room++;
    var start = "";
    var destination = "";
    var objTo = document.getElementById('stops_fields');
    var divtest = document.createElement("div");
    divtest.setAttribute("class", "removeclass" + room);
    divtest.innerHTML = `<div class="form-row"><div class="col"><label class="control-label mb-2">Stop</label><input class="form control mt-2 stopsInputField" type="text" name="stopsPlace" placeholder="Next Stop" required></input></div><div class="col"><label class="control-label mb-2 mr-2 nopadding">Estimated Date and Time</label><input class="form control mt-2 ml-3" type="datetime-local" id="estimatedDateTime-${room}" name="stopsDateTime" required></input></div><div class="col"><button class="btn btn-sm btn-outline-white deleteTrip float-right mt-5 mb-0" type="button" onclick="removeFields(${room});"><icon class="fas fa-times"></button></div></div>`;

    objTo.appendChild(divtest)

    var stopsDrive = document.getElementsByName('stopsPlace');

    var options = {
        types: ['(cities)']
    };

    var objTo1 = document.getElementById('stops_fields_price');
    var divtest1 = document.createElement("div");
    divtest1.setAttribute("class", "removeclass" + room);

    var retrievedStops = document.getElementsByClassName('stopsRetr');


    for (var i = 0; i < stopsDrive.length; i++) {
        var start = "";
        var destination = "";
        var destination1 = $("#destinationStop").val();
        var inputtedTime = $("#startDateTime")
        var estimationTime;
        var destinationEstimationTime = $("#destinationDateTime");
        var stop = stopsDrive[i];
        var autocompleteStopsDrive = new google.maps.places.Autocomplete(stop, options);

        divtest1.innerHTML = `<div class="form-row"><div class="col"><label class="control-label mb-2 mr-2 nopadding">Stop</label><input class="form control mt-2 ml-3 stopsRetr" type="text" name="retrievedStops" id="input-${i}" readonly required></input></div><div class="col"><label class="control-label mb-2 mr-2 nopadding">Price</label><input class="form control mt-2 ml-3" type="number" name="stopsPrice" min="0" required></input></div></div>`;
        objTo1.appendChild(divtest1);

        autocompleteStopsDrive.addListener('place_changed', function () {
            var place = autocompleteStopsDrive.getPlace();
            var placeName = place.name;
            $("#input-" + (i - 1)).val(placeName);
            
            
            // calculate duration between stops
            if (i==1) {
                start = $("#startStop").val();
                destination = $("#input-" + (i-1)).val();
                inputtedTime = $("#startDateTime");
                estimationTime = $("#estimatedDateTime-" + i);
            }

            else 
            {
                start = $("#input-" + (i-2)).val();
                destination = $("#input-" + (i-1)).val();
                inputtedTime = $("#estimatedDateTime-" + (i-1));
                estimationTime = $("#estimatedDateTime-" + i);
            }

            console.log(start);
            console.log(destination);
            console.log(inputtedTime.val());
            console.log(i);
            console.log(estimationTime.val());

            var service = new google.maps.DistanceMatrixService();
            service.getDistanceMatrix({
                origins: [start, destination],
                destinations: [destination, destination1],
                travelMode: google.maps.TravelMode.DRIVING,
                unitSystem: google.maps.UnitSystem.METRIC,
                avoidHighways: false,
                avoidTolls: false
            }, function (response, status) {
                if (status == google.maps.DistanceMatrixStatus.OK && response.rows[0].elements[0].status != "ZERO_RESULTS") {
                    var duration = response.rows[0].elements[0].duration.value;
                    var inputtedTimeDate = new Date(inputtedTime.val()).toISOString();
                    var inputtedTimeDateObj = getDate(inputtedTimeDate);
                    var estimatedDate = inputtedTimeDateObj.addSeconds(duration);
                    console.log(inputtedTimeDateObj);
                    console.log(estimatedDate);
                    estimationTime.val(estimatedDate.toDateTimeLocal());            
                } else {
                    window.alert("Unable to find a road to this stop.");
                }
                if (status == google.maps.DistanceMatrixStatus.OK && response.rows[1].elements[1].status != "ZERO_RESULTS") {
                    var duration1 = response.rows[1].elements[1].duration.value;
                    var inputtedTimeDate1 = new Date(estimationTime.val()).toISOString();
                    var inputtedTimeDateObj1 = getDate(inputtedTimeDate1);
                    var estimatedDate1 = inputtedTimeDateObj1.addSeconds(duration1);
                    console.log(inputtedTimeDateObj);
                    console.log(estimatedDate);
                    destinationEstimationTime.val(estimatedDate1.toDateTimeLocal());
                } else {
                    window.alert("Unable to find a road between last stop and destination.");
                }
            });
                    });
            }
}

// function to remove stop fields
function removeFields(rid) {
    $('.removeclass' + rid).remove();
};

// function to convert HTML datetime-local input result to Date object
function getDate (dt) {
    var date = new Date(Date.parse(dt));
    return date;    
}

// function to add seconds to date object
Date.prototype.addSeconds = function(seconds) {
    var date =  new Date(this.valueOf());
    date.setSeconds(date.getSeconds() + seconds);
    return date;
}

// function to convert Date object to HTML datetime-local input result
Date.prototype.toDateTimeLocal = function toDateTimeLocal() {
    var date = this,
    ten = function (i) {
        return (i < 10 ? '0' : '') + i;
    },
    YYYY = date.getFullYear(),
    MM = ten(date.getMonth() + 1),
    DD = ten(date.getDate()),
    HH = ten(date.getHours()),
    II = ten(date.getMinutes()),
    SS = ten(date.getSeconds())
    ;
    return YYYY + '-' + MM + '-' + DD + 'T' + HH + ':' + II + ':' + SS;
};

var seatNo = document.getElementById("seatNo");
if(seatNo)
{
    seatNo.addEventListener('change', function () {
        var totalPrice = parseInt($("#seatNo").val()) * parseInt($("#pricePerSeat").val());
        $("#subTotalPrice").val(totalPrice.toString());
    });
}
