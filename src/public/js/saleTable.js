const formatterPeso = new Intl.NumberFormat("es-AR", {
  currency: "ARS",
  style: "currency",
});

function llenarInput(elemento) {
  //console.log(elemento);
  $("#filterId").text(elemento.getAttribute("data-Key"));
  $(".active").removeClass("active");
  $(elemento).addClass("active");
  document.getElementById("searchInput").value = "";
  const keyName = elemento.getAttribute("data-Key");
  const dataForm = JSON.parse(
    document.getElementById("DropClient").getAttribute("data-Clientes")
  );
  var dataSuggest = [];
  for (i = 0; i < dataForm.length; i++) {
    //if (typeof dataForm[i][keyName] === 'string') {
    dataSuggest.push({ label: dataForm[i][keyName], idx: i });
    //} else {
    //    dataSuggest.push({ label: JSON.stringify(dataForm[i][keyName]), idx: i });
    //}
  }
  //console.log(dataSuggest);
  $("#searchInput").autocomplete({
    source: dataSuggest,
  });
}

$("#searchInput").autocomplete({
  select: function (event, ui) {
    //console.log("Selectionaste");
    const indice = ui.item.idx;
    const dataForm = JSON.parse(
      document.getElementById("DropClient").getAttribute("data-Clientes")
    );
    //console.log(JSON.stringify(dataForm[indice]));
    //LlenarFormulario_v2(dataForm[indice]);

    $("#clientHelp")[0].innerText =
      dataForm[indice].Codigo +
      " | " +
      dataForm[indice].Nombre +
      " | " +
      dataForm[indice].Direccion +
      " | " +
      dataForm[indice].idClientes;
    $("#clienteModificar")[0].value = JSON.stringify(dataForm[indice]);
    //console.log($("#clienteModificar")[0].value);
  },
});

var $table = $("#table");
var $remove = $("#remove");
var $edit = $("#edit");
var selections = [];

function getIdSelections() {
  return $.map($table.bootstrapTable("getSelections"), function (row) {
    return row.id;
  });
}

function responseHandler(res) {
  $.each(res.rows, function (i, row) {
    row.state = $.inArray(row.id, selections) !== -1;
  });
  return res;
}

function detailFormatter(index, row) {
  var html = [];
  $.each(row, function (key, value) {
    html.push("<p><b>" + key + ":</b> " + value + "</p>");
  });
  return html.join("");
}

function operateFormatter(value, row, index) {
  return [
    '<a class="like" href="javascript:void(0)" title="Like">',
    '<i class="fa fa-heart"></i>',
    "</a>  ",
    '<a class="remove" href="javascript:void(0)" title="Remove">',
    '<i class="fa fa-trash"></i>',
    "</a>",
  ].join("");
}

window.operateEvents = {
  "click .like": function (e, value, row, index) {
    alert("You click like action, row: " + JSON.stringify(row));
  },
  "click .remove": function (e, value, row, index) {
    $table.bootstrapTable("remove", {
      field: "id",
      values: [row.id],
    });
  },
};

function priceFormatter(value) {
  return "$" + value.toLocaleString();
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
  return "$" + result.toLocaleString();
}

function totalCalculator(data) {
  return data
    .map(function (row) {
      return +row["pu"] * row["cantidad"];
    })
    .reduce(function (sum, i) {
      //  console.log(i);
      return sum + i;
    }, 0);
}

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
  $table.on(
    "check.bs.table uncheck.bs.table " +
      "check-all.bs.table uncheck-all.bs.table",
    function () {
      $remove.prop("disabled", !$table.bootstrapTable("getSelections").length);
      $edit.prop("disabled", !$table.bootstrapTable("getSelections").length);
      // save your data, here just save the current page
      selections = getIdSelections();
      // push or splice the selections if you want to save all data selections
    }
  );
  $table.on("all.bs.table", function (e, name, args) {
    //console.log(name, args);
  });
  $remove.click(function () {
    var ids = getIdSelections();
    $table.bootstrapTable("remove", {
      field: "id",
      values: ids,
    });
    $remove.prop("disabled", !$table.bootstrapTable("getSelections").length);
    $edit.prop("disabled", !$table.bootstrapTable("getSelections").length);
  });
}

$(function () {
  initTable();
  //$table.bootstrapTable('hideColumn', 'state');
  $("#locale").change(initTable);
  $table.bootstrapTable("hideLoading");
});

var $table = $("#table");
var $button2 = $("#addButton");

$button2.click(function () {
  var oldData = $table.bootstrapTable("getData");
  var newId = 0;
  if (oldData.length != 0) {
    newId = parseInt(oldData[0].id) + 1;
  }
  var [fecha, hora] = getDateTime();
  var avender = $("#prodHelp")[0].innerText.split(" | ");
  if ($("#Cant")[0].value > 0 && $("#precioProd").text() != "$0") {
    $table.bootstrapTable("insertRow", {
      index: 0,
      row: {
        id: newId,
        name: avender[1],
        pu: parseFloat(avender[2].substring(1).replaceAll(',','')),
        cantidad: parseFloat($("#Cant")[0].value),
        importe:
          parseFloat($("#Cant")[0].value) * parseFloat(avender[2].substring(1).replaceAll(',','')),
        fechatime: fecha + " " + hora,
        idproductos: avender[3],
        idarticulo: avender[0],
      },
    });
    $("#Prod")[0].value = "";
    $("#precioProd").text("$0");
    $("#Cant")[0].value = "";
    $("#prodHelp")[0].innerText = "No hay datos aún";
  }
});

function modifySale(data) {
  $("#modID")[0].value = data.id;
  $("#modCant")[0].value = data.cantidad;
  $("#modProd")[0].value = data.name;
  $("#modIndex")[0].value = $(".selected")[0].getAttribute("data-index");
  $("#precioModProd").text("$" + data.pu.toLocaleString("en-US").replaceAll(',',''));
  $("#modProdHelp")[0].innerText =
    data.idarticulo +
    " | " +
    data.name +
    " | " +
    "$" +
    data.pu.toLocaleString("en-US").replaceAll(',','') +
    " | " +
    data.idproductos;
}

function updateRow() {
  var avender = $("#modProdHelp")[0].innerText.split(" | ");
  if ($("#modCant")[0].value > 0 && $("#precioModProd").text() != "$0") {
    $table.bootstrapTable("updateRow", {
      index: $("#modIndex")[0].value,
      row: {
        id: parseInt($("#modID")[0].value),
        name: avender[1],
        pu: parseFloat(avender[2].substring(1).replaceAll(',','')),
        cantidad: $("#modCant")[0].value,
        importe: $("#modCant")[0].value * parseFloat(avender[2].substring(1).replaceAll(',','')),
        idproductos: avender[3],
        idarticulo: avender[0],
      },
    });
  }
  $("#modProdHelp")[0].innerText = "No hay datos aún";
}

function doAjaxRequestAlta() {
  var venta_producto = $table.bootstrapTable("getData");
  var clientsData = $("#clientHelp")[0].innerText.split(" | ");
  if (venta_producto.length > 0 && clientsData.length > 1) {
    var ordenVenta = {
      clientes_idClientes: clientsData[3],
      idcliente: clientsData[0],
      fechatime: $("#date-input")[0].value + " " + $("#time-input")[0].value,
      usuarios_idUsuarios: window.idUsuarios,
      estado: "C",
      cantidad: venta_producto.length,
      total: totalCalculator(venta_producto),
      cidempresa: "DON",
      latitud: document.getElementsByName("lat")[0].value,
      longitud: document.getElementsByName("lon")[0].value,
    };
    for (let i = 0; i < venta_producto.length; i++) {
      venta_producto[i].clientes_idClientes = clientsData[3];
    }
    //console.log(ordenVenta);
    var data = {
      ordenVenta: JSON.stringify(ordenVenta),
      venta_producto: JSON.stringify(venta_producto),
    };
    /* agregar formulario de confirmación */
    $("#alerta").text("¿ Esta seguro de ingresar la Venta ?");
    $("#alerta").removeClass();
    $("#alerta").addClass("alert alert-primary");
    $("#btn-confirm").removeAttr("data-dismiss");
    $("#btn-confirm").attr(
      "onclick",
      "doConfirmRequest(" + JSON.stringify(data) + ");"
    );
    $("#modalAlert").modal("toggle");
    $(".alert").alert();
  } else if (venta_producto.length > 0) {
    alert(" Es necesario ingresar un Cliente antes de generar una venta ");
    $("#alerta").text("No se agregó la venta aún");
    $("#alerta").removeClass();
    $("#alerta").addClass("alert alert-warning");
    $("#btn-confirm").removeAttr("onclick");
    $("#btn-confirm").attr("data-dismiss", "modal");
    $("#modalAlert").modal("toggle");
    $(".alert").alert();
  } else {
    alert(" No se han agregado productos a la venta !");
    $("#alerta").text("No se agregó la venta aún");
    $("#alerta").removeClass();
    $("#alerta").addClass("alert alert-warning");
    $("#btn-confirm").removeAttr("onclick");
    $("#btn-confirm").attr("data-dismiss", "modal");
    $("#modalAlert").modal("toggle");
    $(".alert").alert();
  }
}

function doAjaxRequestAltaNS() {
  var clientsData = $("#clientHelp-ns")[0].innerText.split(" | ");
  if (clientsData.length > 1) {
    var ordenVenta = {
      clientes_idClientes: clientsData[3],
      fechatime:
        $("#date-input-ns")[0].value + " " + $("#time-input-ns")[0].value,
      usuarios_idUsuarios: window.idUsuarios,
      observacion: $("#obs-ns")[0].value,
      causa: $("#causas-ns")[0].value,
      latitud: document.getElementsByName("lat")[0].value,
      longitud: document.getElementsByName("lon")[0].value,
    };
    var data = { ordenVenta: JSON.stringify(ordenVenta) };
    /* agregar formulario de confirmación */
    $("#alerta").text("¿ Esta seguro de ingresar la ausencia de venta ?");
    $("#alerta").removeClass();
    $("#alerta").addClass("alert alert-primary");
    $("#btn-confirm").removeAttr("data-dismiss");
    $("#btn-confirm").attr(
      "onclick",
      "doConfirmRequestNS(" + JSON.stringify(data) + ");"
    );
    $("#modalAlert").modal("toggle");
    $(".alert").alert();
  } else {
    alert(" Es necesario ingresar un Cliente antes de generar una venta ");
    $("#alerta").text("No se agregó la venta aún");
    $("#alerta").removeClass();
    $("#alerta").addClass("alert alert-warning");
    $("#btn-confirm").removeAttr("onclick");
    $("#btn-confirm").attr("data-dismiss", "modal");
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
  var clientsData = $("#clientHelp")[0].innerText.split(" | ");
  var dataSale = JSON.parse(data.ordenVenta);
  //console.log(data);
  $.ajax({
    method: "POST",
    url: "/ventas/alta",
    data: data,
  })
    .done(function (data, textStatus, jqXHR) {
      if (!data.redirect) {
        resetSaleForm();
        $("#btn-confirm").removeAttr("onclick");
        $("#btn-confirm").attr("data-dismiss", "modal");
        $("#alerta").text("La venta fue cargada correctamente");
        $("#alerta").removeClass();
        $("#alerta").addClass("alert alert-success");
        $("#spinner").css("display", "none");
        $("#alertFoot").css("display", "block");

        if (clientsData[4]) {
          var idDireccion = clientsData[4];
          var fecha = $("#date-input")[0].value.split("-").reverse();
          if ($("#buttonGroup" + idDireccion).length != 0) {
            $("#buttonGroup" + idDireccion + " a:last-child").after(
              "<a onclick=viewSale(this.getAttribute('data-venta')) data-venta='" +
                data +
                "' role='button' class='btn btn-success btn-sm mx-1 p-0'><span style='color:white'>" +
                fecha[0] +
                "/" +
                fecha[1] +
                "</span></a>"
            );
          } else {
            $("#breakSale" + idDireccion).css({
              height: "5px",
              width: "85%",
              "border-radius": "3px",
              "background-color": "#54e0c7",
            });
            $("#infoSale" + idDireccion).css("color", "#54e0c7");
            //$('#infoSale' + idDireccion)[0].innerText = "Hoy se realizaron " + orden_venta.length + " ventas";
            $("#infoSale" + idDireccion)[0].innerText = "";
            $("#infoSale" + idDireccion).after(
              "<div id=" +
                "buttonGroup" +
                idDireccion +
                ' class="text-center my-1">' +
                '<small style="color:#d1d7dc">Ultimas visitas:</small>' +
                "<a onclick=viewSale(this.getAttribute('data-venta')) data-venta='" +
                data +
                "' role='button' class='btn btn-success btn-sm mx-1 p-0'><span style='color:white'>" +
                fecha[0] +
                "/" +
                fecha[1] +
                "</span></a>" +
                "</div>"
            );
          }
          $("#svg" + idDireccion).css({
            "background-color": "#54e0c7",
            "border-radius": "50%",
            border: "3px solid #54e0c7",
          });
          $("#svg" + idDireccion)[0].children[0].setAttribute("fill", "black");
          $("#inputGroup" + idDireccion).css({ "background-color": "green" });
          $("#ModalCenterSale").modal("hide");
          addClone(
            document
              .getElementById("option" + idDireccion)
              .getAttribute("data-latLon")
          );
          window.total += dataSale.total;
          $("#recaudacionTotal").text(priceFormatter(window.total));
        }
        //alert("Se ingreso la venta satisfactoriamente");
      }
    })
    .fail(function (jqXHR, textStatus, errorThrown) {
      $("#btn-confirm").removeAttr("onclick");
      $("#btn-confirm").attr("data-dismiss", "modal");
      $("#alerta").text(
        "Ha ocurrido un error y no se ha podido cargar la venta"
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
      } else {
        $("#alerta").text("Error desconocido: " + jqXHR.responseText);
      }
      $("#alerta").removeClass();
      $("#alerta").addClass("alert alert-danger");
      $("#spinner").css("display", "none");
      $("#alertFoot").css("display", "block");
    })
    .always(function (data, textStatus, jqXHR) {
      if (data.redirect) {
        // data.redirect contains the string URL to redirect to
        window.onbeforeunload = null;
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
      if (clientsData[4]) {
        stopWatchSale();
      }
    });
}

function doConfirmRequestNS(data) {
  $("#alertFoot").css("display", "none");
  $("#spinner").css("display", "block");
  $("#alerta").text("Espere...");
  $("#alerta").removeClass();
  var clientsData = $("#clientHelp-ns")[0].innerText.split(" | ");
  //console.log(data);
  $.ajax({
    method: "POST",
    url: "/ventas/altaNoOrden",
    data: data,
  })
    .done(function (data) {
      if (!data.redirect) {
        resetSaleFormNS();
        $("#btn-confirm").removeAttr("onclick");
        $("#btn-confirm").attr("data-dismiss", "modal");
        $("#alerta").text("La ausencia venta fue cargada correctamente");
        $("#alerta").removeClass();
        $("#alerta").addClass("alert alert-success");
        $("#spinner").css("display", "none");
        $("#alertFoot").css("display", "block");
        if (clientsData[4]) {
          var idDireccion = clientsData[4];
          var fecha = $("#date-input-ns")[0].value.split("-").reverse();
          if ($("#buttonGroup" + idDireccion).length != 0) {
            $("#buttonGroup" + idDireccion + " a:last-child").after(
              "<a data-venta='" +
                data +
                "' role='button' class='btn btn-danger btn-sm mx-1 p-0'><span style='color:white'>" +
                fecha[0] +
                "/" +
                fecha[1] +
                "</span></a>"
            );
          } else {
            $("#breakSale" + idDireccion).css({
              height: "5px",
              width: "85%",
              "border-radius": "3px",
              "background-color": "#54e0c7",
            });
            $("#infoSale" + idDireccion).css("color", "#54e0c7");
            //$('#infoSale' + idDireccion)[0].innerText = "Hoy se realizaron " + orden_venta.length + " ventas";
            $("#infoSale" + idDireccion)[0].innerText = "";
            $("#infoSale" + idDireccion).after(
              "<div id=" +
                "buttonGroup" +
                idDireccion +
                ' class="text-center my-1">' +
                '<small style="color:#d1d7dc">Ultimas visitas:</small>' +
                "<a data-venta='" +
                data +
                "' role='button' class='btn btn-danger btn-sm mx-1 p-0'><span style='color:white'>" +
                fecha[0] +
                "/" +
                fecha[1] +
                "</span></a>" +
                "</div>"
            );
          }

          $("#svg" + idDireccion).css({
            "background-color": "#8B0000",
            "border-radius": "50%",
            border: "3px solid #8B0000",
          });
          $("#svg" + idDireccion)[0].children[0].setAttribute("fill", "black");
          $("#inputGroup" + idDireccion).css({ "background-color": "#FF0000" });

          $("#ModalNoSale").modal("hide");
          addClone(
            document
              .getElementById("option" + idDireccion)
              .getAttribute("data-latLon")
          );
        }
      }
    })
    .fail(function () {
      $("#btn-confirm").removeAttr("onclick");
      $("#btn-confirm").attr("data-dismiss", "modal");
      $("#alerta").text(
        "Ha ocurrido un error y no se ha podido cargar la ausencia venta"
      );
      $("#alerta").removeClass();
      $("#alerta").addClass("alert alert-danger");
      $("#spinner").css("display", "none");
      $("#alertFoot").css("display", "block");
    })
    .always(function (data) {
      if (data.redirect) {
        // data.redirect contains the string URL to redirect to
        window.onbeforeunload = null;
        $("#alerta").text(
          "La venta no fue cargada: Ha ocurrido un error y deberá volver a ingresar al Aplicativo"
        );
        $("#alerta").removeClass();
        $("#alerta").addClass("alert alert-danger");
        $("#closeAlert").addClass("d-none");
        setTimeout(function () {
          window.location.href = data.redirect;
        }, 500);
      }
      if (clientsData[4]) {
        stopWatchSale();
      }
    });
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
        fecha = fecha + fecha0[i].replace(",","") + "-";
      }
    } else {
      if (fecha0[i].length == 1) {
        fecha = fecha + "0" + fecha0[i];
      } else {
        fecha = fecha + fecha0[i].replace(",","");
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

function changeAutocomple() {
  var dataProd0 = JSON.parse($("#Prod").attr("data-prod"));
  var dataProd = [];
  var checkBox = document.getElementById("checkProd");
  var text = document.getElementById("autocompletarProd");
  if (checkBox.checked == true) {
    text.innerText = "Codigo";
    for (i = 0; i < dataProd0.length; i++) {
      dataProd.push({
        label: dataProd0[i]["idarticulo"],
        idx: i,
        precio: dataProd0[i]["precio2"],
        idarticulo: dataProd0[i]["idarticulo"],
        nombre: dataProd0[i]["nombre"],
        idproductos: dataProd0[i]["idproductos"],
      });
    }
    $("#Prod")[0].setAttribute("type", "number");
  } else {
    text.innerText = "Nombre";
    for (i = 0; i < dataProd0.length; i++) {
      dataProd.push({
        label: dataProd0[i]["nombre"],
        idx: i,
        precio: dataProd0[i]["precio2"],
        idarticulo: dataProd0[i]["idarticulo"],
        nombre: dataProd0[i]["nombre"],
        idproductos: dataProd0[i]["idproductos"],
      });
    }
    $("#Prod")[0].setAttribute("type", "text");
  }

  $("#Prod").autocomplete({
    source: function (request, response) {
      var results = $.ui.autocomplete.filter(dataProd, request.term);

      response(results.slice(0, 3));
    },
    position: { my: "left bottom", at: "left top" },
  });
  $("#Prod").autocomplete("option", "appendTo", "#saleForm");
  $("#Prod").autocomplete({
    select: function (event, ui) {
      //console.log("Selectionaste");
      const indice = ui.item.idx;
      $("#prodHelp")[0].innerText =
        ui.item.idarticulo +
        " | " +
        ui.item.nombre +
        " | " +
        "$" + ui.item.precio.toLocaleString("en-US").replaceAll(',','') +
        " | " +
        ui.item.idproductos;
      $("#precioProd").text("$" + ui.item.precio.toLocaleString("en-US").replaceAll(',',''));
    },
  });
}

function changeAutocompleEdit() {
  var dataProd0 = JSON.parse($("#Prod").attr("data-prod"));
  var dataProd = [];
  var checkBox = document.getElementById("editCheckProd");
  var text = document.getElementById("editAutocompletarProd");
  if (checkBox.checked == true) {
    text.innerText = "Nombre";
    for (i = 0; i < dataProd0.length; i++) {
      dataProd.push({
        label: dataProd0[i]["nombre"],
        idx: i,
        precio: dataProd0[i]["precio2"],
        idarticulo: dataProd0[i]["idarticulo"],
        nombre: dataProd0[i]["nombre"],
        idproductos: dataProd0[i]["idproductos"],
      });
    }
    $("#modProd")[0].setAttribute("type", "text");
  } else {
    text.innerText = "Codigo";
    for (i = 0; i < dataProd0.length; i++) {
      dataProd.push({
        label: dataProd0[i]["idarticulo"],
        idx: i,
        precio: dataProd0[i]["precio2"],
        idarticulo: dataProd0[i]["idarticulo"],
        nombre: dataProd0[i]["nombre"],
        idproductos: dataProd0[i]["idproductos"],
      });
    }
    $("#modProd")[0].setAttribute("type", "number");
  }

  $("#modProd").autocomplete({
    source: function (request, response) {
      var results = $.ui.autocomplete.filter(dataProd, request.term);

      response(results.slice(0, 3));
    },
    position: { my: "left bottom", at: "left top" },
  });
  $("#modProd").autocomplete("option", "appendTo", "#editSaleForm");

  $("#modProd").autocomplete({
    select: function (event, ui) {
      //console.log("Selectionaste");
      const indice = ui.item.idx;
      $("#modProdHelp")[0].innerText =
        ui.item.idarticulo +
        " | " +
        ui.item.nombre +
        " | " +
        "$" + ui.item.precio.toLocaleString("en-US").replaceAll(',','') +
        " | " +
        ui.item.idproductos;
      $("#precioModProd").text("$" + ui.item.precio.toLocaleString("en-US").replaceAll(',',''));
    },
  });
}
document.getElementById("editSaleForm").onkeypress = function (e) {
  var key = e.charCode || e.keyCode || 0;
  if (key == 13) {
    e.preventDefault();
  }
};
document.getElementById("saleForm").onkeypress = function (e) {
  var key = e.charCode || e.keyCode || 0;
  if (key == 13) {
    e.preventDefault();
  }
};

function giveBackOnlyClient(data) {
  if (data) {
    resetSaleFormNS();
    var clientData = JSON.parse(data);
    $("#clientHelp")[0].innerText =
      clientData.codigo +
      " | " +
      clientData.nombre +
      " | " +
      clientData.calle +
      " " +
      clientData.numero +
      ", " +
      clientData.ciudad +
      ", " +
      clientData.provincia +
      " | " +
      clientData.idClientes +
      " | " +
      clientData.idDireccion;
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
      " | " +
      clientData.idClientes +
      " | " +
      clientData.idDireccion;
  }
  var [fecha, hora] = getDateTime();
  $("#date-input")[0].value = fecha;
  $("#time-input")[0].value = hora;
}

function giveBackClient_ns(data) {
  if (data) {
    var clientData = JSON.parse(data);
    //$('#clientHelp')[0].innerText = clientData.codigo + " | " + clientData.nombre + " | " + clientData.calle + " " + clientData.numero + ", " + clientData.ciudad + ", " + clientData.provincia + " | " + clientData.idClientes + " | " + clientData.idDireccion;
    $("#clientHelp-ns")[0].innerText =
      clientData.codigo +
      " | " +
      clientData.nombre +
      " | " +
      clientData.direccion +
      " | " +
      clientData.idClientes +
      " | " +
      clientData.idDireccion;
  }
  var [fecha, hora] = getDateTime();
  $("#date-input-ns")[0].value = fecha;
  $("#time-input-ns")[0].value = hora;
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
  $remove.prop("disabled", !$table.bootstrapTable("getSelections").length);
  $edit.prop("disabled", !$table.bootstrapTable("getSelections").length);
}

function resetSaleFormNS() {
  $("#clientHelp-ns")[0].innerText = "No hay datos aún";
  var [fecha, hora] = getDateTime();
  $("#date-input-ns")[0].value = fecha;
  $("#time-input-ns")[0].value = hora;
  $("#obs-ns")[0].value = "";
  $("#causas-ns")[0].value = "";
}

window.onbeforeunload = function () {
  return "Your work will be lost.";
};
