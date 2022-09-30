function getLocation() {
    if (navigator.geolocation) {
        //console.log("es por aca");
        navigator.geolocation.getCurrentPosition(showPosition);
    } else {
        console.log("Geolocation is not supported by this browser.");
    }
}

function showPosition(position) {
    clearOldSuggestions();
    var lat = position.coords.latitude;
    var lon = position.coords.longitude;
    //displayMarker([0, lat, lon]);
    document.getElementsByName('lat')[0].value = parseFloat(lat);
    document.getElementsByName('lon')[0].value = parseFloat(lon);
    document.getElementById('hideMap').style.display = 'block';
    map.getViewPort().resize();

    // Get an instance of the search service:
    var geocoder = platform.getGeocodingService(),
        parameters = {
            prox: lat + ',' + lon + ',250',
            mode: 'retrieveAddresses',
            maxresults: '1',
            gen: '9'
        };

    // Call the reverse geocode method with the geocoding parameters,
    // the callback and an error callback function (called if a
    // communication error occurs):
    geocoder.reverseGeocode(parameters, (resultado) => {
        // Assumption: ui is instantiated
        // Create an InfoBubble at the returned location with
        // the address as its contents:
        var result = resultado.Response.View[0].Result[0].Location.Address;

        //if (result.HouseNumber != undefined) {
        document.getElementById("direccionMapa").value = result.Label;
        displayMarker(['', lat, lon],true);
        //console.log(result.items[0].address);
        document.getElementsByName('direccionData')[0].value = JSON.stringify(result);
        //document.getElementsByName('direccion')[0].value = result.Label;
        /*} else {
            alert("La direccion no tiene numero");
            displayMarker(['', lat, lon]);
            document.getElementById("direccionMapa").value = '';
            document.getElementsByName('direccionData')[0].value = '';
            document.getElementsByName('direccion')[0].value = '';
        }*/
    }, alert);

    //console.log([document.getElementsByName('lat')[0].value,document.getElementsByName('lon')[0].value]);
}

function dragMarker() {
    var lat = document.getElementsByName('lat')[0].value;
    var lon = document.getElementsByName('lon')[0].value;

    // Get an instance of the search service:
    var geocoder = platform.getGeocodingService(),
        parameters = {
            prox: lat + ',' + lon + ',250',
            mode: 'retrieveAddresses',
            maxresults: '1',
            gen: '9'
        };

    // Call the reverse geocode method with the geocoding parameters,
    // the callback and an error callback function (called if a
    // communication error occurs):
    geocoder.reverseGeocode(parameters, (resultado) => {
        // Assumption: ui is instantiated
        // Create an InfoBubble at the returned location with
        // the address as its contents:
        var result = resultado.Response.View[0].Result[0].Location.Address;
        //if (result.HouseNumber != undefined) {
        document.getElementById("direccionMapa").value = result.Label;
        //displayMarker([result.items[0].address.label, lat, lon]);
        document.getElementsByName('direccionData')[0].value = JSON.stringify(result);
        //document.getElementsByName('direccion')[0].value = result.Label;
        document.getElementsByName('lat')[0].value = parseFloat(lat);
        document.getElementsByName('lon')[0].value = parseFloat(lon);
        /*} else {
            alert("Algo fallo ");
            document.getElementById("direccionMapa").value = '';
            document.getElementsByName('direccionData')[0].value = '';
            document.getElementsByName('direccion')[0].value = '';
        }*/
    }, alert);

    //console.log([document.getElementsByName('lat')[0].value,document.getElementsByName('lon')[0].value]);
}