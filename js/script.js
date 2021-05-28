
/*----- constants -----*/

let map;
let geocoder;
let autocomplete;
let visitorTrip = {
    start: '',
    end: '',
};
let geocodedLatLng;
let destinationText;
let socialFence;
let radiusText;
let initialLatLng = {
    lat: 39.61532527777455,
    lng: -95.5801062378202
};
let months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'Åugust', 'September', 'October', 'November', 'December']


/*----- app's state (letiables) -----*/
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
                start: new Date ('2021/06/10'),
                end: new Date ('2021/06/18')
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
                lat: 40.745769083889726,
                lng: -73.99396703570228,
                fenceRadius: 25,
                name: "New York",
                start: new Date ('2021/06/07'),
                end: new Date ('2021/06/113')
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
                lat: 40.745769083889726,
                lng: -73.99396703570228,
                fenceRadius: 13,
                name: "Brooklyn, NY",
                start: new Date ('2021/06/07'),
                end: new Date ('2021/06/13')
            }],
        ],
    }
];
let presentContacts = [];

/*----- cached element references -----*/
let $main = $('main');
let $address = $('input#address');
let $fenceSubmit = $('#fence-submit');
let $tripStart = $('#start');
let $tripEnd = $('#end')
let $travelSummary = $('#travel-summary');
let $map = $('#map');
let $confirmTrip = $('#confirm-trip');


/*----- event listeners -----*/

$fenceSubmit.on('click', () => {
    codePlace(autocomplete.getPlace().place_id);
});

$confirmTrip.on('click', () => {
    if (isTripValid()) {
        console.log("It's lit!");
    } else {
        console.log("It's not lit...")
    }
})

$tripStart.on('change', () => {
    visitorTrip.start = new Date (event.target.value.replace('-', '/'));
    setTravelString();
});

$tripEnd.on('change', () => {
    visitorTrip.end = new Date (event.target.value.replace('-', '/'));
    setTravelString();
});

$address.keydown((event) => {
    let keycode = (event.keyCode ? event.keyCode : event.which);
    if (keycode === 13) {
        console.log(keycode, event);
        codePlace(autocomplete.getPlace().place_id);
    }
});

$confirmTrip.on('click', () => {
    identifyPresentContacts();
    render();
})

/*----- functions -----*/

function initMap() {
    map = new google.maps.Map(document.getElementById("map"), {
        center: initialLatLng,
        zoom: 3,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
    });

    geocoder = new google.maps.Geocoder();

    autocomplete = new google.maps.places.Autocomplete(document.querySelector('input#address'));

    google.maps.event.addListener(autocomplete, 'places_changed', function(event) {
        codePlace(autocomplete.getPlace().place_id);
    })

    google.maps.event.addListener(map, 'click', function(event) {
        console.log(event.latLng.lat(), event.latLng.lng());
    });
}

function codePlace(givenAddress) {
    geocoder.geocode( { 'placeId': givenAddress}, function(results, status) {
        let locality = results[0].address_components.find(component => component.types.find(type => type === 'locality')).long_name;
        let provinceOrState = results[0].address_components.find(component => component.types.find(type => type === "administrative_area_level_1")).short_name;
        destinationText = `${locality}, ${provinceOrState}`;
        geocodedLatLng = results[0].geometry.location;
        map.setCenter(geocodedLatLng);
        map.setZoom(10);
        setFence(geocodedLatLng);
        setTravelString();
    })
}

function codeLatLng(givenCoordinates) {
    let coordinates = {lat: givenCoordinates.lat(), lng: givenCoordinates.lng()}
    geocoder.geocode({location: coordinates}, function(results, status) {
        console.log(results);
        let locality = results[0].address_components.find(component => component.types.find(type => type === 'locality' || type === 'sublocality')).long_name;
        let provinceOrState = results[0].address_components.find(component => component.types.find(type => type === "administrative_area_level_1")).short_name;
        destinationText = `${locality}, ${provinceOrState}`;
        setTravelString();
    })
}

function setFence(location) {
    // Gets miles from input field
    let defaultRadius = 5.2;

    // Converts miles >> kilometers >> meters for Maps API radius
    let fenceRadius = (defaultRadius * 1.60934) * 1000;

    // Converts radius meters to degrees for lat/lng comparison
    let degreesPerMeter = 0.00001
    let degreeReference = fenceRadius * degreesPerMeter;

    if (socialFence !== undefined) {
        socialFence.setMap(null);
    }

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

    radiusText = Math.floor((socialFence.radius / 1000) * 0.621371 * 2) / 2;

    google.maps.event.addListener(socialFence, 'radius_changed', function() {
        radiusText = Math.floor((socialFence.radius / 1000) * 0.621371 * 2) / 2;
        setTravelString();
    });

    google.maps.event.addListener(socialFence, 'center_changed', function() {
        codeLatLng(socialFence.center);
    })
}

const identifyPresentContacts = () => {
    presentContacts = [];
    let socialFenceRadiusInKilo = socialFence.radius / 1000;
    let visitorCenterpoint = {
        lat: socialFence.center.lat(),
        lng: socialFence.center.lng()
    };
    db.forEach(contact => {
        console.log(presentContacts)
        let residenceCheckpoint = {
            lat: contact.domestic.lat,
            lng: contact.domestic.lng
        };
        // Does the contact live within the social fence set by the user?
        if (arePointsNear(residenceCheckpoint, visitorCenterpoint, socialFenceRadiusInKilo)) {
            // Is the resident contact travelling during the user's visit?
            if (!residentIsTraveling(contact)) {
                presentContacts.push({name: contact.name, image: contact.image, location: contact.domestic.name, duration: "Present for duration"})
            } else {
                let overlapDetails = visitorAndResidentOverlap(contact.travel);
                console.log(overlapDetails, contact.name);
                if (overlapDetails.overlap) {
                    presentContacts.push({name: contact.name, image: contact.image, location: contact.domestic.name, duration: overlapDetails.duration});
                }
            }
        } else {
            contact.travel.forEach((trip) => {
                trip.forEach((destination) => {
                    let travelCheckpoint = {
                        lat: destination.lat,
                        lng: destination.lng
                    }
                    if (arePointsNear(travelCheckpoint, visitorCenterpoint, socialFenceRadiusInKilo)) {
                        let overlap = false;
                        let contactArrival = "";
                        let contactDeparture = "";
                        if (destination.start > visitorTrip.start && destination.start < visitorTrip.end) {
                            overlap = true;
                            contactArrival = `Arrives ${months[destination.start.getMonth()]} ${destination.start.getDate()}`;
                        }
                        if (destination.end < visitorTrip.end && destination.end > visitorTrip.start) {
                            overlap = true
                            contactDeparture = `Departs ${months[destination.end.getMonth()]} ${destination.end.getDate()}`;
                        }
                        if (overlap) {
                            presentContacts.push({name: contact.name, image: contact.image, location: destination.name, duration: `${contactArrival} ${contactDeparture}`})
                            console.log(contact.name, `${contactArrival} ${contactDeparture}`)
                        }
                    }
                })
            })
        }
    })
};

function residentIsTraveling(contact) {
    let isTraveling = false;
    contact.travel.forEach((trip) => {
        if ((trip[trip.length - 1].end > visitorTrip.start && trip[trip.length - 1].end < visitorTrip.end) ||
            (trip[0].start > visitorTrip.start && trip[0].start < visitorTrip.end)) {
            isTraveling = true;
        }
    })
    return (isTraveling)
}

function visitorAndResidentOverlap(residentTravel) {
    let travelStatus = {overlap: false, duration: ""};
    let residentTrip = residentTravel.find(trip => ((trip[0].start > visitorTrip.start && trip[0].start < visitorTrip.end) ||
        (trip[trip.length - 1].end > visitorTrip.start && trip[trip.length - 1].end < visitorTrip.end)
    ));
    let residentStart = {value: residentTrip[0].start, string: `${months[residentTrip[0].start.getMonth()]} ${residentTrip[0].start.getDate()}`};
    let residentEnd = {value: residentTrip[residentTrip.length - 1].end, string: `${months[residentTrip[residentTrip.length - 1].end.getMonth()]} ${residentTrip[residentTrip.length - 1].end.getDate()}`}
    if (visitorTrip.start < residentStart.value) {
        if (visitorTrip.end > residentEnd.value) {
            travelStatus = {...travelStatus, overlap: true, duration: `Leaves ${residentStart.string} and Returns ${residentEnd.string}`}
            console.log('visitor arrives before resident departs and leaves after' +
                ' resident returns; overlap both sides, display resident departure and return');
        } else if (visitorTrip.end <= residentEnd.value) {
            travelStatus = {...travelStatus, overlap: true, duration: `Leaves ${residentStart.string}`}
            console.log('visitor arrives before resident departs, but leaves before ' +
                'resident returns; overlap at beginning, display resident departure');
        }
    } else if (visitorTrip.start >= residentStart.value) {
        if (visitorTrip.end > residentEnd.value) {
            travelStatus = {...travelStatus, overlap: true, duration: `Arrives ${residentEnd.string}`}
            console.log('visitor arrives after resident departs, but leaves after resident returns;' +
                ' overlap on back side; display resident return')
        } else if (visitorTrip.end <= residentEnd.value) {
            console.log('visitor arrives after resident departs and departs before resident returns;' +
                ' no overlap')
        }
    }
    console.log(travelStatus);
    return travelStatus;
}

function arePointsNear(checkPoint, centerPoint, km) {
    let ky = 40000 / 360;
    let kx = Math.cos(Math.PI * centerPoint.lat / 180.0) * ky;
    let dx = Math.abs(centerPoint.lng - checkPoint.lng) * kx;
    let dy = Math.abs(centerPoint.lat - checkPoint.lat) * ky;
    return Math.sqrt(dx * dx + dy * dy) <= km;
}

function render() {
    addContactList();
}

function addContactList() {
    $('div.contact').fadeOut(300, function(){ $(this).remove()});
    presentContacts.forEach(contact => {
        $(`
            <div class="contact">
                <image class="avatar" src="${contact.image}" />
                <div class="descriptors">
                    <p id="name">${contact.name}</p>
                    <p id="location">${contact.location}</p>
                    <p id="overlap">${contact.duration}</p>
                </div>
                <div class="interactors">
                    <button id="message"><i class="fas fa-comment-alt fa-lg"></i></button>
                    <button id="connect"><i class="fas fa-user-friends fa-lg"></i></button>
                </div>
            </div>
        `).hide().appendTo($main).fadeIn(300)
    })
}

// UI/UX Functions

function isTripValid() {
    return (visitorTrip.start !== 0 & visitorTrip.end !== 0 && socialFence !== undefined);
}

function setTravelString() {
    if (destinationText !== undefined) {
        let notice = (visitorTrip.start !== "" && visitorTrip.end !== "") ?
            `Your trip to ${destinationText} is scheduled for ${visitorTrip.start.toDateString()} to ${visitorTrip.end.toDateString()}.
         <br />
        <br />
        Based on your social fence, contacts within approximately ${radiusText} miles will be notified of your itinerary.` :
            `Your trip to ${destinationText} has not been scheduled. Please select start and end dates above.`

        $travelSummary.html(`${notice}`);
    }
}

function dateMin() {
    let today = new Date();
    let dd = today.getDate();
    let mm = today.getMonth()+1; //January is 0!
    let yyyy = today.getFullYear();
    if (dd < 10) {
        dd = '0' + dd
    }
    if ( mm < 10) {
        mm = '0' + mm
    }
    today = yyyy+'-'+mm+'-'+dd;
    return today
}

// HTML Assignments
$tripStart.attr('min', `${dateMin()}`, 'value', ``);
$tripEnd.attr('min', `${dateMin()}`, 'value', ``);

let $mapWidth = $map.width();
$map.css('height', `${$mapWidth}px` );