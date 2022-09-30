var AUTOCOMPLETION_URL =
    "https://autocomplete.geocoder.ls.hereapi.com/6.2/suggest.json",
  ajaxRequest = new XMLHttpRequest(),
  query = "";
var APIKEY = 'yKsNO9XriVmWrprNNiosXTalHQBu5SUyde4CwLoYJYQ';
var currentLatitude = null;
var currentLongitude = null;
function latLon() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function (position) {
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
  let proximity = "";
  if (proximity0) {
    proximity = "&prox=" + currentLatitude + "," + currentLongitude;
  }
  let queryText = textBox.value;
  if ((query != textBox.value || evento) && textBox.value.length >= 6) {
    /**
     * A full list of available request parameters can be found in the Geocoder Autocompletion
     * API documentation.
     *
     */
    var params =
      "?" +
      "query=" +
      encodeURIComponent(queryText) + // The search text which is the basis of the query
      "&beginHighlight=" +
      encodeURIComponent("<mark>") + //  Mark the beginning of the match in a token.
      "&endHighlight=" +
      encodeURIComponent("</mark>") + //  Mark the end of the match in a token.
      "&maxresults=4" + // The upper limit the for number of suggestions to be included
      "&country=ARG" +
      "&language=es" +
      proximity +
      // in the response.  Default is set to 5.
      "&apikey=" +
      APIKEY;
    ajaxRequest.open("GET", AUTOCOMPLETION_URL + params);
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
  clearOldSuggestions();
  //addSuggestionsToPanel(this.response);  // In this context, 'this' means the XMLHttpRequest itself.
  addSuggestionsToMap(this.response, dropdown);
}

/**
 * This function will be called if a communication error occurs during the XMLHttpRequest
 */
function onAutoCompleteFailed() {
  alert("Ooops!");
}

// Attach the event listeners to the XMLHttpRequest object
ajaxRequest.addEventListener("load", onAutoCompleteSuccess);
ajaxRequest.addEventListener("error", onAutoCompleteFailed);
ajaxRequest.responseType = "json";

/**
 * Boilerplate map initialization code starts below:
 */

// set up containers for the map  + panel
var mapContainer = document.getElementById("map"),
  suggestionsContainer = document.getElementById("panel");

// Now use the map as required...
window.onload = function () {
  moveMapToSantaFe(map);
  latLon();
};

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
      { content: "<small>" + text + "</small>" }
    );
    ui.addBubble(bubble);
  } else {
    bubble.setPosition(position);
    bubble.setContent("<small>" + text + "</small>");
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

      for (i = 0; i < locations.length; i++) {
        /*
            marker = new H.map.Marker({
                lat : locations[i].Location.DisplayPosition.Latitude,
                lng : locations[i].Location.DisplayPosition.Longitude
            });
            marker.setData(locations[i].Location.Address.Label);
            group.addObject(marker);
            */
        dropdown.push([
          locations[i].Location.Address.Label,
          locations[i].Location.DisplayPosition.Latitude,
          locations[i].Location.DisplayPosition.Longitude,
          locations[i].Location.Address,
        ]);
      }
      /*
        map.getViewModel().setLookAtData({
            bounds: group.getBoundingBox()
        });
        if(group.getObjects().length < 2){
            map.setZoom(15);
        }
        */
      autocomplete2(document.getElementById("auto-complete"), dropdown);
    },
    /**
     * This function will be called if a communication error occurs during the JSON-P request
     * @param  {Object} error  The error message received.
     */
    onGeocodeError = function (error) {
      alert("Ooops!");
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
        locationId: locationId,
      };
      /*
            geocoder.geocode(
                geocodingParameters,
                onGeocodeSuccess,
                onGeocodeError
            );
            */

      geocoder.geocode(geocodingParameters, onGeocodeSuccess, onGeocodeError);
    };

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

  //autocomplete2(document.getElementById("auto-complete"), dropdown);
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
  var suggestions = document.getElementById("suggestions");
  suggestions.innerHTML = JSON.stringify(response.suggestions[0], null, " ");
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

function displayMarker(locations) {
  var marker0;
  // Add a marker for each location found
  marker0 = new H.map.Marker(
    {
      lat: locations[1],
      lng: locations[2],
    },
    { volatility: true }
  );
  marker0.draggable = true;
  marker0.setData(locations[0]);
  group.addObject(marker0);

  map.getViewModel().setLookAtData({
    bounds: group.getBoundingBox(),
    zoom: 16,
  });

  group.addEventListener("tap", function (evt) {
    // event target is the marker itself, group is a parent event target
    // for all objects that it contains
    $("#ModalCenter").modal("show");
  });

  map.addEventListener(
    "dragstart",
    function (ev) {
      var target = ev.target,
        pointer = ev.currentPointer;
      if (target instanceof H.map.Marker) {
        var targetPosition = map.geoToScreen(target.getGeometry());
        target["offset"] = new H.math.Point(
          pointer.viewportX - targetPosition.x,
          pointer.viewportY - targetPosition.y
        );
        behavior.disable();
      }
    },
    false
  );

  // re-enable the default draggability of the underlying map
  // when dragging has completed
  map.addEventListener(
    "dragend",
    function (ev) {
      var target = ev.target;
      if (target instanceof H.map.Marker) {
        behavior.enable();
        document.getElementsByName("lat")[0].value = target.b.lat;
        document.getElementsByName("lon")[0].value = target.b.lng;
        dragMarker();
      }
    },
    false
  );

  // Listen to the drag event and move the position of the marker
  // as necessary
  map.addEventListener(
    "drag",
    function (ev) {
      var target = ev.target,
        pointer = ev.currentPointer;
      if (target instanceof H.map.Marker) {
        target.setGeometry(
          map.screenToGeo(
            pointer.viewportX - target["offset"].x,
            pointer.viewportY - target["offset"].y
          )
        );
      }
    },
    false
  );
}

function autocomplete2(inp, arr) {
  /*the autocomplete function takes two arguments,
    the text field element and an array of possible autocompleted values:*/
  var currentFocus;
  /*execute a function when someone writes in the text field:*/

  var a,
    b,
    i,
    val = inp.value;
  /*close any already open lists of autocompleted values*/
  closeAllLists();
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
      inp.value = this.getElementsByTagName("input")[0].value;
      var textvalue =
        this.getElementsByTagName("strong")[0].innerText +
        this.getElementsByTagName("p")[0].innerText;
      var data = textvalue.split(";");
      displayMarker(data);
      var lat = parseFloat(data[1]);
      var lon = parseFloat(data[2]);
      document.getElementsByName("lat")[0].value = lat;
      document.getElementsByName("lon")[0].value = lon;
      //var adressData=this.getElementsByTagName("input")[0].value;
      var adressData = this.getAttribute("data-adress");
      //console.log(adressData);
      document.getElementsByName("direccionData")[0].value = adressData;
      /*close the list of autocompleted values,
            (or any other open lists of autocompleted values:*/
      //closeAllLists();
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
    } else if (e.keyCode == 38) {
      //up
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
    if (currentFocus < 0) currentFocus = x.length - 1;
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
    closeAllLists(e.target);
  });
}

function LlenarFormulario(elemento) {
  var data = JSON.parse(elemento);
  //console.log(data);
  //var formInp = document.getElementsByTagName("input");
  var formInp = document.querySelectorAll(".form-control");
  //console.log(formInp2);

  data.lat = data.latitud;
  data.lon = data.longitud;
  //console.log(data);
  for (i = 0; i < formInp.length; i++) {
    var nameOfInput = formInp[i].getAttribute("name");
    if (nameOfInput == "direccion") {
      //formInp[i].value = data.calle + " " + data.numero + ", " + data.codigoPostal + " " + data.ciudad + ", " + data.pais;
      formInp[i].value = data[nameOfInput];
      var markerBox = formInp[i].value;
    } else if (nameOfInput == "direccionData") {
      var newDirection = {
        Street: data.calle,
        HouseNumber: data.numero,
        City: data.ciudad,
        State: data.provincia,
        Country: data.pais,
        PostalCode: data.codigoPostal,
      };
      formInp[i].value = JSON.stringify(newDirection);
    } else if (nameOfInput == "idDireccion") {
      formInp[i].value = data.idDireccion;
    } else {
      formInp[i].value = data[nameOfInput];
    }
  }
  var oldDir = document.getElementsByName("OldDireccionData");
  oldDir[0].value = elemento;
  //console.log(document.getElementsByName('OldDireccionData')[0].value);
  //document.getElementsByName("clienteModificar")[0].value = JSON.stringify(data);
  clearOldSuggestions(); // funciones en el script autocomplete.js
  displayMarker([markerBox, data.lat, data.lon]); // funciones en el script autocomplete.js
}

function DoChangesDB() {
  var queryString = JSON.parse(
    document.getElementsByName("OldDireccionData")[0].value
  );
  var obsNew = document.getElementById("observacion").value;
  if (obsNew == "") {
    obsNew = null;
  }
  if (queryString.observacion == "") {
    queryString.observacion = null;
  }
  var latLonOld = [
    queryString.latitud,
    queryString.longitud,
    queryString.observacion,
    queryString.direccion,
  ];
  var latLonNew = [
    document.getElementsByName("lat")[0].value,
    document.getElementsByName("lon")[0].value,
    obsNew,
    $("#auto-complete")[0].value,
  ];
  //console.log([latLonOld, latLonNew]);
  if (JSON.stringify(latLonOld) != JSON.stringify(latLonNew)) {
    $("#alerta").text("¿ Esta seguro de realizar los cambios en el Cliente ?");
    $("#alerta").removeClass();
    $("#alerta").addClass("alert alert-primary");
    $("#btn-confirm").removeAttr("data-dismiss");
    $("#btn-confirm").attr("onclick", "DoAjaxChanges();");
    $("#modalAlert").modal("toggle");
    $(".alert").alert();
  } else {
    $("#alerta").text("No se realizaron cambios");
    $("#alerta").removeClass();
    $("#alerta").addClass("alert alert-warning");
    $("#btn-confirm").removeAttr("onclick");
    $("#btn-confirm").attr("data-dismiss", "modal");
    $("#modalAlert").modal("toggle");
    $(".alert").alert();
  }
}

function DoAjaxChanges() {
  $("#alertFoot").css("display", "none");
  $("#spinner").css("display", "block");
  $("#alerta").text("Espere...");
  $("#alerta").removeClass();
  $.ajax({
    method: "POST",
    url: "/itinerarios/modificar",
    data: $("#newDirection").serialize(),
  })
    .done(function () {
      var newData = $("#newDirection").serializeArray();
      var dataChange = {};
      for (let i = 0; i < newData.length; i++) {
        if (isJson(newData[i].value)) {
          dataChange[newData[i].name] = JSON.parse(newData[i].value);
        } else {
          dataChange[newData[i].name] = newData[i].value;
        }
      }
      var NewDirection = JSON.parse(
        document.getElementsByName("OldDireccionData")[0].value
      );

      NewDirection.calle = dataChange.direccionData.Street;
      NewDirection.numero = dataChange.direccionData.HouseNumber;
      NewDirection.ciudad = dataChange.direccionData.City;
      NewDirection.provincia = dataChange.direccionData.State;
      NewDirection.pais = dataChange.direccionData.Country;
      NewDirection.codigoPostal = dataChange.direccionData.PostalCode;
      NewDirection.latitud = dataChange.lat.toString();
      NewDirection.longitud = dataChange.lon.toString();
      NewDirection.observacion = dataChange.observacion;
      NewDirection.direccion = $("#auto-complete")[0].value;
      document.getElementsByName("OldDireccionData")[0].value = JSON.stringify(
        NewDirection
      );
      addClone(JSON.stringify(NewDirection));
      $("#option" + NewDirection.idDireccion).attr(
        "data-latLon",
        JSON.stringify(NewDirection)
      );
      //$("#title" + NewDirection.idDireccion).text(NewDirection.calle + " " + NewDirection.numero);
      $("#title" + NewDirection.idDireccion).text(
        $("#auto-complete")[0].value.split(",")[0]
      );
      $("#dataProv" + NewDirection.idDireccion).text(NewDirection.provincia);
      $("#btn-confirm").removeAttr("onclick");
      $("#btn-confirm").attr("data-dismiss", "modal");
      $("#alerta").text("Los cambios fueron efectuados correctamente");
      $("#alerta").removeClass();
      $("#alerta").addClass("alert alert-success");
      $("#spinner").css("display", "none");
      $("#alertFoot").css("display", "block");
      //$('#modalAlert').modal('toggle');
      //$('.alert').alert();
    })
    .fail(function () {
      $("#btn-confirm").removeAttr("onclick");
      $("#btn-confirm").attr("data-dismiss", "modal");
      $("#alerta").text(
        "Ha ocurrido un error y no se han modificado los datos"
      );
      $("#alerta").removeClass();
      $("#alerta").addClass("alert alert-danger");
      $("#spinner").css("display", "none");
      $("#alertFoot").css("display", "block");
      //$('#modalAlert').modal('toggle');
      //$('.alert').alert();
    });
}

function isJson(str) {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
}

function llenarVentas() {
  var ventas = JSON.parse($("#ventasData").attr("data-ventas"));
  var productos = JSON.parse($("#ventasData").attr("data-ventas"));
  var clientes = $(".clientes input");
  var pedidos = [];
  var total = 0;
  for (let k = 0; k < ventas.length; k++) {
    pedidos.push(ventas[k].idpedido);
  }

  var idpedidos = pedidos.filter(onlyUnique);
  var hoy = new Date().toLocaleString().split(" ")[0];
  for (let i = 0; i < clientes.length; i++) {
    var venta_cliente = [];
    var orden_venta = [];
    var orden_no_venta = [];
    var idCliente = parseInt(
      JSON.parse(clientes[i].getAttribute("data-latLon")).idClientes
    );
    var idDireccion = parseInt(
      JSON.parse(clientes[i].getAttribute("data-latLon")).idDireccion
    );
    var j = 0;
    while (j < idpedidos.length) {
      venta_cliente = ventas.filter(
        (sale) =>
          sale.idpedido == idpedidos[j] && sale.clientes_idClientes == idCliente
      );
      if (venta_cliente.length != 0) {
        orden_venta.push(venta_cliente);
      }
      j += 1;
    }
    if (orden_venta.length > 0) {
      //clientes[i].setAttribute("data-venta", JSON.stringify(orden_venta));
      $("#breakSale" + idDireccion).css({
        height: "5px",
        width: "85%",
        "border-radius": "3px",
        "background-color": "#54e0c7",
      });
      $("#infoSale" + idDireccion).css("color", "#54e0c7");
      //$('#infoSale' + idDireccion)[0].innerText = "Hoy se realizaron " + orden_venta.length + " ventas";
      $("#infoSale" + idDireccion)[0].innerText = "";
      var newButtons = "";
      var flagV = 0;
      var flagNV = 0;
      var fecha = "";
      for (let k = 0; k < orden_venta.length; k++) {
        var fecha0 = new Date(orden_venta[k][0].fechatime)
          .toLocaleString()
          .split(" ")[0];
        fecha = fecha0.split("/");
        if (orden_venta[k][0].causa == "-") {
          if (fecha0 == hoy) {
            flagV += 1;
            total += orden_venta[k][0].total;
          }
          newButtons +=
            "<a onclick=viewSale(this.getAttribute('data-venta')) data-venta=" +
            JSON.stringify(orden_venta[k]) +
            " role='button' class='btn btn-success btn-sm mx-1 p-0'><span style='color:white'>" +
            fecha[0] +
            "/" +
            fecha[1] +
            "</span></a>";
        } else {
          if (fecha0 == hoy) {
            flagNV += 1;
          }
          newButtons +=
            "<a data-venta=" +
            JSON.stringify(orden_venta[k]) +
            " role='button' class='btn btn-danger btn-sm mx-1 p-0'><span style='color:white'>" +
            fecha[0] +
            "/" +
            fecha[1] +
            "</span></a>";
        }
      }
      if (flagNV > 0) {
        $("#svg" + idDireccion).css({
          "background-color": "#8B0000",
          "border-radius": "50%",
          border: "3px solid #8B0000",
        });
        $("#svg" + idDireccion)[0].children[0].setAttribute("fill", "black");
        $("#inputGroup" + idDireccion).css({ "background-color": "#FF0000" });
      } else if (flagV > 0) {
        $("#svg" + idDireccion).css({
          "background-color": "#54e0c7",
          "border-radius": "50%",
          border: "3px solid #54e0c7",
        });
        $("#svg" + idDireccion)[0].children[0].setAttribute("fill", "black");
        $("#inputGroup" + idDireccion).css({ "background-color": "green" });
      }
      $("#infoSale" + idDireccion).after(
        "<div id=" +
          "buttonGroup" +
          idDireccion +
          ' class="text-center my-1">' +
          '<small style="color:#d1d7dc">Ultimas visitas:</small>' +
          newButtons +
          "</div>"
      );
      window.total = total;
      $("#recaudacionTotal").text(priceFormatter(total));
    } else {
      $("#breakSale" + idDireccion).css({
        height: "5px",
        "border-radius": "3px",
        "background-color": "#e7b416",
      });
      $("#infoSale" + idDireccion).css("color", "#e7b416");
      $("#infoSale" + idDireccion)[0].innerText =
        "No se han llevado a cabo ventas en el día";
    }
  }
}

function onlyUnique(value, index, self) {
  return self.indexOf(value) === index;
}

function viewSale(data) {
  var dataSale = JSON.parse(data);
  giveBackOnlyClient(
    $(
      "input[data-cliente=" + dataSale[0].clientes_idClientes + "]"
    )[0].getAttribute("data-latLon")
  );
  [fecha, hora] = getDateTime(dataSale[0].fechatime);
  $("#date-input")[0].value = fecha;
  $("#time-input")[0].value = hora;
  $("#saleProduct").addClass("d-none");
  $("#date-input").attr("disabled", true);
  $("#time-input").attr("disabled", true);
  $("#toolbar").addClass("d-none");
  $("#saleFoot").addClass("d-none");
  //console.log(dataSale);
  var oldData = $table.bootstrapTable("getData");
  var newId = 0;
  var dataProd0 = JSON.parse($("#Prod").attr("data-prod"));
  if (oldData.length != 0) {
    newId = parseInt(oldData[0].id) + 1;
  }
  for (let i = 0; i < dataSale.length; i++) {
    var idProd = dataSale[i].idproductos;
    var prodSale = getProdData(idProd, dataProd0);

    $table.bootstrapTable("insertRow", {
      index: 0,
      row: {
        id: newId,
        name: prodSale[0].nombre,
        pu: dataSale[i].importe / dataSale[i].cantidad,
        cantidad: dataSale[i].cantidad,
        importe: dataSale[i].importe,
        idproductos: prodSale[0].idproductos,
        idarticulo: prodSale[0].idarticulo,
      },
    });
    newId += 1;
  }

  $("#ModalCenterSale").modal("show");
}

function getProdData(code, data) {
  return data.filter(function (data) {
    return data.idproductos == code;
  });
}

function addClone(dataDir) {
  var dataLatLon = JSON.parse(dataDir);
  $("#clientRowInfo").removeClass("d-none");
  //$('#titleAll')[0].textContent = dataLatLon.calle + " " + dataLatLon.numero
  $("#titleAll")[0].textContent = dataLatLon.direccion.split(",")[0];
  $("#optionAll")[0].setAttribute("data-latLon", dataDir);
  $("#optionAll")[0].setAttribute("data-cliente", dataLatLon.idClientes);
  $("#nombre_Cod")[0].textContent =
    dataLatLon.nombre + " | Cod. " + dataLatLon.codigo;
  if ($("#buttonGroupAll").length != 0) {
    $("#buttonGroupAll").remove();
  }
  var svgIcon = document.getElementById("svg" + dataLatLon.idDireccion);
  var svgCln = svgIcon.cloneNode(true);
  svgCln.setAttribute("id", "svgAll");
  $("#svgAll").replaceWith(svgCln);
  $("#svgAll")[0].children[0].setAttribute("fill", "black");
  if ($("#buttonGroup" + dataLatLon.idDireccion).length != 0) {
    $("#breakSaleAll").css({
      height: "5px",
      width: "85%",
      "border-radius": "3px",
      "background-color": "#54e0c7",
    });
    $("#infoSaleAll").css("color", "#54e0c7");
    //$('#infoSale' + idDireccion)[0].innerText = "Hoy se realizaron " + orden_venta.length + " ventas";
    $("#infoSaleAll")[0].innerText = "";
    var itm = document.getElementById("buttonGroup" + dataLatLon.idDireccion);
    var cln = itm.cloneNode(true);

    cln.setAttribute("id", "buttonGroupAll");
    $("#infoSaleAll").after(cln);
    //$('#svgAll').css({ "background-color": "#54e0c7", "border-radius": "50%", "border": "3px solid #54e0c7" });
    //($('#svgAll')[0].children[0]).setAttribute("fill", "black");
    $("#buttonGroupAll small").first().css({ color: "black" });
    $("#buttonGroupAll a").removeClass("btn-dark");
    $("#buttonGroupAll a").addClass("btn-info");
    $("#buttonGroupAll span").css({ color: "black" });
  } else {
    $("#svgAll").attr("style", "");
    $("#svgAll")[0].children[0].setAttribute("fill", "black");
    $("#breakSaleAll").css({
      height: "5px",
      "border-radius": "3px",
      "background-color": "black",
    });
    $("#infoSaleAll").css("color", "black");
    $("#infoSaleAll")[0].innerText =
      "No se han llevado a cabo ventas en el día";
  }
}
//document.getElementById("clientRowCardBody").appendChild(newElemento);

function generarTotal() {
  var ventas = JSON.parse($("#ventasData").attr("data-ventas"));
  console.log(ventas);
}
