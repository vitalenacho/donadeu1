window.lastClient;

function LlenarFormulario() {
  var data = JSON.parse(document.getElementById("clientsSelect").value);
  //console.log(data);
  var formInp = document.getElementsByTagName("input");
  for (i = 0; i < formInp.length; i++) {
    var nameOfInput = formInp[i].getAttribute("name");
    if (nameOfInput == "direccion") {
      formInp[i].value =
        data.calle +
        " " +
        data.numero +
        ", " +
        data.codigoPostal +
        " " +
        data.ciudad +
        ", " +
        data.pais;
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
      formInp[i].value = data.Direccion_idDireccion;
    } else {
      formInp[i].value = data[nameOfInput];
    }
  }
  clearOldSuggestions(); // funciones en el script autocomplete.js
  displayMarker([markerBox, data.lat, data.lon]); // funciones en el script autocomplete.js
}

function LlenarFormulario_v2(elemento) {
  var data = elemento;
  //console.log(data);
  //var formInp = document.getElementsByTagName("input");
  var formInp = document.querySelectorAll(".form-control");
  //console.log(formInp2);
  for (i = 0; i < formInp.length; i++) {
    var nameOfInput = formInp[i].getAttribute("name");
    if (nameOfInput == "direccion") {
      formInp[i].value =
        data.calle +
        " " +
        data.numero +
        ", " +
        data.codigoPostal +
        " " +
        data.ciudad +
        ", " +
        data.pais;
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
  document.getElementsByName("clienteModificar")[0].value = JSON.stringify(
    data
  );
  clearOldSuggestions(); // funciones en el script autocomplete.js
  displayMarker([markerBox, data.lat, data.lon]); // funciones en el script autocomplete.js
}
//window.onunload(LlenarFormulario());
//window.onunload(LlenarFormulario());

function LlenarFormulario_v3(elemento, flag) {
  var data = elemento;
  //console.log(data);
  //var formInp = document.getElementsByTagName("input");
  var formInp = document.querySelectorAll(".form-control");
  //console.log(formInp2);
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
    } else if (nameOfInput == "fechaMod") {
      setDateTime();
    } else {
      formInp[i].value = data[nameOfInput];
    }
  }
  document.getElementsByName("clienteModificar")[0].value = JSON.stringify(
    data
  );
  clearOldSuggestions(); // funciones en el script autocomplete.js
  displayMarker([markerBox, data.lat, data.lon], flag); // funciones en el script autocomplete.js
}

function setDateTime() {
  var options = {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  };

  var fecha0 = new Date().toLocaleString("es-AR", options).split(" ");
  var fecha = [fecha0[0].split("/").reverse().join("-"), fecha0[1]].join(" ");
  document.getElementById("fechaNueva").value = fecha;
}

function doAjaxRequest() {
  var isValidated = $("#formAltaCliente")[0].checkValidity();
  if (isValidated) {
    var data = $("#formAltaCliente").serialize();
    /* agregar formulario de confirmación */
    $("#alerta").text("¿ Esta seguro de ingresar el nuevo Cliente ?");
    $("#alerta").removeClass();
    $("#alerta").addClass("alert alert-primary");
    $("#btn-confirm").removeAttr("data-dismiss");
    $("#btn-confirm").removeClass("d-none");
    $("#btn-confirm").attr(
      "onclick",
      `doConfirmRequest(${JSON.stringify(data)});`
    );
    $("#modalAlert").modal("toggle");
    $(".alert").alert();
  } else {
    $("#alerta").html(`
    <div>Los campos obligatorios a ingresar son: </div>
    <div>
      <ul class="list-group">
        <li class="list-group-item list-group-item-danger">Nombre</li>
        <li class="list-group-item list-group-item-danger">Local</li>
        <li class="list-group-item list-group-item-danger">Teléfono</li>
        <li class="list-group-item list-group-item-danger">Dirección</li>
        <li class="list-group-item list-group-item-danger ">Geolocalización</li>
      </ul>
    </div>`);
    $("#alerta").removeClass();
    $("#alerta").addClass("alert alert-primary");
    $("#btn-confirm").removeAttr("data-dismiss");
    $("#btn-confirm").addClass("d-none");
    $("#modalAlert").modal("toggle");
    $(".alert").alert();
  }
}

function doConfirmRequest(data) {
  $("#alertFoot").css("display", "none");
  $("#spinner").css("display", "block");
  $("#alerta").text("Espere...");
  $("#alerta").removeClass();
  $("#closeAlert").addClass("d-none");
  $.ajax({
    method: "POST",
    url: "/clientes/alta",
    data: data,
  })
    .done(function (data, textStatus, jqXHR) {
      if (!data.redirect) {
      $("#btn-confirm").removeAttr("onclick");
      $("#btn-confirm").attr("data-dismiss", "modal");
      $("#alerta").text("El cliente fue cargado correctamente");
      $("#alerta").removeClass();
      $("#alerta").addClass("alert alert-success");
      $("#spinner").css("display", "none");
      $("#alertFoot").css("display", "block");
      $("#formAltaCliente")[0].reset();
      var newUser = JSON.parse(data);
      window.lastClient = newUser.cliente;
      var hrefData = JSON.stringify(newUser.cliente);
      var newButton = `
      <a href='/ventas/alta?lastClient=${hrefData}' target="_blank" role="button" id="buttonRedirect"
      class="btn btn-success p-0 m-0">
      <img src="../img/Icons-21.png"
          style="width: 36px;height: 36px;filter: invert(100%);" alt="">
      </a>`;
      $("#buttonGroup").append(newButton);
      //$("#buttonRedirect").attr("href", '/ventas/alta?lastClient=' + JSON.stringify(newUser.cliente));
      }
    })
    .fail(function (jqXHR, textStatus, errorThrown) {
      $("#btn-confirm").removeAttr("onclick");
      $("#btn-confirm").attr("data-dismiss", "modal");
      $("#alerta").text(
        "Ha ocurrido un error y no se ha podido cargar el cliente"
      );
      if (jqXHR.status === 0) {
        $("#alerta").text("No hay conexion a internet, verifique su conexion");
      } else if (jqXHR.status == 404) {
        $("#alerta").text("La funcion solicitada no existe en el servidor");
      } else if (jqXHR.status == 500) {
        $("#alerta").text("Ha ocurrido un problema interno en el servidor");
      } else if (textStatus === "parsererror") {
        $("#alerta").text("La informacion solicitada falló");
      } else if (textStatus === "timeout") {
        $("#alerta").text("Se ha excedido el tiempo maximo de espera");
      } else if (textStatus === "abort") {
        $("#alerta").text("Se ha abortado la peticion al servidor");
      }else if(jqXHR.status == 502){
        $("#alerta").text(
          "La venta no fue cargada: Ha ocurrido un error y se cerrará la aplicación"
        );
        $("#alerta").removeClass();
        $("#alerta").addClass("alert alert-danger");
        $("#closeAlert").addClass("d-none");
        setTimeout(function () {
          window.location.href = "/logout";
        }, 500);
      }
      else {
        $("#alerta").text("Error desconocido: " + jqXHR.responseText);
      }
      $("#alerta").removeClass();
      $("#alerta").addClass("alert alert-danger");
      $("#spinner").css("display", "none");
      $("#alertFoot").css("display", "block");
    })
    .always(function (data, textStatus, jqXHR) {
      $("#btn-confirm").removeAttr("onclick");
      if (data.redirect) {
        // data.redirect contains the string URL to redirect to
        $("#alerta").text(
          "La venta no fue cargada: Ha ocurrido un error y se cerrará la aplicación"
        );
        $("#alerta").removeClass();
        $("#alerta").addClass("alert alert-danger");
        $("#closeAlert").addClass("d-none");
        setTimeout(function () {
          window.location.href = data.redirect;
        }, 500);
      }
      $("#closeAlert").removeClass("d-none");
    });
}

function doRedirectSale(){
  (window.lastClient) ? $("#formData").submit()  : alert("Debe cargar al menos un cliente para redirigirse a la venta del mismo");
}