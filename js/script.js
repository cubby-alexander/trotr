

/* Pseudocode
    1. Changing fence radius needs to display updated information for user
    2.
 */


/*----- constants -----*/

let map;
let geocoder;
let socialFence;
let dummy = {
    lat: 40.745769083889726,
    lng: -73.99396703570228
};


/*----- app's state (variables) -----*/
let latLng;

const db = [
    {
        name: "Tyrion Lannister",
        domestic: {
            location: {
                lat: 40.745769083889726,
                lng: -73.99396703570228,
                fenceRadius: 25,
                name: "New York"
            }
        },
        travel: [],
    },

    {
        name: "Jamie Lannister",
        domestic: {
            location: {
                lat: 40.745769083889726,
                lng: -73.99396703570228,
                fenceRadius: 25,
                name: "New York"
            }
        },
        travel: [],
    },

    {
        name: "Cersei Lannister",
        domestic: {
            location: {
                lat: 40.745769083889726,
                lng: -73.99396703570228,
                fenceRadius: 25,
                name: "New York"
            }
        },
        travel: [],
    },

    {
        name: "Tywin Lannister",
        domestic: {
            location: {
                lat: 40.745769083889726,
                lng: -73.99396703570228,
                fenceRadius: 25,
                name: "New York"
            }
        },
        travel: [],
    },

    {
        name: "Margery Tyrell",
        domestic: {
            location: {
                lat: 40.72903529770815,
                lng: -73.79783768863047,
                fenceRadius: 25,
                name: "New York"
            }
        },
        travel: [],
    },

    {
        name: "Rob Stark",
        domestic: {
            location: {
                lat: 40.72903529770815,
                lng: -73.79783768863047,
                fenceRadius: 25,
                name: "New York"
            }
        },
        travel: [],
    },

    {
        name: "Jon Snow",
        domestic: {
            location: {
                lat: 40.72903529770815,
                lng: -73.79783768863047,
                fenceRadius: 25,
                name: "New York"
            }
        },
        travel: [],
    }
]

/*----- cached element references -----*/
let $address = $('#address');
$fenceSubmit = $('#fence-submit');
$tripStart = $('#start');


/*----- event listeners -----*/

$fenceSubmit.on('click', () => {
    codeAddress($address.val());
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
        degreeReference = socialFence.getRadius() * degreesPerMeter;
        console.log(db.filter(friend => (
            (friend.domestic.location.lat < socialFence.center.lat() + degreeReference) && (friend.domestic.location.lat > socialFence.center.lat() - degreeReference) &&
            (friend.domestic.location.lng < socialFence.center.lng() + degreeReference) && (friend.domestic.location.lng > socialFence.center.lng() - degreeReference)
        )));
    });

    console.log(degreeReference, socialFence.center.lat() - degreeReference, socialFence.center.lat() + degreeReference, socialFence.center.lng() - degreeReference, socialFence.center.lng() + degreeReference)

    console.log(db.filter(friend => (
        (friend.domestic.location.lat < socialFence.center.lat() + degreeReference) && (friend.domestic.location.lat > socialFence.center.lat() - degreeReference) &&
        (friend.domestic.location.lng < socialFence.center.lng() + degreeReference) && (friend.domestic.location.lng > socialFence.center.lng() - degreeReference)
    )));
}

function roundHalf(num) {
    return Math.round(num*2)/2;
}

// HTML Assignments
$tripStart.attr('min', `${new Date().toISOString()}`, 'value', `${new Date().toISOString()}`);