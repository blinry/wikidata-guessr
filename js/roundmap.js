//
// End of round map
//

function rminitialize() {
    roundmap = L.map("roundMap").setView([30, 10], 1);

    L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: 'Map data © <a href="http://openstreetmap.org">OpenStreetMap</a> contributors',
        maxZoom: 18
    }).addTo(roundmap);

    var guessIcon = L.icon({
        iconUrl: "img/guess.png",
        iconAnchor: [45, 90]
    });

    var actualIcon = L.icon({
        iconUrl: "img/actual.png",
        iconAnchor: [45, 90]
    });

    guess = L.marker([-999, -999], {
        icon: guessIcon
    }).addTo(roundmap)

    actual = L.marker([-999, -999], {
        icon: actualIcon
    }).addTo(roundmap)

    guess.setLatLng(window.guessLatLng);
    actual.setLatLng(window.actualLatLng);
    roundmap.fitBounds(L.latLngBounds(guess.getLatLng(), actual.getLatLng()), {
        padding: [50, 50]
    });
};
