$("#dateInputS_mf").change(function () {
  $("#dateInputE_mf").attr("min", $("#dateInputS_mf")[0].value);
});
$("#dateInputS").change(function () {
  $("#dateInputE").attr("min", $("#dateInputS")[0].value);
});

$("#dateInputE_mf").change(function () {
  $("#dateInputS_mf").attr("max", $("#dateInputE_mf")[0].value);
});
$("#dateInputE").change(function () {
  $("#dateInputS").attr("max", $("#dateInputE")[0].value);
});
const formatterPeso = new Intl.NumberFormat("es-AR", {
  currency: "ARS",
  style: "currency",
});
$("#mainTable").bootstrapTable({
  onExpandRow: function (index, row, $detail) {
    //expandTable($detail);
    //console.log($detail);
    var dataSale = JSON.parse(row.detalle);
    var dataNoSale = { Causa: row.causa, Observacion: row.observacion };
    expandTable($detail, dataSale, dataNoSale);
  },
});

window.sales = [];
// your custom ajax request here
function ajaxRequest(flag) {
  $("#alertFoot").css("display", "none");
  $("#spinner").css("display", "block");
  $("#alerta").text("Espere...");
  $("#alerta").removeClass();
  var urlDest = "/ventas/reportes" + flag;
  $.ajax({
    method: "POST",
    url: urlDest,
    data: $("#filtros").serialize(),
  }).done(function (data) {
    $("#mainTable").bootstrapTable("removeAll");
    var pedidos = [];
    for (let k = 0; k < data.ventas.length; k++) {
      pedidos.push(data.ventas[k].idpedido);
    }
    var idpedidos = pedidos.filter(onlyUnique);

    for (i = 0; i < data.ventas.length; i++) {
      venta_cliente = data.ventasDesagregadas.filter(
        (sale) => sale.idpedido == idpedidos[i]
      );
      //console.log(venta_cliente);
      data.ventas[i].detalle = JSON.stringify(venta_cliente);
      data.ventas[i].operacion = (data.ventas[i].causa == "venta") ? "Venta" : "No venta"; 
      if (Number(data.ventas[i].hora.slice(0, 2)) < 16) {
        data.ventas[i].turno = "Mañana";
      } else {
        data.ventas[i].turno = "Tarde";
      }
    }
    $("#salesInfoMap").empty();
    if (flag == "Fecha" || flag == "Cliente") {
      filtroDobleMFechas(data.ventas);
      $("#mainTable")
        .bootstrapTable("destroy")
        .bootstrapTable({
          data: data.ventas,
          onExpandRow: function (index, row, $detail) {
            var dataSale = JSON.parse(row.detalle);
            var dataNoSale = { Causa: row.causa, Observacion: row.observacion };
            expandTable($detail, dataSale, dataNoSale);
          },
        });
      (flag == "Cliente") ? filtroDobleC(data.ventas) : filtroDoble(data.ventas);
    } else {
      $("#mainTable").bootstrapTable("destroy").bootstrapTable();
      window.sales = data.ventas;
      filtroDobleMFechas(data.ventas);
      filtroUser(data.ventas);
    }
    setTimeout(function () {
      $("#modalAlert").modal("hide");
    }, 500);
  });
}

function onlyUnique(value, index, self) {
  return self.indexOf(value) === index;
}

function buildTable($el, data) {
  $el.bootstrapTable("destroy").bootstrapTable({
    locale: "es_ES",
    columns: [
      [
        {
          field: "state",
          checkbox: true,
          rowspan: 2,
          align: "center",
          valign: "middle",
        },
        {
          title: "ID",
          field: "idpedidodeta",
          rowspan: 2,
          align: "center",
          valign: "middle",
          visible: false,
          sortable: true,
        },
        {
          title: "Detalle",
          colspan: 7,
          align: "center",
        },
      ],
      [
        {
          field: "idarticulo",
          title: "IDart",
          align: "center",
        },
        {
          field: "nombreArt",
          title: "Articulo",
          sortable: true,
          align: "center",
        },
        {
          field: "cantidad",
          title: "#",
          sortable: true,
          align: "center",
        },
        {
          field: "pu",
          title: "Precio",
          sortable: true,
          align: "center",
          formatter: priceFormatter,
        },
        {
          field: "importe",
          title: "Importe",
          sortable: true,
          align: "center",
          formatter: priceFormatter,
        },
        {
          field: "hora",
          sortable: true,
          title: "Horario",
          align: "center",
        },
        {
          field: "idpedido",
          title: "Idpedido",
          visible: false,
          align: "center",
        },
      ],
    ],
    data: data,
  });
}

function expandTable($detail, dataSale, dataNoSale) {
  if (dataSale.length > 0) {
    buildTable(
      $detail
        .html(
          '<table class="table table-bordered table-hover table-striped table-dark"></table>'
        )
        .find("table"),
      dataSale
    );
  } else {
    var html0 = [];
    $.each(dataNoSale, function (key, value) {
      html0.push("<h3>" + key + ":</h3> " + "<h6>" + value + "</h6>");
    });
    $detail.html(html0.join(""));
  }
}

function totalFormatter() {
  return "Total";
}

function cantFormatter(data) {
  return data.length;
}

function importFormatter(data) {
  var field = this.field;
  return formatterPeso.format(
    data
      .map(function (row) {
        return +row[field];
      })
      .reduce(function (sum, i) {
        return sum + i;
      }, 0)
  );
}

function priceFormatter(value) {
  return formatterPeso.format(value);
}

function dateFormatter(value) {
  var options = {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  };
  return new Date(value.split("T")[0].split("-").join("/")).toLocaleDateString("es-AR", options)
}
function rowStyle(row, index) {
  if (row.causa == "venta") {
    return {
      classes: "table-success",
    };
  } else {
    return {
      classes: "table-danger",
    };
  }
}

function filtrarPor(datos, clave) {
  var resultado = groupBy(datos, clave);
  return resultado;
}

function filtrarFiltro(datos, claves) {
  var c0 = 0;
  var datosNuevos0 = filtrarPor(datos, claves[c0]);
  while (c0 < claves.length) {
    c0 += 1;
    for (let c1 = 0; c1 < datosNuevos0.claves.length; c1++) {
      var datosNuevos,
        clavesNuevas = filtrarPor(datosNuevos0[clavesNuevas0[c1]], claves[c0]);
      datosNuevos0[clavesNuevas0[c1]] = datosNuevos;
    }
  }
}

function filtroTriple() {
  var datos = $("#mainTable").bootstrapTable("getData");
  var resultado = groupBy(datos, "usuario");
  var claves = Object.keys(resultado);
  console.log(resultado);
  claves.map(function (clave) {
    resultado[clave] = groupBy(resultado[clave], "fecha");
    var claves2 = Object.keys(resultado[clave]);
    claves2.map(function (clave2) {
      resultado[clave][clave2] = groupBy(resultado[clave][clave2], "fecha");
    });
  });
  return resultado;
}

function filtroDoble(datos) {
  var resultado = groupBy(datos, "usuario");
  var finalCard1 = "";
  var usuarios = Object.keys(resultado);
  var newRow = "<div class='row justify-content-center mb-2 w-100'>";
  usuarios.map(function (usuario) {
    resultado[usuario] = groupBy(resultado[usuario], "fecha");
    var newCard = [
      "<div class='col-auto'>",
      "<div class='card'>",
      "<div class='card-header'>",
      "<div class='mx-auto'>",
      "<h5 class='text-capitalize text-center my-auto'>" + usuario +"</h5>",
      "</div>",
      "</div>",
      "<div class='card-body'>",
      "<h6 class='card-subtitle mb-2 text-muted text-center'>Repartos :</h6>",
    ];
    var dates = Object.keys(resultado[usuario]);
    var newButtons = "";
    dates.map(function (date) {
      var fecha = dateFormatter(date).split("/");

      if (resultado[usuario][date].length > 1) {
        let finalResult0 = resultado[usuario][date];

        let finalResult1 = finalResult0.filter(
          (result) => Number(result.hora.slice(0, 2)) < 16
        );
        let finalResult2 = finalResult0.filter(
          (result) => Number(result.hora.slice(0, 2)) >= 16
        );
        if (finalResult1.length > 1 ) {
          newButtons +=
            "<button onclick=displayItineraryOnMap(this.getAttribute('data-venta')) data-venta=" +
            "'" +
            JSON.stringify(finalResult1) +
            "'" +
            " class='btn btn-info btn-sm m-1' type='button'>" +
            fecha[0] +
            "/" +
            fecha[1] +
            "-M" +
            "</button>";
        }
        if (finalResult2.length > 1)
          newButtons +=
            "<button onclick=displayItineraryOnMap(this.getAttribute('data-venta')) data-venta=" +
            "'" +
            JSON.stringify(finalResult2) +
            "'" +
            " class='btn btn-outline-info btn-sm m-1' type='button'>" +
            fecha[0] +
            "/" +
            fecha[1] +
            "-T" +
            "</button>";
      }
    });

    var finalCard0 = [...newCard, newButtons, "</div></div></div>"].join(
      ""
    );
    finalCard1 += finalCard0;
  });
  var finalCard = [newRow,finalCard1,"</div>"].join("")
  $("#salesInfoMap").append(finalCard);
  return resultado;
}

function filtroDobleMFechas(datos) {
  var newCard = [
    "<div class='row mx-auto mb-2 w-75'>",
    "<div class='card w-100'>",
    "<div class='card-header w-100'>",
    `<a data-toggle="collapse" href="#collapse-client " aria-expanded="true" aria-controls="collapse-client" id="heading-client" class="d-block">
      <span id="nombre_Cod">Resumen Ventas</span> <i class="fa fa-chevron-down float-right" aria-hidden="true"></i>
    </a></div>`,
    `<div id="collapse-client" class="collapse show w-100" aria-labelledby="heading-client">`,
    "<div class='card-body'>",
    "<h6 class='card-subtitle mb-2 text-muted text-center'>Resumen:</h6>"];
  var tabla = `<table class="table">
  <thead>
    <tr>
    <th colspan="1" class="align-middle" rowspan="2" scope="colgroup">Usuario</th>
    <th colspan="3" class="border-left" scope="colgroup">Mañana</th>
    <th colspan="3" class="border-left" scope="colgroup">Tarde</th>
    <th colspan="1" class="border-left align-middle" rowspan="2" scope="colgroup">Total</th>
    </tr>
    <tr>
    <th class="text-success" scope="col">Venta</th>
    <th class="text-danger" scope="col">No Venta</th>
    <th class="text-primary border-right" scope="col">Total</th>
    <th class="text-success" scope="col">Venta</th>
    <th class="text-danger" scope="col">No Venta</th>
    <th class="text-primary border-right" scope="col">Total</th>
    </tr>
  </thead>`
  var tableBody = `
  <tbody>`;
  var resultado = groupBy(datos, "usuario");
  var usuarios = Object.keys(resultado);
  resultado["datosAgregados"] = {Total: 0,Mañana : {montoTotal: 0 , ventas : 0, noVentas : 0} , Tarde : {montoTotal: 0 , ventas : 0, noVentas : 0}};
  var turnos = ["Mañana","Tarde"];
  usuarios.map(function (usuario) {
    resultado[usuario] = groupBy(resultado[usuario], "turno");
    tableBody += `
    <th class="text-capitalize border-right" scope="col">${usuario}</th>`

    //var turnos = Object.keys(resultado[usuario]);
    resultado[usuario]["datosAgregados"] = { montoTotal: 0 , ventas : 0, noVentas : 0 }
    turnos.map(function (turno) {
      resultado[usuario][turno] = (resultado[usuario][turno]) ? resultado[usuario][turno] : []; 
      resultado[usuario][turno]["datosAgregados"] = resultado[usuario][turno].reduce(
        (result, dataSale) => {
          result["montoTotal"] += (dataSale.monto) ? parseFloat(dataSale.monto) : 0;
          result["ventas"] += (dataSale.causa == "venta") ? 1 : 0;
          result["noVentas"] += (dataSale.causa != "venta") ? 1 : 0;
          return result;
        },
        { montoTotal: 0 , ventas : 0, noVentas : 0 , usuario: usuario , turno: turno}
        );
        resultado[usuario]["datosAgregados"]["montoTotal"] += (resultado[usuario][turno]["datosAgregados"]["montoTotal"]) ? resultado[usuario][turno]["datosAgregados"]["montoTotal"] : 0;
        resultado[usuario]["datosAgregados"]["ventas"] += (resultado[usuario][turno]["datosAgregados"]["ventas"]) ? resultado[usuario][turno]["datosAgregados"]["ventas"] : 0;
        resultado[usuario]["datosAgregados"]["noVentas"] += (resultado[usuario][turno]["datosAgregados"]["noVentas"]) ? resultado[usuario][turno]["datosAgregados"]["noVentas"] : 0;
        tableBody +=`
        <td>${(resultado[usuario][turno]["datosAgregados"]["ventas"]) ? resultado[usuario][turno]["datosAgregados"]["ventas"] : 0}</td>
        <td>${(resultado[usuario][turno]["datosAgregados"]["noVentas"]) ? resultado[usuario][turno]["datosAgregados"]["noVentas"] : 0}</td>
        <td class="border-right">${(resultado[usuario][turno]["datosAgregados"]["montoTotal"]) ? "$" + resultado[usuario][turno]["datosAgregados"]["montoTotal"].toLocaleString() : 0}</td>`
        resultado["datosAgregados"][turno]["ventas"] += resultado[usuario][turno]["datosAgregados"]["ventas"];
        resultado["datosAgregados"][turno]["noVentas"] += resultado[usuario][turno]["datosAgregados"]["noVentas"];
        resultado["datosAgregados"][turno]["montoTotal"] += resultado[usuario][turno]["datosAgregados"]["montoTotal"];
        resultado["datosAgregados"]["Total"] += resultado[usuario][turno]["datosAgregados"]["montoTotal"];
      });
    tableBody += `<th scope="col">${"$" + resultado[usuario]["datosAgregados"]["montoTotal"].toLocaleString()}</th>
    </tr>`
  });
  tableBody += 
  `
  <tr>
    <th class="border-right">Total</th>`;
  turnos.map(function(turno){
    tableBody += `
    <th>${(resultado["datosAgregados"][turno]["ventas"]) ? resultado["datosAgregados"][turno]["ventas"] : 0}</th>
    <th>${(resultado["datosAgregados"][turno]["noVentas"]) ? resultado["datosAgregados"][turno]["noVentas"] : 0}</th>
    <th class="border-right">${(resultado["datosAgregados"][turno]["montoTotal"]) ? "$" + resultado["datosAgregados"][turno]["montoTotal"].toLocaleString() : 0}</th>
    `
  })
  tableBody += `
  <th>${(resultado["datosAgregados"]["Total"]) ? "$" + resultado["datosAgregados"]["Total"].toLocaleString() : 0}</th>
  </tr>`;
  tabla += tableBody + `</tbody></table>
  <style>
  .card-header .fa {
    transition: .3s transform ease-in-out;
  }

  .card-header .collapsed .fa {
    transform: rotate(90deg);
  }
  </style>
  `;

  var finalCard = [...newCard,tabla,"</div></div></div></div>"].join(
    ""
  );
  $("#salesInfoMap").append(finalCard);
  return resultado;
}

function filtroUser(datos) {
  var resultado = groupBy(datos, "usuario");
  var usuarios = Object.keys(resultado);
  var newCard = [
    "<div class='col-auto'>",
    "<div class='card'>",
    "<div class='card-header'>",
    "<div class='mx-auto'>",
    "<h5 class='text-capitalize text-center my-auto'>Reporte PDF</h5>",
    "</div>",
    "</div>",
    "<div class='card-body'>",
    "<h6 class='card-subtitle mb-2 text-muted text-center'>Usuarios :</h6>",
  ];
  var newRow = "<div class='row justify-content-center mb-2 w-100'>";
  var newButtons = "";
  usuarios.map(function (usuario) {
    console.log(usuario)
    newButtons +=
    `<button onclick=getProductSaleReport(this.getAttribute('data-venta'),this.innerText) data-venta='${JSON.stringify(resultado[usuario])}'
    class='btn btn-info btn-sm m-1 text-capitalize' type='button'> 
    ${usuario.toString()}    
    </button>`;
  });
  var finalCard = [newRow,...newCard, newButtons, "</div></div></div></div>"].join("");
  $("#salesInfoMap").append(finalCard);
  return resultado;
}

function filtroDobleC(datos) {
  if(datos.length > 0){
    var finalCard1 = "";
    var newRow = "<div class='row justify-content-center mb-2 w-100'>";
    var newCard = [
      "<div class='col-auto'>",
      "<div class='card'>",
      "<div class='card-header'>",
      "<div class='mx-auto'>",
      "<h5 class='text-capitalize text-center my-auto'>" + datos[0].nombre +"</h5>",
      "</div>",
      "</div>",
      "<div class='card-body'>",
      "<h6 class='card-subtitle mb-2 text-muted text-center'>Repartos :</h6>",
    ];
    var newButtons = "";
    newButtons +="<button onclick=displayMarkersOnMap(this.getAttribute('data-venta')) data-venta=" +
            "'" +
            JSON.stringify(datos) +
            "'" +
            " class='btn btn-info btn-sm m-1' type='button'>" +
            "Ver mapa" +
            "</button>";
    var finalCard0 = [...newCard, newButtons, "</div></div></div>"].join("")
    finalCard1 += finalCard0;
    var finalCard = [newRow,finalCard1,"</div>"].join("")
    $("#salesInfoMap").append(finalCard);
}
}

const groupBy = (items, key) =>
  items.reduce(
    (result, item) => ({
      ...result,
      [item[key]]: [...(result[item[key]] || []), item],
    }),
    {}
  );

function priceFormatter(value) {
  return formatterPeso.format(value);
}

function totalTextFormatter(data) {
  return "Total";
}

function totalNameFormatter(data) {
  return data.length;
}

function totalPriceFormatter(data) {
  var field = this.field;
  var result = totalCalculator(data);
  return formatterPeso.format(result);
}

function totalCalculator(data) {
  return data
    .map(function (row) {
      return +row["pu"] * row["cantidad"];
      //console.log(row);
    })
    .reduce(function (sum, i) {
      //  console.log(i);
      return sum + i;
    }, 0);
}

var $table = $("#tableSale");

function initTable() {
  $table.bootstrapTable("destroy").bootstrapTable({
    locale: $("#locale").val(),
    columns: [
      [
        {
          field: "state",
          checkbox: true,
          rowspan: 2,
          align: "center",
          valign: "middle",
        },
        {
          title: "ID",
          field: "id",
          rowspan: 2,
          align: "center",
          valign: "middle",
          visible: false,
          sortable: true,
        },
        {
          title: "Detalle",
          colspan: 7,
          align: "center",
        },
      ],
      [
        {
          field: "name",
          title: "Nombre",
          sortable: true,
          align: "center",
        },
        {
          field: "cantidad",
          title: "#",
          sortable: true,
          align: "center",
          footerFormatter: totalTextFormatter,
        },
        {
          field: "pu",
          title: "Precio",
          sortable: true,
          align: "center",
          formatter: priceFormatter,
          footerFormatter: totalNameFormatter,
        },
        {
          field: "importe",
          title: "Importe",
          sortable: true,
          align: "center",
          formatter: priceFormatter,
          footerFormatter: totalPriceFormatter,
        },
        {
          field: "fechatime",
          title: "Fecha y hora",
          visible: false,
          align: "center",
        },
        {
          field: "idproductos",
          title: "IDprod",
          visible: false,
          align: "center",
        },
        {
          field: "idarticulo",
          title: "IDart",
          visible: false,
          align: "center",
        },
      ],
    ],
  });

  $table.on("all.bs.table", function (e, name, args) {
    //console.log(name, args);
  });
}

$(function () {
  initTable();
  //$table.bootstrapTable('hideColumn', 'state');
  $("#locale").change(initTable);
  $table.bootstrapTable("hideLoading");
});

function viewSale(data) {
  var dataSale = JSON.parse(data);
  giveBackOnlyClient(dataSale);
  [fecha, hora] = getDateTime(dataSale.fecha);

  $("#saleProduct").addClass("d-none");
  $("#date-input").attr("disabled", true);
  $("#time-input").attr("disabled", true);
  $("#toolbar").addClass("d-none");

  var newId = 0;
  var dataSaleDetail = JSON.parse(dataSale.detalle);
  if (dataSaleDetail.length > 0) {
    $("#date-input")[0].value = fecha;
    $("#time-input")[0].value = dataSale.hora;
    for (let j = 0; j < dataSaleDetail.length; j++) {
      $table.bootstrapTable("insertRow", {
        index: 0,
        row: {
          id: newId,
          name: dataSaleDetail[j].nombreArt,
          pu: dataSaleDetail[j].pu,
          cantidad: dataSaleDetail[j].cantidad,
          importe: dataSaleDetail[j].importe,
          //idproductos: dataSaleDetail[j].idproductos,
          idarticulo: dataSaleDetail[j].idarticulo,
        },
      });
      newId += 1;
    }

    $("#ModalCenterSale").modal("show");
  } else {
    $("#causas-ns")[0].value = dataSale.causa;
    $("#date-input-ns")[0].value = fecha;
    $("#time-input-ns")[0].value = dataSale.hora;
    $("#obs-ns")[0].value = dataSale.observacion;
    $("#ModalNoSale").modal("show");
  }
}

function getDateTime(dateTime) {
  if (dateTime) {
    var ArgTime = new Date(dateTime).toLocaleString().split(" ");
  } else {
    var ArgTime = new Date(Date()).toLocaleString().split(" ");
  }
  var fecha0 = ArgTime[0].split("/").reverse();
  var hora0 = ArgTime[1].split(":");
  var hora = "";
  var fecha = "";
  for (i = 0; i < fecha0.length; i++) {
    if (i != fecha0.length - 1) {
      if (fecha0[i].length == 1) {
        fecha = fecha + "0" + fecha0[i] + "-";
      } else {
        fecha = fecha + fecha0[i] + "-";
      }
    } else {
      if (fecha0[i].length == 1) {
        fecha = fecha + "0" + fecha0[i];
      } else {
        fecha = fecha + fecha0[i];
      }
    }
  }
  for (j = 0; j < hora0.length; j++) {
    if (j != hora0.length - 1) {
      if (hora0[j].length == 1) {
        hora = hora + "0" + hora0[j] + ":";
      } else {
        hora = hora + hora0[j] + ":";
      }
    } else {
      if (hora0[j].length == 1) {
        hora = hora + "0" + hora0[j];
      } else {
        hora = hora + hora0[j];
      }
    }
  }
  return [fecha, hora];
}

function giveBackOnlyClient(data) {
  var clientData = data;
  var detail = JSON.parse(data.detalle);
  if (detail.length == 0) {
    resetSaleFormNS();
    $("#clientHelp-ns")[0].innerText =
      clientData.codigo +
      " | " +
      clientData.nombre +
      " | " +
      clientData.direccion +
      " | ";
  } else {
    resetSaleForm();
    $("#clientHelp")[0].innerText =
      clientData.codigo +
      " | " +
      clientData.nombre +
      " | " +
      clientData.direccion +
      " | ";
  }
}

function giveBackClient(data) {
  if (data) {
    resetSaleForm();
    var clientData = JSON.parse(data);
    //$('#clientHelp')[0].innerText = clientData.codigo + " | " + clientData.nombre + " | " + clientData.calle + " " + clientData.numero + ", " + clientData.ciudad + ", " + clientData.provincia + " | " + clientData.idClientes + " | " + clientData.idDireccion;
    $("#clientHelp")[0].innerText =
      clientData.codigo +
      " | " +
      clientData.nombre +
      " | " +
      clientData.direccion +
      " | ";
  }
  var [fecha, hora] = getDateTime();
  $("#date-input")[0].value = fecha;
  $("#time-input")[0].value = hora;
}

function resetSaleForm() {
  $table.bootstrapTable("removeAll");
  if ($("#searchInput")[0] != undefined) {
    $("#searchInput")[0].value = "";
  }
  $("#clientHelp")[0].innerText = "No hay datos aún";
  $("#saleProduct").removeClass("d-none");
  $("#date-input").removeAttr("disabled");
  $("#time-input").removeAttr("disabled");
  $("#toolbar").removeClass("d-none");
  $("#saleFoot").removeClass("d-none");
  $("#saleForm").trigger("reset");
  $("#prodHelp")[0].innerText = "No hay datos aún";
  var [fecha, hora] = getDateTime();
  $("#date-input")[0].value = fecha;
  $("#time-input")[0].value = hora;
}

function resetSaleFormNS() {
  $("#clientHelp-ns")[0].innerText = "No hay datos aún";
  var [fecha, hora] = getDateTime();
  $("#date-input-ns")[0].value = fecha;
  $("#time-input-ns")[0].value = hora;
  $("#obs-ns")[0].value = "";
  $("#causas-ns")[0].value = "";
}

function getProductSaleReport(datos,user) {
  var dataProd0 = (!datos) ?(($("#mainTable").bootstrapTable("getData")).length > 0 ) ? $("#mainTable").bootstrapTable("getData") : window.sales : JSON.parse(datos);
  var prods = [];
  var detail = [];
  dataProd0.map(function (e0) {
    jsonData = JSON.parse(e0.detalle);
    jsonData.map(function (e1) {
      prods.push(e1.nombreArt);
      detail.push(e1);
    });
  });
  var dataSale = [];
  var uniqueProds = prods.filter(onlyUnique);
  uniqueProds.map(function (e2, idx) {
    var filtroDet = detail.filter((det) => det.nombreArt == e2);
    dataSale.push({
      nombreArt: [],
      idArt: [],
      importeTotal: [],
      cantidadTotal: [],
    });
    dataSale[idx].idArt = filtroDet[0].idarticulo;
    dataSale[idx].nombreArt = filtroDet[0].nombreArt;
    var cantTotal = filtroDet.reduce((cantidad, item) => {
      cantidad += item.cantidad;
      return cantidad;
    }, 0);
    dataSale[idx].cantidadTotal = cantTotal;
    var importeTotal = filtroDet.reduce((total, item) => {
      total += item.importe;
      return total;
    }, 0);
    dataSale[idx].importeTotal = importeTotal;
  });
  console.log(dataSale);
  var usuario = (user) ? user : $(".form-control.bootstrap-table-filter-control-usuario")
    .children("option:selected")
    .text();
  var turno = $(".form-control.bootstrap-table-filter-control-turno")
    .children("option:selected")
    .text();
  var fecha0 = (new Date($("#dateInput").val().replaceAll("-", "/"))).toLocaleDateString();
  var fecha = (user) ? (new Date($("#dateInputS_mf").val().replaceAll("-", "/"))).toLocaleDateString() + " --> " + (new Date($("#dateInputE_mf").val().replaceAll("-", "/"))).toLocaleDateString() : fecha0
  var newRows = "";
  dataSale.map((sale) => {
    newRows += `
    <tr>
      <th scope="row">${sale.idArt}</th>
      <td>${sale.nombreArt}</td>
      <td>${sale.cantidadTotal}</td>
      <td>${formatterPeso.format(sale.importeTotal)}</td>
    </tr>
    `;
  });

  var tabla =
    `
  <table class="table">
  <thead>
    <tr>
      <th rowspan="1"><b>DONADEU</b></th>
    </tr>
    <tr>
      <th rowspan="1">Filtrado por:
      ` +
    usuario +
    "   |   " +
    turno +
    "   |   " +
    fecha +
    `
    </th>
    </tr>
    <tr>
      <th scope="col">ID Art.</th>
      <th scope="col">Detalle</th>
      <th scope="col">Cantidad</th>
      <th scope="col">Total</th>
    </tr>
  </thead>
   
  <tbody>
  ` +
    newRows +
    `
  </tbody>
</table>`;

  // CREATE A WINDOW OBJECT.
  style = `
  <style>
    table {
      border-collapse: collapse;
      width: 100%;
    }
    tr { line-height: 0px; }
    th, td {
      padding: 8px;
      text-align: left;
      border-bottom: 1px solid #ddd;
    }
    
    html {
      font-family: Sentinel SSm A,Sentinel SSm B,system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica,Arial,sans-serif,Apple Color Emoji,Segoe UI Emoji,Segoe UI Symbol;
    }
</style>
  `;
  var win = window.open("", "", "height=700,width=700");

  win.document.write("<html><head>");
  win.document.write(
    "<title>Ventas: " +
      usuario +
      "   |   " +
      turno +
      "   |   " +
      fecha +
      "</title>"
  ); // <title> FOR PDF HEADER.
  win.document.write(style); // ADD STYLE INSIDE THE HEAD TAG.
  win.document.write("</head>");
  win.document.write("<body>");
  win.document.write(tabla); // THE TABLE CONTENTS INSIDE THE BODY TAG.
  win.document.write("</body></html>");

  win.document.close(); // CLOSE THE CURRENT WINDOW.

  win.print(); // PRINT THE CONTENTS.
  return dataSale;
}
