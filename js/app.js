$(document).ready(function() {
    //
    // Setup
    //

    var round = 1;
    var points = 0;
    var roundScore = 0;
    var totalScore = 0;
    ranOut = false;
    var distance;

    //
    //  Init maps
    //

    svinitialize();
    mminitialize();

    //
    // Scoreboard & Guess button event
    //

    // Init Timer
    resetTimer();

    // Timer
    function timer() {
        count = count-1;
        if (count <= 0) {
            if (round < 5){
                endRound();
            } else if (round >= 5){
                endGame();
            };
            clearInterval(counter);
        }
        $("#timer").html(count);
    };

    // Guess Button
    $('#guessButton').click(function (){
        doGuess();
        rminitialize();
    });

    // End of round continue button click
    $('#roundEnd').on('click', '.closeBtn', function () {
        $('#roundEnd').fadeOut(500);

        if (round < 5){

            round++
            if(ranOut==true){
                roundScore = 0;
            } else {
                roundScore = points;
                totalScore = totalScore + points;
            }

            $('.round').html('Current Round: <b>'+round+'/5</b>');
            $('.roundScore').html('Last Round Score: <b>'+roundScore+'</b>');
            $('.totalScore').html('Total Score: <b>'+totalScore+'</b>');

            var img = document.getElementById('image');
            img.src = "";

            // Reload maps to refresh coords
            svinitialize();
            guess2.setLatLng({lat: -999, lng: -999});
            mymap.setView([30, 10], 1);

            // Reset Timer
            resetTimer();
        } else if (round >= 5){
            endGame();
        };
    });

    // End of game 'play again' button click
    $('#endGame').on('click', '.playAgain', function () {
        window.location.reload();
    });

    //
    // Functions
    //

    // Reset Timer
    function resetTimer(){
        count = 999999;
        counter = setInterval(timer, 1000);
    }

    // Calculate distance between points function
    function calcDistance(lat1, lon1, lat2, lon2) {
        var R = 6371; // km
        var dLat = toRad(lat2-lat1);
        var dLon = toRad(lon2-lon1);
        var lat1 = toRad(lat1);
        var lat2 = toRad(lat2);

        var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2); 
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
        var d = R * c;
        return d;
    }

    // Converts numeric degrees to radians
    function toRad(Value) {
        return Value * Math.PI / 180;
    }

    function doGuess(){
        if (ranOut == false){

            // Stop Counter
            clearInterval(counter);

            // Reset marker function
            function resetMarker() {
                //Reset marker
                if (guessMarker != null) {
                    guessMarker.setMap(null);
                }
            };

            // Calculate distance between points, and convert to kilometers
            distance = Math.ceil(calcDistance(window.actualLatLng.lat, window.actualLatLng.lon, window.guessLatLng.lat, window.guessLatLng.lng));

            // Calculate points awarded via guess proximity
            function inRange(x, min, max) {
                return (min <= x && x <= max);
            };

            // Real basic point thresholds depending on kilometer distances
            if(inRange(distance, 1, 2)) {
                points = 10000;
            } else if(inRange(distance, 3, 10)) {
                points = 7000;
            } else if(inRange(distance, 11, 50)) {
                points = 4000;
            } else if(inRange(distance, 51, 200)) {
                points = 3000;
            } else if(inRange(distance, 201, 500)) {
                points = 2000;
            } else if(inRange(distance, 501, 800)) {
                points = 1000;
            } else if(inRange(distance, 801, 1300)) {
                points = 500;
            } else if(inRange(distance, 1301, 1600)) {
                points = 400;
            } else if(inRange(distance, 1601, 2300)) {
                points = 300;
            } else if(inRange(distance, 2301, 2800)) {
                points = 200;
            } else if(inRange(distance, 2801, 3200)) {
                points = 100;
            } else if(inRange(distance, 3200, 4500)) {
                points = 50;
            } else if(inRange(distance, 4501, 6000)) {
                points = 25;
            } else {
                points = 0;
            };

            roundScore = points;

            endRound();

        } else {

            // They ran out

        }

        timer();

    };

    function endRound(){

        // If distance is undefined, that means they ran out of time and didn't click the guess button
        if(typeof distance === 'undefined' || ranOut == true){
            $('#roundEnd').html('<p>Dang nabbit! You took too long!.<br/> You didn\'t score any points this round!<br/><br/><button class="btn btn-primary closeBtn" type="button">Continue</button></p></p>');
            $('#roundEnd').fadeIn();

            // Stop Counter
            clearInterval(counter);

            // Reset marker function
            function resetMarker() {
                //Reset marker
                if (guessMarker != null) {
                    guessMarker.setMap(null);
                }
            };

            //window.guessLatLng = '';
            ranOut = false;

            points = 0;

        } else {
            $('#roundEnd').html('<p>Your guess was<br/><strong><h1>'+distance+'</strong>km</h1> away from the actual location,<br/><a href="'+window.locID+'">'+window.locName+'</a>,<br/>'+window.locDescription+'.<br/><div id="roundMap"></div><br/> You have scored<br/><h1>'+roundScore+' points</h1> this round!<br/><br/><button class="btn btn-primary closeBtn" type="button">Continue</button></p></p>');
            $('#roundEnd').fadeIn();
        };

        // Reset Params
        ranOut = false;

    };

    function endGame(){

        roundScore = points;
        totalScore = totalScore + points;

        $('#miniMap, #pano, #guessButton, #scoreBoard').hide();
        $('#endGame').html('<h1>Congrats!</h1><h2>Your final score was:</h2><h1>'+totalScore+'!</h1><br/><button class="btn btn-large btn-success playAgain" type="button">Play Again?</button>');
        $('#endGame').fadeIn(500);

        //rminitialize();

        // We're done with the game
        window.finished = true;
    }

    function svinitialize() {
        const query = `
        SELECT ?item ?itemLabel ?itemDescription ?lat ?lon ?photo WHERE { 
            { 
                SELECT ?item ?photo ?lat ?lon 
                WHERE { 
                    ?item wdt:P18 ?photo .  
                        ?item p:P625 ?statement . 
                        ?statement psv:P625 ?coords . 
                        ?coords wikibase:geoLatitude ?lat . 
                        ?coords wikibase:geoLongitude ?lon . 
                } LIMIT 1000
            } 
            SERVICE wikibase:label { bd:serviceParam wikibase:language "en,de". } 
        } 
        `;
        const url = `https://query.wikidata.org/bigdata/namespace/wdq/sparql?format=json&query=${query}`;
            window.fetch(url)
            .then(
                function (response) {
                    if (response.status !== 200) {
                        console.warn(`Looks like there was a problem. Status Code: ${response.status}`);
                        return;
                    }
                    response.json().then(function (data) {
                        var i = Math.floor(Math.random()*1000)
                        var place = data.results.bindings[i];

                        var img = document.getElementById('image');
                        img.src = place.photo.value;
                        window.actualLatLng = {lat: place.lat.value, lon: place.lon.value};
                        window.locName = place.itemLabel.value;
                        window.locDescription = place.itemDescription.value;
                        window.locID = place.item.value;
                    });
                }
            )
            .catch(function (err) {
                console.warn('Fetch Error :-S', err);
            });
    };
});
