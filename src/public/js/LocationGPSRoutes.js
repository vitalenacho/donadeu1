function getLocation(dataEnter) {
  if (navigator.geolocation) {
    //console.log("es por aca");
    if (dataEnter == "Venta") {
      navigator.geolocation.getCurrentPosition(showPosition);
    } else {
      navigator.geolocation.getCurrentPosition(showPositionWithMarker);
    }
  } else {
    console.log("Geolocation is not supported by this browser.");
  }
}

function showPositionWithMarker(position) {
  clearOldSuggestions();
  var lat = position.coords.latitude;
  var lon = position.coords.longitude;
  //displayMarker([0, lat, lon]);
  document.getElementsByName("lat")[0].value = parseFloat(lat);
  document.getElementsByName("lon")[0].value = parseFloat(lon);
  map.getViewPort().resize();

  // Get an instance of the search service:
  var geocoder = platform.getGeocodingService(),
    parameters = {
      prox: lat + "," + lon + ",250",
      mode: "retrieveAddresses",
      maxresults: "1",
      gen: "9",
    };

  // Call the reverse geocode method with the geocoding parameters,
  // the callback and an error callback function (called if a
  // communication error occurs):
  geocoder.reverseGeocode(
    parameters,
    (resultado) => {
      // Assumption: ui is instantiated
      // Create an InfoBubble at the returned location with
      // the address as its contents:
      var result = resultado.Response.View[0].Result[0].Location.Address;

      //if (result.HouseNumber != undefined) {
      //document.getElementById("direccionMapa").value = result.Label;
      displayMarker(["", lat, lon]);
      //console.log(result.items[0].address);
      document.getElementsByName("direccionData")[0].value = JSON.stringify(
        result
      );
      //document.getElementsByName('direccion')[0].value = result.Label;
      /*} else {
            alert("La direccion no tiene numero");
           displayMarker(['', lat, lon]);
        document.getElementById("direccionMapa").value = '';
            document.getElementsByName('direccionData')[0].value = '';
            document.getElementsByName('direccion')[0].value = '';
        }*/
    },
    alert
  );

  //console.log([document.getElementsByName('lat')[0].value,document.getElementsByName('lon')[0].value]);
}

function showPosition(position) {
  var lat = position.coords.latitude;
  var lon = position.coords.longitude;
  //displayMarker([0, lat, lon]);
  document.getElementsByName("lat")[0].value = parseFloat(lat);
  document.getElementsByName("lon")[0].value = parseFloat(lon);
}

function dragMarker() {
  var lat = document.getElementsByName("lat")[0].value;
  var lon = document.getElementsByName("lon")[0].value;

  // Get an instance of the search service:
  var geocoder = platform.getGeocodingService(),
    parameters = {
      prox: lat + "," + lon + ",250",
      mode: "retrieveAddresses",
      maxresults: "1",
      gen: "9",
    };

  // Call the reverse geocode method with the geocoding parameters,
  // the callback and an error callback function (called if a
  // communication error occurs):
  geocoder.reverseGeocode(
    parameters,
    (resultado) => {
      // Assumption: ui is instantiated
      // Create an InfoBubble at the returned location with
      // the address as its contents:
      var result = resultado.Response.View[0].Result[0].Location.Address;
      //if (result.HouseNumber != undefined) {
      //document.getElementById("direccionMapa").value = result.Label;
      //displayMarker([result.items[0].address.label, lat, lon]);
      document.getElementsByName("direccionData")[0].value = JSON.stringify(
        result
      );
      //    document.getElementsByName('direccion')[0].value = result.Label;
      document.getElementsByName("lat")[0].value = parseFloat(lat);
      document.getElementsByName("lon")[0].value = parseFloat(lon);
      /*} else {
            alert("Algo fallo ");
            //document.getElementById("direccionMapa").value = '';
            document.getElementsByName('direccionData')[0].value = '';
            document.getElementsByName('direccion')[0].value = '';
        }*/
    },
    alert
  );

  //console.log([document.getElementsByName('lat')[0].value,document.getElementsByName('lon')[0].value]);
}

function getLocationInRealTime() {
  options = {
    enableHighAccuracy: true,
    timeout: 100,
    maximumAge: 0,
  };

  function error(err) {
    alert("ERROR(" + err.code + "): " + err.message);
  }
  if (navigator.geolocation) {
    watchID = navigator.geolocation.watchPosition(showPositionRealTime, error);
  } else {
    x.innerHTML = "Geolocation is not supported by this browser.";
  }
}

function showPositionRealTime(position) {
  var objetos = map.getObjects();
  for (let i = 0; i < objetos.length; i++) {
    if (objetos[i].ja.b == 0) {
      map.removeObject(objetos[i]);
    }
  }

  // Create an icon object, an object with geographic coordinates and a marker:
  coords = { lat: position.coords.latitude, lng: position.coords.longitude };
  markerReal = new H.map.Marker(coords, { icon: iconRealTime });
  // Set map center and zoom, add the marker to the map:

  map.setCenter(coords);
  map.setZoom(17);
  map.addObject(markerReal);
}

function stopWatch() {
  navigator.geolocation.clearWatch(watchID);
  //console.log(map.getObjects());
  var objetos = map.getObjects();
  for (let i = 0; i < objetos.length; i++) {
    if (objetos[i].ja.b == 0) {
      map.removeObject(objetos[i]);
    }
  }
}

function getLocationInRealTimeSale() {
  options = {
    enableHighAccuracy: true,
    timeout: 100,
    maximumAge: 0,
  };

  function error(err) {
    alert("ERROR(" + err.code + "): " + err.message);
  }
  if (navigator.geolocation) {
    watchID = navigator.geolocation.watchPosition(
      showPositionRealTimeSale,
      error
    );
  } else {
    x.innerHTML = "Geolocation is not supported by this browser.";
  }
}

function showPositionRealTimeSale(position) {
  var lat = position.coords.latitude;
  var lon = position.coords.longitude;
  document.getElementsByName("lat")[0].value = parseFloat(lat);
  document.getElementsByName("lon")[0].value = parseFloat(lon);
}

function stopWatchSale() {
  navigator.geolocation.clearWatch(watchID);
}

var iconRealTime = new H.map.Icon(
  "https://img.icons8.com/fluent/36/000000/car.png"
);

function getLocationRouteHere(ischecked, destino) {
  if (navigator.geolocation) {
    //console.log("es por aca");
    navigator.geolocation.getCurrentPosition(function (position) {
      showPositionRouteHere(position, ischecked, destino);
    });
  } else {
    console.log("Geolocation is not supported by this browser.");
  }
}

function showPositionRouteHere(position, ischecked, destino) {
  var origen = JSON.stringify({
    latitud: position.coords.latitude,
    longitud: position.coords.longitude,
  });
  calculateRouteFromAtoB(ischecked, origen, destino);
}

function getLocationRouteGoogle(destino) {
  if (navigator.geolocation) {
    //console.log("es por aca");
    navigator.geolocation.getCurrentPosition(function (position) {
      showPositionRouteGoogle(position, destino);
    });
  } else {
    console.log("Geolocation is not supported by this browser.");
  }
}

function showPositionRouteGoogle(position, destino) {
  var origen = JSON.stringify({
    latitud: position.coords.latitude,
    longitud: position.coords.longitude,
  });
  viewLocation(origen, destino);
}

function createPDF() {
  var clientes = [];
  [...$(".clientes .checkBoxes")].map(function (elm) {
    clientes.push(elm.getAttribute("data-latlon"));
  });

  var ProdVenta = JSON.parse($("#Prod").attr("data-prod"));
  var divTable = document.createElement("div");
  var table = `
        <table>
            `;
  var HeaderRow1 = `
        <thead>
            <tr>
                <th colspan="2" scope="colgroup">Fecha</th>
                <th colspan="2" scope="colgroup">Reparto</th>
        `;
  var HeaderRow2 = `
        <tr>
            <th scope="col">#</th>
            <th scope="col">c</th>
            <th scope="col">Cliente</th>
            <th scope="col">Dirección</th>
        `;
  let headers = [
    2,
    3,
    4,
    5,
    7,
    8,
    9,
    15,
    19,
    35,
    36,
    45,
    55,
    68,
    80,
    81,
    84,
    103,
    106,
    133,
    134,
    135,
    136,
    138,
    248,
    249,
    250,
    251,
  ];

  for (let h = 0; h < headers.length; h++) {
    //table += '<colgroup span="1"></colgroup>';
    let head = ProdVenta.filter((prod) => prod.idarticulo == headers[h]);
    HeaderRow1 += '<th scope="col"><span>' + head[0].alias + "</span></th>";
    HeaderRow2 += '<th scope="col">' + head[0].idarticulo + "</th>";
  }
  HeaderRow1 += "</tr>";
  HeaderRow2 += "</tr></thead>";
  table += HeaderRow1;
  table += HeaderRow2;

  var rows = "";

  for (let c = 0; c < clientes.length - 1; c++) {
    var clienteOrigen = JSON.parse(clientes[c]);
    var clienteDestino = JSON.parse(clientes[c + 1]);
    var url =
      "https://www.google.com/maps/dir/" +
      clienteOrigen.latitud +
      "," +
      clienteOrigen.longitud +
      "/" +
      clienteDestino.latitud +
      "," +
      clienteDestino.longitud;
    rows +=
      "<tr>" +
      '<th scope="row">' +
      c +
      "</th>" +
      '<th scope="row">' +
      clienteOrigen.codigo +
      "</th>" +
      '<th scope="row">' +
      clienteOrigen.nombre +
      "</th>" +
      '<th scope="row"><a href=' +
      url +
      " >" +
      clienteOrigen.direccion.split(",")[0] +
      "</a></th>" +
      "<td></td>".repeat(headers.length) +
      "</tr>";
  }
  var clienteOrigen = JSON.parse(clientes[clientes.length - 1]);
  rows +=
    "<tr>" +
    '<th scope="row">' +
    clientes.length +
    "</th>" +
    '<th scope="row">' +
    clienteOrigen.codigo +
    "</th>" +
    '<th scope="row">' +
    clienteOrigen.nombre +
    "</th>" +
    '<th scope="row"><a>' +
    clienteOrigen.direccion.split(",")[0] +
    "</a></th>" +
    "<td></td>".repeat(headers.length) +
    "</tr>";

  table += rows;

  var style2 = `
    @supports (writing-mode: vertical-lr) {
        thead tr th span {
          display: inline-block;
          writing-mode: vertical-lr;
          white-space: nowrap;
          transform: rotate(180deg);
          line-height: 0;
          padding: 2px 15px;
          /* than ks to @Erik_J*/
        }
      }
        `;

  var style = "<style>";
  style += "table {width: 100%;font: 17px Calibri;}";
  style +=
    "table, th, td {border: solid 1px #DDD; border-collapse: collapse; padding: 2px 3px;text-align: center;}";
  style += style2;
  style += "</style>";

  divTable.innerHTML = table + style;

  // CREATE A WINDOW OBJECT.
  var win = window.open("", "", "height=700,width=700");

  win.document.write("<html><head>");
  win.document.write("<title>Reparto:</title>"); // <title> FOR PDF HEADER.
  win.document.write(style); // ADD STYLE INSIDE THE HEAD TAG.
  win.document.write("</head>");
  win.document.write("<body>");
  win.document.write(divTable.innerHTML); // THE TABLE CONTENTS INSIDE THE BODY TAG.
  win.document.write("</body></html>");

  win.document.close(); // CLOSE THE CURRENT WINDOW.

  win.print(); // PRINT THE CONTENTS.
}
