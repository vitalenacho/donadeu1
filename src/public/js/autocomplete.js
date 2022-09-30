var AUTOCOMPLETION_URL = 'https://autocomplete.geocoder.ls.hereapi.com/6.2/suggest.json',
    ajaxRequest = new XMLHttpRequest(),
    query = '';

var currentLatitude = null;
var currentLongitude = null;
function latLon() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            function (position) {
                currentLatitude = position.coords.latitude;
                currentLongitude = position.coords.longitude;
            });
    }
}

function executeLatLon(textBox) {
    let dataCheck = $("#checkDirec")[0].checked;
    latLon();
    return autoCompleteListener(textBox, true);
}

/**
 * If the text in the text box  has changed, and is not empty,
 * send a geocoding auto-completion request to the server.
 *
 * @param {Object} textBox the textBox DOM object linked to this event
 * @param {Object} event the DOM event which fired this listener
 */
function autoCompleteListener(textBox, evento) {
    let proximity0 = $("#checkDirec")[0].checked;
    let proximity = ""
    if (proximity0) {
        proximity = '&prox=' + encodeURIComponent(currentLatitude + "," + currentLongitude);
    }
    let queryText = textBox.value;
    //console.log([query != textBox.value, evento, textBox.value.length >= 6, (query != textBox.value || evento) && (textBox.value.length >= 6)])
    if ((query != textBox.value || evento) && (textBox.value.length >= 6)) {

        /**
         * A full list of available request parameters can be found in the Geocoder Autocompletion
         * API documentation.
         *
         */
        var params = '?' +
            'query=' + encodeURIComponent(queryText) + // The search text which is the basis of the query
            '&beginHighlight=' + encodeURIComponent('<mark>') + //  Mark the beginning of the match in a token.
            '&endHighlight=' + encodeURIComponent('</mark>') + //  Mark the end of the match in a token.
            '&maxresults=4' + // The upper limit the for number of suggestions to be included
            '&language=es' +
            proximity +
            // in the response.  Default is set to 5.
            '&apikey=' + APIKEY;
        ajaxRequest.open('GET', AUTOCOMPLETION_URL + params);
        ajaxRequest.send();

    }
    query = textBox.value;
}


/**
 *  This is the event listener which processes the XMLHttpRequest response returned from the server.
 */
function onAutoCompleteSuccess() {
    /*
     * The styling of the suggestions response on the map is entirely under the developer's control.
     * A representitive styling can be found the full JS + HTML code of this example
     * in the functions below:
     */
    var dropdown = [];

    //addSuggestionsToPanel(this.response);  // In this context, 'this' means the XMLHttpRequest itself.
    addSuggestionsToMap(this.response, dropdown);
}


/**
 * This function will be called if a communication error occurs during the XMLHttpRequest
 */
function onAutoCompleteFailed() {
    alert('Ooops!');
}

// Attach the event listeners to the XMLHttpRequest object
ajaxRequest.addEventListener("load", onAutoCompleteSuccess);
ajaxRequest.addEventListener("error", onAutoCompleteFailed);
ajaxRequest.responseType = "json";


/**
 * Boilerplate map initialization code starts below:
 */


// set up containers for the map  + panel
var mapContainer = document.getElementById('map'),
    suggestionsContainer = document.getElementById('panel');

//Step 1: initialize communication with the platform
var APIKEY = 'yKsNO9XriVmWrprNNiosXTalHQBu5SUyde4CwLoYJYQ';

var platform = new H.service.Platform({
    apikey: APIKEY,
    useCIT: false,
    useHTTPS: true
});
var defaultLayers = platform.createDefaultLayers();
var geocoder = platform.getGeocodingService();
var group = new H.map.Group();


group.addEventListener('tap', function (evt) {
    map.setCenter(evt.target.getGeometry());
    openBubble(
        evt.target.getGeometry(), evt.target.getData());
}, false);

    
//Step 2: initialize a map - this map is centered over Europe
var map = new H.Map(mapContainer,
    defaultLayers.vector.normal.map, {
    center: { lat: 52.5160, lng: 13.3779 },
    zoom: 3
});

map.addObject(group);

//Step 3: make the map interactive
// MapEvents enables the event system
// Behavior implements default interactions for pan/zoom (also on mobile touch environments)
var behavior = new H.mapevents.Behavior(new H.mapevents.MapEvents(map));

// Create the default UI components
var ui = H.ui.UI.createDefault(map, defaultLayers);

// Now use the map as required...
window.onload = function () {
    moveMapToSantaFe(map);
    latLon();
}

function moveMapToSantaFe(map) {
    map.setCenter({ lat: -31.6333294, lng: -60.7000008 });
    map.setZoom(13);
}
// Hold a reference to any infobubble opened
var bubble;

/**
 * Function to Open/Close an infobubble on the map.
 * @param  {H.geo.Point} position     The location on the map.
 * @param  {String} text              The contents of the infobubble.
 */
function openBubble(position, text) {
    if (!bubble) {
        bubble = new H.ui.InfoBubble(
            position,
            // The FO property holds the province name.
            { content: '<small>' + text + '</small>' });
        ui.addBubble(bubble);
    } else {
        bubble.setPosition(position);
        bubble.setContent('<small>' + text + '</small>');
        bubble.open();
    }
}


/**
 * The Geocoder Autocomplete API response retrieves a complete addresses and a `locationId`.
 * for each suggestion.
 *
 * You can subsequently use the Geocoder API to geocode the address based on the ID and
 * thus obtain the geographic coordinates of the address.
 *
 * For demonstration purposes only, this function makes a geocoding request
 * for every `locationId` found in the array of suggestions and displays it on the map.
 *
 * A more typical use-case would only make a single geocoding request - for example
 * when the user has selected a single suggestion from a list.
 *
 * @param {Object} response
 */
function addSuggestionsToMap(response, dropdown) {
    /**
     * This function will be called once the Geocoder REST API provides a response
     * @param  {Object} result          A JSONP object representing the  location(s) found.
     */
    var onGeocodeSuccess = function (result) {
        var marker,
            locations = result.Response.View[0].Result,
            i;
        // Add a marker for each location found
        //var dropdown2 = dropdown;

        for (i = 0; i < locations.length; i++) {
            /*
            marker = new H.map.Marker({
                lat : locations[i].Location.DisplayPosition.Latitude,
                lng : locations[i].Location.DisplayPosition.Longitude
            });
            marker.setData(locations[i].Location.Address.Label);
            group.addObject(marker);
            */
            dropdown.push([locations[i].Location.Address.Label, locations[i].Location.DisplayPosition.Latitude, locations[i].Location.DisplayPosition.Longitude, locations[i].Location.Address])
            /*
            dropdown2.push({
                label: locations[i].Location.Address.Label, lat: locations[i].Location.DisplayPosition.Latitude, lon: locations[i].Location.DisplayPosition.Longitude, direccion: locations[i].Location.Address
            });
            */

        }
        /*
        map.getViewModel().setLookAtData({
            bounds: group.getBoundingBox()
        });
        if(group.getObjects().length < 2){
            map.setZoom(15);
        }
        */
        autocomplete(document.getElementById("auto-complete"), dropdown);
        //autocomplete2(document.getElementById("auto-complete"), dropdown2);
    },
        /**
         * This function will be called if a communication error occurs during the JSON-P request
         * @param  {Object} error  The error message received.
         */
        onGeocodeError = function (error) {
            alert('Ooops!');
        },
        /**
         * This function uses the geocoder service to calculate and display information
         * about a location based on its unique `locationId`.
         *
         * A full list of available request parameters can be found in the Geocoder API documentation.
         * see: http://developer.here.com/rest-apis/documentation/geocoder/topics/resource-search.html
         *
         * @param {string} locationId    The id assigned to a given location
         */
        geocodeByLocationId = function (locationId) {
            geocodingParameters = {
                locationId: locationId
            };
            /*
            geocoder.geocode(
                geocodingParameters,
                onGeocodeSuccess,
                onGeocodeError
            );
            */

            geocoder.geocode(
                geocodingParameters,
                onGeocodeSuccess,
                onGeocodeError
            );
        }

    /*
     * Loop through all the geocoding suggestions and make a request to the geocoder service
     * to find out more information about them.
     
    response.suggestions.forEach(function (item, index, array) {
        geocodeByLocationId(item.locationId);
    });
    */

    for (i = 0; i < response.suggestions.length; i++) {
        geocodeByLocationId(response.suggestions[i].locationId);
    }

    //autocomplete(document.getElementById("auto-complete"), dropdown);

}
/**
 * Removes all H.map.Marker points from the map and adds closes the info bubble
 */
function clearOldSuggestions() {
    group.removeAll();
    if (bubble) {
        bubble.close();
    }
}

/**
 * Format the geocoding autocompletion repsonse object's data for display
 *
 * @param {Object} response
 */
function addSuggestionsToPanel(response) {
    var suggestions = document.getElementById('suggestions');
    suggestions.innerHTML = JSON.stringify(response.suggestions[0], null, ' ');
    //autocomplete(document.getElementById("auto-complete"), dropdown);
}


/*
var content =  '<strong style="font-size: large;">' + 'Geocoding Autocomplete'  + '</strong></br>';

content  += '<br/><input type="text" id="auto-complete" style="margin-left:5%; margin-right:5%; min-width:90%"  onkeyup="return autoCompleteListener(this, event);"><br/>';
content  += '<br/><strong>Response:</strong><br/>';
content  += '<div style="margin-left:5%; margin-right:5%;"><pre style="max-height:235px"><code  id="suggestions" style="font-size: small;">' +'{}' + '</code></pre></div>';
*/

//var content  = '<br/><input type="text" id="auto-complete" style="margin-left:5%; margin-right:5%; min-width:90%"  onkeyup="return autoCompleteListener(this, event);"><br/>';
//suggestionsContainer.innerHTML = content;

function displayMarker(locations, flag) {
    var marker;
    // Add a marker for each location found
    marker = new H.map.Marker({
        lat: locations[1],
        lng: locations[2]
    }, { volatility: true });

    marker.setData(locations[0]);
    group.addObject(marker);

    // disable the default draggability of the underlying map
    // and calculate the offset between mouse and target's position
    // when starting to drag a marker object:
    if (flag == true) {
        marker.draggable = true
        map.addEventListener('dragstart', function (ev) {
            var target = ev.target,
                pointer = ev.currentPointer;
            if (target instanceof H.map.Marker) {
                var targetPosition = map.geoToScreen(target.getGeometry());
                target['offset'] = new H.math.Point(pointer.viewportX - targetPosition.x, pointer.viewportY - targetPosition.y);
                behavior.disable();
            }
        }, false);


        // re-enable the default draggability of the underlying map
        // when dragging has completed
        map.addEventListener('dragend', function (ev) {
            var target = ev.target;
            if (target instanceof H.map.Marker) {
                behavior.enable();
                document.getElementsByName('lat')[0].value = target.b.lat ? target.b.lat : target.a.lat;
                document.getElementsByName('lon')[0].value = target.b.lng ? target.b.lng : target.a.lng;
                dragMarker();
            }
        }, false);

        // Listen to the drag event and move the position of the marker
        // as necessary
        map.addEventListener('drag', function (ev) {
            var target = ev.target,
                pointer = ev.currentPointer;
            if (target instanceof H.map.Marker) {
                target.setGeometry(map.screenToGeo(pointer.viewportX - target['offset'].x, pointer.viewportY - target['offset'].y));
            }
        }, false);

    }
    map.getViewModel().setLookAtData({
        bounds: group.getBoundingBox()
    });
    map.setZoom(16);
}


function autocomplete(inp, arr) {

    /*the autocomplete function takes two arguments,
    the text field element and an array of possible autocompleted values:*/
    var currentFocus;
    /*execute a function when someone writes in the text field:*/

    closeAllLists();
    var a, b, i, val = inp.value;
    /*close any already open lists of autocompleted values*/
    //if (!val) { return false;}
    currentFocus = -1;
    /*create a DIV element that will contain the items (values):*/
    a = document.createElement("DIV");
    a.setAttribute("id", inp.id + "autocomplete-list");
    a.setAttribute("class", "autocomplete-items");
    /*append the DIV element as a child of the autocomplete container:*/
    inp.parentNode.appendChild(a);
    /*for each item in the array...*/
    for (i = 0; i < arr.length; i++) {
        /*check if the item starts with the same letters as the text field value:*/
        //if (arr[i].substr(0, val.length).toUpperCase() == val.toUpperCase()) {
        /*create a DIV element for each matching element:*/
        b = document.createElement("DIV");
        /*make the matching letters bold:*/
        b.innerHTML = "<strong>" + arr[i][0] + ";" + "</strong>";
        b.innerHTML += "<p>" + arr[i][1] + ";" + arr[i][2] + "</p>";
        /*insert a input field that will hold the current array item's value:*/
        b.innerHTML += "<input type='hidden' value='" + arr[i][0] + "'>";
        /*execute a function when someone clicks on the item value (DIV element):*/
        b.setAttribute("data-adress", JSON.stringify(arr[i][3]));
        b.addEventListener("click", function (e) {
            /*insert the value for the autocomplete text field:*/
            clearOldSuggestions();
            //console.log(inp)
            var textvalue = this.getElementsByTagName("strong")[0].innerText + this.getElementsByTagName("p")[0].innerText;
            var data = textvalue.split(";");
            var adressData = this.getAttribute("data-adress");
            var jsonAdress = JSON.parse(adressData);
            //if (jsonAdress.HouseNumber != undefined) {
            inp.value = this.getElementsByTagName("input")[0].value;
            displayMarker(data);
            var lat = parseFloat(data[1]);
            var lon = parseFloat(data[2]);
            document.getElementsByName('lat')[0].value = lat;
            document.getElementsByName('lon')[0].value = lon;
            //var adressData=this.getElementsByTagName("input")[0].value;
            //console.log(adressData);
            document.getElementsByName('direccionData')[0].value = adressData;
            /*close the list of autocompleted values,
            (or any other open lists of autocompleted values:*/
            /*} else {
                alert('La dirección ingresada no posee numero');
                displayMarker(data);
                closeAllLists();
            }*/
        });
        a.appendChild(b);
        //}
    }

    /*execute a function presses a key on the keyboard:*/
    inp.addEventListener("keydown", function (e) {
        var x = document.getElementById(this.id + "autocomplete-list");
        if (x) x = x.getElementsByTagName("div");
        if (e.keyCode == 40) {
            /*If the arrow DOWN key is pressed,
            increase the currentFocus variable:*/
            currentFocus++;
            /*and and make the current item more visible:*/
            addActive(x);
        } else if (e.keyCode == 38) { //up
            /*If the arrow UP key is pressed,
            decrease the currentFocus variable:*/
            currentFocus--;
            /*and and make the current item more visible:*/
            addActive(x);
        } else if (e.keyCode == 13) {
            /*If the ENTER key is pressed, prevent the form from being submitted,*/
            e.preventDefault();
            if (currentFocus > -1) {
                /*and simulate a click on the "active" item:*/
                if (x) x[currentFocus].click();
            }
        }
    });

    function addActive(x) {
        /*a function to classify an item as "active":*/
        //if (!x) return false;
        /*start by removing the "active" class on all items:*/
        removeActive(x);
        if (currentFocus >= x.length) currentFocus = 0;
        if (currentFocus < 0) currentFocus = (x.length - 1);
        /*add class "autocomplete-active":*/
        x[currentFocus].classList.add("autocomplete-active");
    }

    function removeActive(x) {
        /*a function to remove the "active" class from all autocomplete items:*/
        for (var i = 0; i < x.length; i++) {
            x[i].classList.remove("autocomplete-active");
        }
    }

    function closeAllLists(elmnt) {
        /*close all autocomplete lists in the document,
        except the one passed as an argument:*/
        var x = document.getElementsByClassName("autocomplete-items");
        for (var i = 0; i < x.length; i++) {
            if (elmnt != x[i] && elmnt != inp) {
                x[i].parentNode.removeChild(x[i]);
            }
        }
    }
    /*execute a function when someone clicks in the document:*/
    document.addEventListener("click", function (e) {
        //let dataCheck = $("#checkDirec")[0].checked;
        closeAllLists(e.target);
    });
}