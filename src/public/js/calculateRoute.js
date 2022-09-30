/**
 * Calculates and displays a car route from the Brandenburg Gate in the centre of Berlin
 * to Friedrichstraße Railway Station.
 *
 * A full list of available request parameters can be found in the Routing API documentation.
 * see:  http://developer.here.com/rest-apis/documentation/routing/topics/resource-calculate-route.html
 *
 * @param   {H.service.Platform} platform    A stub class to access HERE services
 */

var APIKEY = 'yKsNO9XriVmWrprNNiosXTalHQBu5SUyde4CwLoYJYQ';
/*calculateRouteFromAtoB(this.checked,this.getAttribute('data-latLon'),this.parentNode.nextElementSibling.children[0].getAttribute('data-latLon'))*/
function calculateRouteFromAtoB(ischecked, origen, destino) {
    clearOldSuggestions();
    //console.log(origen,destino);
    if (ischecked == true) {
        var dataOrigen = JSON.parse(origen);
        var dataDestino = JSON.parse(destino);
        var latLonOrigen = dataOrigen.latitud + "," + dataOrigen.longitud;
        var latLonDestino = dataDestino.latitud + "," + dataDestino.longitud;
        var router = platform.getRoutingService(),
            routeRequestParams = {
                mode: 'fastest;car',
                representation: 'display',
                routeattributes: 'waypoints,summary,shape,legs',
                maneuverattributes: 'direction,action',
                waypoint0: latLonOrigen, // Brandenburg Gate
                waypoint1: latLonDestino, // Friedrichstraße Railway Station
                orden: dataOrigen.orden
            };
        router.calculateRoute(
            routeRequestParams,
            onSuccess,
            onError
        );
    } else {

    }
}
/**
 * This function will be called once the Routing REST API provides a response
 * @param  {Object} result          A JSONP object representing the calculated route
 *
 * see: http://developer.here.com/rest-apis/documentation/routing/topics/resource-type-calculate-route.html
 */
function onSuccess(result) {
    var route = result.response.route[0];
    /*
     * The styling of the route response on the map is entirely under the developer's control.
     * A representitive styling can be found the full JS + HTML code of this example
     * in the functions below:
     */
    addRouteShapeToMap(route);
    addManueversToMap(route);

    addWaypointsToPanel(route.waypoint);
    addManueversToPanel(route);
    addSummaryToPanel(route.summary);
    // ... etc.
}

/**
 * This function will be called if a communication error occurs during the JSON-P request
 * @param  {Object} error  The error message received.
 */
function onError(error) {
    alert('Can\'t reach the remote server');
}

/**
 * Boilerplate map initialization code starts below:
 */
/*
// set up containers for the map  + panel
var mapContainer = document.getElementById('map'),
  routeInstructionsContainer = document.getElementById('panel');
 
//Step 1: initialize communication with the platform
// In your own code, replace variable window.apikey with your own apikey
var platform = new H.service.Platform({
  apikey: APIKEY
});
 
var defaultLayers = platform.createDefaultLayers();
 
//Step 2: initialize a map - this map is centered over Berlin
var map = new H.Map(mapContainer,
  defaultLayers.vector.normal.map,{
  center: {lat:52.5160, lng:13.3779},
  zoom: 13,
  pixelRatio: window.devicePixelRatio || 1
});
// add a resize listener to make sure that the map occupies the whole container
window.addEventListener('resize', () => map.getViewPort().resize());
 
//Step 3: make the map interactive
// MapEvents enables the event system
// Behavior implements default interactions for pan/zoom (also on mobile touch environments)
var behavior = new H.mapevents.Behavior(new H.mapevents.MapEvents(map));
 
// Create the default UI components
var ui = H.ui.UI.createDefault(map, defaultLayers);
 
// Hold a reference to any infobubble opened
var bubble;
*/


/**
 * Opens/Closes a infobubble
 * @param  {H.geo.Point} position     The location on the map.
 * @param  {String} text              The contents of the infobubble.
 */
function openBubble(position, text) {
    if (!bubble) {
        bubble = new H.ui.InfoBubble(
            position,
            // The FO property holds the province name.
            { content: text });
        ui.addBubble(bubble);
    } else {
        bubble.setPosition(position);
        bubble.setContent(text);
        bubble.open();
    }
}


/**
 * Creates a H.map.Polyline from the shape of the route and adds it to the map.
 * @param {Object} route A route as received from the H.service.RoutingService
 */
function addRouteShapeToMap(route) {
    var lineString = new H.geo.LineString(),
        routeShape = route.shape,
        polyline;

    routeShape.forEach(function(point) {
        var parts = point.split(',');
        lineString.pushLatLngAlt(parts[0], parts[1]);
    });

    polyline = new H.map.Polyline(lineString, {
        style: {
            lineWidth: 10,
            fillColor: 'white',
            strokeColor: 'rgba(0, 128, 255, 0.7)',
            lineDash: [0, 2],
            lineTailCap: 'arrow-tail',
            lineHeadCap: 'arrow-head'
        }
    });
    // Add the polyline to the map
    group.addObject(polyline);
    // And zoom to its bounding rectangle
    map.getViewModel().setLookAtData({
        bounds: group.getBoundingBox()
    });
}


/**
 * Creates a series of H.map.Marker points from the route and adds them to the map.
 * @param {Object} route  A route as received from the H.service.RoutingService
 */

function addManueversToMap(route) {
    var base = new H.map.Icon('https://img.icons8.com/dusk/40/000000/manufacturing.png'),
        deliver = new H.map.Icon('https://img.icons8.com/ios-filled/40/000000/order-on-the-way.png'),
        i,
        j;
    //alert(route.leg[0].maneuver.length);
    // Add a marker for each maneuver
    /*
    for (i = 0;  i < route.leg.length; i++) {
      for (j = 0;  j < route.leg[i].maneuver.length; j++) {
        // Get the next maneuver.
        maneuver = route.leg[i].maneuver[j];
        // Add a marker to the maneuvers group
        var marker =  new H.map.Marker({
          lat: maneuver.position.latitude,
          lng: maneuver.position.longitude});
        marker.instruction = maneuver.instruction;
        group.addObject(marker);
      }
    }
    */
    var useIconStart;
    var useIconEnd;
    if (route.waypoint[0].linkId == "-806645546") {
        useIconStart = base;
        useIconEnd = deliver;
    } else if (route.waypoint[1].linkId == "+806645546") {
        useIconStart = deliver;
        useIconEnd = base;
    } else {
        //useIconStart = iconRealTime;
        useIconStart = deliver;
        useIconEnd = deliver;
    }
    for (i = 0; i < route.leg.length; i++) {
        //for (j = 0;  j < route.leg[i].maneuver.length; j++) {
        // Get the next maneuver.
        maneuver = route.leg[i].maneuver[0];
        // Add a marker to the maneuvers group
        var marker = new H.map.Marker({
            lat: maneuver.position.latitude,
            lng: maneuver.position.longitude
        }, { icon: useIconStart });
        marker.instruction = maneuver.instruction;
        group.addObject(marker);

        maneuver = route.leg[i].maneuver[route.leg[i].maneuver.length - 1];
        // Add a marker to the maneuvers group
        var marker = new H.map.Marker({
            lat: maneuver.position.latitude,
            lng: maneuver.position.longitude
        }, { icon: useIconEnd });
        marker.instruction = maneuver.instruction;
        group.addObject(marker);
        //}
    }
    group.addEventListener('tap', function(evt) {
        map.setCenter(evt.target.getGeometry());
        openBubble(
            evt.target.getGeometry(), evt.target.instruction);
    }, false);

    // Add the maneuvers group to the map
    map.addObject(group);
}


/**
 * Creates a series of H.map.Marker points from the route and adds them to the map.
 * @param {Object} route  A route as received from the H.service.RoutingService
 */
function addWaypointsToPanel(waypoints) {



    var nodeH3 = document.createElement('h3'),
        waypointLabels = [],
        i;


    for (i = 0; i < waypoints.length; i += 1) {
        waypointLabels.push(waypoints[i].label)
    }

    nodeH3.textContent = waypointLabels.join(' - ');

    //routeInstructionsContainer.innerHTML = '';
    //routeInstructionsContainer.appendChild(nodeH3);
}

/**
 * Creates a series of H.map.Marker points from the route and adds them to the map.
 * @param {Object} route  A route as received from the H.service.RoutingService
 */
function addSummaryToPanel(summary) {
    var summaryDiv = document.createElement('div'),
        content = '';
    content += 'Total distance: ' + summary.distance + 'm.';
    content += 'Travel Time: ' + summary.travelTime.toMMSS() + ' (in current traffic)';


    summaryDiv.style.fontSize = 'small';
    summaryDiv.style.marginLeft = '5%';
    summaryDiv.style.marginRight = '5%';
    summaryDiv.innerHTML = content;
    //routeInstructionsContainer.appendChild(summaryDiv);
}

/**
 * Creates a series of H.map.Marker points from the route and adds them to the map.
 * @param {Object} route  A route as received from the H.service.RoutingService
 */
function addManueversToPanel(route) {



    var nodeOL = document.createElement('ol'),
        i,
        j;

    nodeOL.style.fontSize = 'small';
    nodeOL.style.marginLeft = '5%';
    nodeOL.style.marginRight = '5%';
    nodeOL.className = 'directions';

    // Add a marker for each maneuver
    for (i = 0; i < route.leg.length; i += 1) {
        for (j = 0; j < route.leg[i].maneuver.length; j += 1) {
            // Get the next maneuver.
            maneuver = route.leg[i].maneuver[j];

            var li = document.createElement('li'),
                spanArrow = document.createElement('span'),
                spanInstruction = document.createElement('span');

            spanArrow.className = 'arrow ' + maneuver.action;
            spanInstruction.innerHTML = maneuver.instruction;
            li.appendChild(spanArrow);
            li.appendChild(spanInstruction);

            nodeOL.appendChild(li);
        }
    }

    //routeInstructionsContainer.appendChild(nodeOL);
}


Number.prototype.toMMSS = function() {
    return Math.floor(this / 60) + ' minutes ' + (this % 60) + ' seconds.';
}

// Now use the map as required...
//calculateRouteFromAtoB(platform);