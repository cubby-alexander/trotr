let map;
let $address = $('#address');
let dummy = { lat: -34.397, lng: 150.644 };

let geocoder;

function initMap() {
    geocoder = new google.maps.Geocoder();
    map = new google.maps.Map(document.getElementById("map"), {
        center: dummy,
        zoom: 8,
    });
    console.log(map);
}

function codeAddress(givenAddress) {
    console.log(givenAddress);
    geocoder.geocode( { 'address': givenAddress}, function(results, status) {
        map.setCenter(results[0].geometry.location);
        setFence(results[0].geometry.location);
    });
}

function setFence(location) {
    // Gets miles from input field
    let miles = 5;

    // Converts miles >> kilometers >> meters for Maps API radius
    let fenceRadius = (miles * 1.60934)*1000;

    // Converts radius meters to degrees for lat/lng comparison
    let degrees = 0.00001
    let degreeReference = fenceRadius * degrees;

    console.log(fenceRadius, "is set");

    const socialFence = new google.maps.Circle({
        strokeColor: "#1773b4",
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: "#3badff",
        fillOpacity: 0.35,
        map,
        center: location,
        radius: fenceRadius,
    });
}

$('#location').on('click', () => {
    console.log("Gotcha");
    codeAddress($address.val());
})