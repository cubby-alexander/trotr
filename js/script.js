

/* Pseudocode
    Determine visiting social fence


 */


/*----- constants -----*/

let map;
let geocoder;
let socialFence;
let dummy = {
    lat: 40.745769083889726,
    lng: -73.99396703570228
};
let dummyStartDate = new Date ("2021/05/24");
let dummyEndDate = new Date ("2021/05/28");
console.log(dummyStartDate);
let latLng;
let trip = {
    start: '',
    end: '',
}


/*----- app's state (variables) -----*/
const db = [
    {
        name: "Tyrion Lannister",
        image: "./images/Tyrion.png",
        domestic: {
            lat: 40.745769083889726,
            lng: -73.99396703570228,
            fenceRadius: 25,
            name: "New York"
        },
        travel: [
            [{
                lat: 41.839428410718945,
                lng: -71.40129919567369,
                fenceRadius: 25,
                name: "New Orleans",
                start: new Date ('2021/05/10'),
                end: new Date ('2021/05/18')
            }],
        ],
    },

    {
        name: "Jaime Lannister",
        image: "./images/Jaime.png",
        domestic: {
            lat: 40.745769083889726,
            lng: -73.99396703570228,
            fenceRadius: 25,
            name: "New York"
        },
        travel: [
            [{
                lat: 41.839428410718945,
                lng: -71.40129919567369,
                fenceRadius: 25,
                name: "New Orleans",
                start: new Date ('2021/05/10'),
                end: new Date ('2021/05/18')
            }],
        ],
    },

    {
        name: "Cersei Lannister",
        image: "./images/Cersei.png",
        domestic: {
            lat: 40.745769083889726,
            lng: -73.99396703570228,
            fenceRadius: 25,
            name: "New York"
        },
        travel: [],
    },

    {
        name: "Tywin Lannister",
        image: "./images/Tywin.png",
        domestic: {
            lat: 40.745769083889726,
            lng: -73.99396703570228,
            fenceRadius: 25,
            name: "New York"
        },
        travel: [],
    },

    {
        name: "Margaery Tyrell",
        image: "./images/Margaery.png",
        domestic: {
            lat: 40.72903529770815,
            lng: -73.79783768863047,
            fenceRadius: 25,
            name: "New York"
        },
        travel: [],
    },

    {
        name: "Robb Stark",
        image: "./images/Robb.png",
        domestic: {
            lat: 42.359823015948244,
            lng: -71.05882272953184,
            fenceRadius: 25,
            name: "Boston"
        },
        travel: [
            [{
                lat: 41.839428410718945,
                lng: -71.40129919567369,
                fenceRadius: 25,
                name: "New Orleans",
                start: new Date ('2021/05/10'),
                end: new Date ('2021/05/18')
            }],
        ],
    },

    {
        name: "Sansa Stark",
        image: "./images/Sansa.png",
        domestic: {
            lat: 38.906669028824204,
            lng: -77.04037026933584,
            fenceRadius: 25,
            name: "Washington, DC"
        },
        travel: [
            [{
                lat: 41.839428410718945,
                lng: -71.40129919567369,
                fenceRadius: 13,
                name: "Brooklyn, NY",
                start: new Date ('2021/05/10'),
                end: new Date ('2021/05/18')
            }],
        ],
    }
];
let presentContacts = [];

/*----- cached element references -----*/
let $main = $('main');
let $address = $('#address');
let $fenceSubmit = $('#fence-submit');
let $tripStart = $('#start');
let $tripEnd = $('#end')


/*----- event listeners -----*/

$fenceSubmit.on('click', () => {
    codeAddress($address.val());
});

$tripStart.on('change', () => {
    trip.start = new Date (event.target.value.replace('-', '/'));
    console.log(trip.start);
});

$tripEnd.on('change', () => {
    trip.end = new Date (event.target.value.replace('-', '/'));
    console.log(trip.end);
})

$('h1').on('click', () => {
    db.forEach(contact => {
        let checkpoint = {
            lat: contact.domestic.lat,
            lng: contact.domestic.lng
        };
        let centerpoint = {
            lat: socialFence.center.lat(),
            lng: socialFence.center.lng()
        };
        let distanceInKilo = socialFence.radius / 1000;
        if (arePointsNear(checkpoint, centerpoint, distanceInKilo)) {
            contact.travel.forEach(residentTrip => {
                console.log(contact)
                if (visitorAndResidentCompare({start: trip.start, end: trip.end},
                     {start: residentTrip[0].start, end: residentTrip[residentTrip.length - 1].end})) {
                    console.log("No trip conflict, visitor and resident will be present for" +
                        "duration of visitor trip.",);
                    presentContacts.push({name: contact.name, image: contact.image, location: contact.domestic.name, duration: "Present For Duration"})
                } else {
                    return visitorAndResidentOverlap(
                        {start: trip.start, end: trip.end},
                        {start: residentTrip[0].start, end: residentTrip[residentTrip.length - 1].end}
                    )}
            })
        }
    })
    $main.append(`<ul></ul>`);
    presentContacts.forEach(contact => {
        $('main ul').append(`<li>${contact.name}</li>`)
    })
});

/*----- functions -----*/

function initMap() {
    geocoder = new google.maps.Geocoder();
    map = new google.maps.Map(document.getElementById("map"), {
        center: dummy,
        zoom: 8,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
    });

    google.maps.event.addListener(map, 'click', function(event) {
        console.log(event.latLng.lat(), event.latLng.lng(),);
    });
}

function codeAddress(givenAddress) {
    geocoder.geocode( { 'address': givenAddress}, function(results, status) {
        console.log("noise", results);
        latLng = results[0].geometry.location;
        map.setCenter(latLng);
        map.setZoom(10);
        setFence(latLng);
    })
}

function setFence(location) {
    // Gets miles from input field
    let defaultRadius = 5;

    // Converts miles >> kilometers >> meters for Maps API radius
    let fenceRadius = (defaultRadius * 1.60934) * 1000;

    // Converts radius meters to degrees for lat/lng comparison
    let degreesPerMeter = 0.00001
    let degreeReference = fenceRadius * degreesPerMeter;

    socialFence = new google.maps.Circle({
        strokeColor: "#1773b4",
        strokeOpacity: 0.6,
        strokeWeight: 1,
        fillColor: "#3badff",
        fillOpacity: 0.35,
        map,
        center: location,
        editable: true,
        radius: fenceRadius,
    });

    google.maps.event.addListener(socialFence, 'radius_changed', function() {
        console.log(db.filter(friend => arePointsNear(
            {lat: friend.domestic.lat,
            lng: friend.domestic.lng},
            {lat: socialFence.center.lat(),
            lng: socialFence.center.lng()},
            socialFence.radius / 1000
            )));
    });
}

function roundHalf(num) {
    return Math.round(num*2)/2;
}

function visitorAndResidentCompare(primaryDates, secondaryDates) {
    return (secondaryDates.end < primaryDates.start || secondaryDates.start > primaryDates.end)
}

function visitorAndResidentOverlap(visitorDates, residentDates) {
    if (visitorDates.start < residentDates.start) {
        if (visitorDates.end > residentDates.end) {
            console.log('visitor arrives before resident departs and leaves after' +
                ' resident returns; overlap both sides, display resident departure and return');
        } else if (visitorDates.end <= residentDates.end) {
            console.log('visitor arrives before resident departs, but leaves before ' +
                'resident returns; overlap at beginning, display resident departure');
        }
    } else if (visitorDates.start >= residentDates.start) {
        if (visitorDates.end > residentDates.end) {
            console.log('visitor arrives after resident departs, but leaves after resident returns;' +
                ' overlap on back side; display resident return')
        } else if (visitorDates.end <= residentDates.end) {
            console.log('visitor arrives after resident departs and departs before resident returns;' +
                ' no overlap')
        }
    }
}

function arePointsNear(checkPoint, centerPoint, km) {
    var ky = 40000 / 360;
    var kx = Math.cos(Math.PI * centerPoint.lat / 180.0) * ky;
    var dx = Math.abs(centerPoint.lng - checkPoint.lng) * kx;
    var dy = Math.abs(centerPoint.lat - checkPoint.lat) * ky;
    console.log(checkPoint, centerPoint, ky, kx, dx, dy, Math.sqrt(dx * dx + dy * dy) <= km)
    return Math.sqrt(dx * dx + dy * dy) <= km;
}

// HTML Assignments
$tripStart.attr('min', `${new Date().toISOString()}`, 'value', `${new Date().toISOString()}`);
$tripEnd.attr('min', `${new Date().toISOString()}`, 'value', `${new Date().toISOString()}`);