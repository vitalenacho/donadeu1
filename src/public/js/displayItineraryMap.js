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

 function displayRoutes(dataSet) {
     clearOldSuggestions();
     //console.log(origen,destino);
 
     var router = platform.getRoutingService(),
         routeRequestParams = {
             mode: 'shortest;car;traffic:enabled',
             representation: 'display',
             routeattributes: 'waypoints,summary,shape,legs',
             maneuverattributes: 'direction,action',
             waypoint0: "-31.600365,-60.708382", // ORIGEN
             //waypointi: latLonDestino  // DESTINO
         };
     var destinos = JSON.parse(dataSet);
     for (let i = 0; i < destinos.length; i++) {
         var data = destinos[i];
         routeRequestParams["waypoint" + (i + 1)] = data.latitud + "," + data.longitud;
     }
     window.destinos = destinos;
     routeRequestParams["waypoint" + (destinos.length + 1)] = routeRequestParams.waypoint0;
     //console.log(routeRequestParams);
     //console.log(routeRequestParams);
     if (destinos.length > 1) {
         router.calculateRoute(
             routeRequestParams,
             onSuccess,
             onError
         )
     };
 
 }
 
 
 function displayMarkers(dataSet){
     clearOldSuggestions();
 
     var destinos = JSON.parse(dataSet);
         //Create the svg mark-up
     svgMarker = `
     <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32">
         <circle cursor="pointer" cy=16 cx=16 r="13" stroke="#696969" stroke-width="3" fill="replaceColor" />
         <text cursor="pointer" x="50%" y="50%" text-anchor="middle" fill="white" font-family: 'Oswald' font-size="16px" dy=".3em">dataReplace</text>
     </svg>
     `.trim();
     window.destinos = destinos;
     if (destinos.length > 1) {
         for (let i = 0; i < destinos.length; i++) {
             if(destinos[i].latitud != 0){
                 if (destinos[i].items == 0) {
                     //deliverNoSale = new H.map.DomIcon(svgMarkerNoSale.replace("dataReplace", i + 1).replace("replaceColor", "	#d9534f"));
                     deliverNoSale = new H.map.DomIcon(svgMarker.replace("dataReplace", i + 1).replace("replaceColor", "	#d9534f"));
                     var useIcon = deliverNoSale;
                 } else {
                     //deliverNoSale = new H.map.DomIcon(svgMarkerNoSale.replace("dataReplace", i + 1).replace("replaceColor", "#5cb85c"));
                     deliverNoSale = new H.map.DomIcon(svgMarker.replace("dataReplace", i + 1).replace("replaceColor", "#5cb85c"));
                     var useIcon = deliverNoSale;
                 }
                 var dataSale = JSON.stringify(destinos[i]);
                 var marker = new H.map.DomMarker({
                     lat: destinos[i].latitud,
                     lng: destinos[i].longitud
                 }, { icon: useIcon });
                 marker.dataSale = dataSale;
                 
                 group.addObject(marker);
 
                 map.getViewModel().setLookAtData({
                     bounds: group.getBoundingBox()
                 });
 
                 
             }
         }
         group.addEventListener('tap', function (evt) {
             map.setCenter(evt.target.getGeometry());
             viewSale(evt.target.dataSale);
         }, false);
         // Add the maneuvers group to the map
         map.addObject(group);
         map.setZoom(map.getZoom()-0.1)
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
 
     //addWaypointsToPanel(route.waypoint);
     //addManueversToPanel(route);
     addSummaryToPanel(route.summary);
     // ... etc.
 }
 
 /**
  * This function will be called if a communication error occurs during the JSON-P request
  * @param  {Object} error  The error message received.
  */
 function onError(error) {
     if(error == "NGEO_ERROR_ROUTE_NO_END_POINT"){
         alert("Hay ventas sin datos de latitud | longitud");
     } else {
         alert('Can\'t reach the remote server');
     }
     
 }
 
 /**
  * Boilerplate map initialization code starts below:
  */
 
 
 // set up containers for the map  + panel
 var mapContainer = document.getElementById('map'),
     routeInstructionsContainer = document.getElementById('panel');
 
 //Step 1: initialize communication with the platform
 // In your own code, replace variable window.apikey with your own apikey
 //Step 1: initialize communication with the platform
 var APIKEY = '0XJwbo2Q-sEDOPF5fk27JywrgA3WuKimWP5SXrNb188';
 
 var platform = new H.service.Platform({
     apikey: APIKEY,
     useCIT: false,
     useHTTPS: true
 });
 var defaultLayers = platform.createDefaultLayers();
 var group = new H.map.Group();
 
 /*
 group.addEventListener('tap', function (evt) {
     map.setCenter(evt.target.getGeometry());
     openBubble(
         evt.target.getGeometry(), evt.target.getData());
 }, false);
 */
 
 
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
 
 
 function moveMapToSantaFe(map) {
     map.setCenter({ lat: -31.6333294, lng: -60.7000008 });
     map.setZoom(13);
 }
 // Hold a reference to any infobubble opened
 var bubble;
 
 
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
 
 
 function clearOldSuggestions() {
     group.removeAll();
     if (bubble) {
         bubble.close();
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
 
     routeShape.forEach(function (point) {
         var parts = point.split(',');
         lineString.pushLatLngAlt(parts[0], parts[1]);
     });
 
     polyline = new H.map.Polyline(lineString, {
         style: {
             lineWidth: 10,
             fillColor: 'black',
             strokeColor: 'rgba(0, 128, 255, 1)',
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
     var base = new H.map.Icon('https://img.icons8.com/dusk/25/000000/manufacturing.png'),
         //deliverSale = new H.map.DomIcon('https://img.icons8.com/ios-filled/25/000000/order-on-the-way.png'),
         svgMarkerNoSale = '<svg width="24" height="24" ' +
             'xmlns="http://www.w3.org/2000/svg">' +
             '<rect stroke="white" fill="replaceColor" x="1" y="1" width="22" ' +
             'height="22" /><text x="12" y="18" font-size="12pt" ' +
             'font-family="Arial" font-weight="bold" text-anchor="middle" ' +
             'fill="white">dataReplace</text></svg>',
         i,
         j,
         svgMarker = `
     <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32">
         <circle cursor="pointer" cy=16 cx=16 r="13" stroke="#696969" stroke-width="3" fill="replaceColor" />
         <text cursor="pointer" x="50%" y="50%" text-anchor="middle" fill="white" font-family: 'Oswald' font-size="16px" dy=".3em">dataReplace</text>
     </svg>
 `.trim();;
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
     maneuver = route.leg[0].maneuver[0];
     // Add a marker to the maneuvers group
     var marker = new H.map.Marker({
         lat: maneuver.position.latitude,
         lng: maneuver.position.longitude
     }, { icon: base });
     var destinos = window.destinos;
     marker.instruction = maneuver.instruction;
     group.addObject(marker);
     for (i = 0; i < route.leg.length; i++) {
 
         //for (j = 0;  j < route.leg[i].maneuver.length; j++) {
         // Get the next maneuver.
         /*
         maneuver = route.leg[i].maneuver[0];
         // Add a marker to the maneuvers group
         var marker = new H.map.Marker({
             lat: maneuver.position.latitude,
             lng: maneuver.position.longitude
         }, { icon: base });
         marker.instruction = maneuver.instruction;
         group.addObject(marker);
         */
 
         maneuver = route.leg[i].maneuver[route.leg[i].maneuver.length - 1];
         // Add a marker to the maneuvers group
         //var svgMarkup = '<svg width="24" height="24"xmlns="http://www.w3.org/2000/svg"><rect stroke="white" fill="#1b468d" x="1" y="1" width="22" height="22" /><text x="12" y="18" font-size="12pt" font-family="Arial" font-weight="bold" text-anchor="middle"fill="white">' + i + '</text></svg>';
         //var nextPoint = new H.map.DomIcon(svgMarkup);
 
         if (i + 1 == route.leg.length) {
             var useIcon = base;
             var dataSale = "";
             var marker = new H.map.Marker({
                 lat: maneuver.position.latitude,
                 lng: maneuver.position.longitude
             }, { icon: useIcon });
             marker.instruction = maneuver.instruction;
             marker.dataSale = dataSale;
         } else {
             if (destinos[i].items == 0) {
                 //deliverNoSale = new H.map.DomIcon(svgMarkerNoSale.replace("dataReplace", i + 1).replace("replaceColor", "	#d9534f"));
                 deliverNoSale = new H.map.DomIcon(svgMarker.replace("dataReplace", i + 1).replace("replaceColor", "	#d9534f"));
                 var useIcon = deliverNoSale;
             } else {
                 //deliverNoSale = new H.map.DomIcon(svgMarkerNoSale.replace("dataReplace", i + 1).replace("replaceColor", "#5cb85c"));
                 deliverNoSale = new H.map.DomIcon(svgMarker.replace("dataReplace", i + 1).replace("replaceColor", "#5cb85c"));
                 var useIcon = deliverNoSale;
             }
             var dataSale = JSON.stringify(destinos[i]);
             var marker = new H.map.DomMarker({
                 lat: maneuver.position.latitude,
                 lng: maneuver.position.longitude
             }, { icon: useIcon });
             marker.instruction = maneuver.instruction;
             marker.dataSale = dataSale;
         }
 
         group.addObject(marker);
         //}
     }
     /*
     group.addEventListener('tap', function (evt) {
         map.setCenter(evt.target.getGeometry());
         openBubble(
             //evt.target.getGeometry(), evt.target.instruction);
             evt.target.getGeometry(), evt.target.dataSale);
     }, false);
     */
     group.addEventListener('tap', function (evt) {
         map.setCenter(evt.target.getGeometry());
         viewSale(evt.target.dataSale);
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
 
     routeInstructionsContainer.innerHTML = '';
     routeInstructionsContainer.appendChild(nodeH3);
 }
 
 /**
  * Creates a series of H.map.Marker points from the route and adds them to the map.
  * @param {Object} route  A route as received from the H.service.RoutingService
  */
 function addSummaryToPanel(summary) {
     $("#panel").empty();
     var summaryDiv = document.createElement('div'),
         content = '';
     content += '<div class="col"><b>Distancia Recurrida:</b> ' + summary.distance / 1000 + ' km.</div>';
     content += '<div class="col"><b>Tiempo de Viaje:</b> ' + summary.travelTime.toHHMMSS() + '</div>';
 
 
     summaryDiv.className = 'row w-100 text-center';
     summaryDiv.innerHTML = content;
     routeInstructionsContainer.appendChild(summaryDiv);
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
 
     routeInstructionsContainer.appendChild(nodeOL);
 }
 
 
 Number.prototype.toMMSS = function () {
     return Math.floor(this / 60) + ' minutes ' + (this % 60) + ' seconds.';
 }
 
 Number.prototype.toHHMMSS = function () {
     return Math.floor(this / 3600) + ' hs. ' + Math.ceil(((this / 3600) - Math.floor(this / 3600)) * 60) + ' min ';
 }
 
   // Now use the map as required...
   //calculateRouteFromAtoB(platform);
 