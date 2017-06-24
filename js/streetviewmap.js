function svinitialize() {
    const query = `
SELECT ?item ?itemLabel ?lat ?lon ?photo WHERE { 
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
                    console.log(place);

                    var img = document.getElementById('image');
                    img.src = place.photo.value;
                    window.locLL = place.lat.value + "," + place.lon.value;
                    window.locName = place.itemLabel.value;
                });
            }
        )
        .catch(function (err) {
            console.warn('Fetch Error :-S', err);
        });
};
