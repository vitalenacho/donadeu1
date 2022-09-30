const express = require("express");
const router = express.Router();
const { isLoggedIn, isLoggedInSale, isLoggedReport } = require("../lib/auth");
const helpers = require("../lib/helpers.js");

const pool = require("../database.js"); // pool === Database o conexion con la base de datos
const session = require("express-session");

router.get("/alta", isLoggedIn, async (req, res) => {
  const lastClient = req.query.lastClient;
  const clients = await pool.query(
    "SELECT clientes.idClientes,clientes.nombre AS Nombre, clientes.local AS Local, clientes.Id_SistemaGestion AS Codigo, clientes.direccion AS Direccion FROM clientes JOIN direccion WHERE clientes.Direccion_idDireccion = direccion.idDireccion AND clientes.Estado != 'Inactivo'"
  );
  const products = await pool.query("SELECT * FROM productos");
  res.render("ventas/alta", {
    style: "boostrap-table.css",
    apiKey: "yKsNO9XriVmWrprNNiosXTalHQBu5SUyde4CwLoYJYQ",
    clientesData: clients,
    lastClient: lastClient,
    idUsuarios: req.user.idUsuarios,
    clientesKeys: ["Codigo", "Nombre", "Local", "Direccion"],
    //Productos: [{ nombre: "Producto 1", precio: 75, id: 1 }, { nombre: "Producto 2", precio: 50, id: 2 }, { nombre: "Producto 3", precio: 30, id: 3 }],
    Productos: products,
    form: true,
  });
});

router.get("/reportes",isLoggedReport, async (req, res) => {
  const usuarios = await pool.query("SELECT * FROM usuarios");
  const dias = [
    { dia: "Lunes" },
    { dia: "Martes" },
    { dia: "Miercoles" },
    { dia: "Jueves" },
    { dia: "Viernes" },
    { dia: "Sabado" },
    { dia: "Rafaela" },
    { dia: "Esperanza" },
  ];
  const turnos = [{ turno: "Mañana" }, { turno: "Tarde" }, { turno: "Unico" }];
  const clients = await pool.query(
    "SELECT clientes.idClientes, clientes.nombre, clientes.local, clientes.telefono, clientes.telefono2, clientes.cuit, clientes.cuil, clientes.correo, clientes.Id_SistemaGestion, clientes.Estado, clientes.direccion, direccion.idDireccion, direccion.calle, direccion.numero, direccion.codigoPostal, direccion.ciudad, direccion.pais, direccion.latitud AS lat, direccion.longitud AS lon, direccion.observacion,clientes.nombre AS Nombre, clientes.local AS Local, clientes.Id_SistemaGestion AS Código, clientes.direccion AS Dirección FROM clientes JOIN direccion WHERE clientes.Direccion_idDireccion = direccion.idDireccion"
  );

  res.render("ventas/reportes", {
    style: "boostrap-table.css",
    style2: "Chart.css",
    usuarios: usuarios,
    dias: dias,
    clientesData: JSON.stringify(clients),
    clientesKeys: ["Código", "Nombre", "Local", "Dirección"],
    turnos: turnos,
    form: true,
  });
});

router.post("/reportesFecha", async (req, res) => {
  const { dateInput } = req.body;
  //console.log(dateInput);
  const ventas = await pool.query(
    "SELECT xppedidos.idpedido, DATE(xppedidos.fechatime) as 'fecha',TIME(xppedidos.fechatime) AS 'hora',clientes.direccion, direccion.latitud, direccion.longitud,direccion.ciudad ,usuarios.Nombre as 'usuario', usuarios.reparto , xppedidos.cantidad AS 'items', xppedidos.total AS 'monto',  clientes.Id_SistemaGestion AS 'codigo',clientes.nombre, 'venta' AS 'causa', xppedidos.observa AS 'observacion' FROM xppedidos LEFT JOIN clientes ON clientes.idClientes = xppedidos.clientes_idClientes LEFT JOIN direccion ON direccion.idDireccion = clientes.Direccion_idDireccion LEFT JOIN usuarios ON usuarios.idUsuarios = xppedidos.usuarios_idUsuarios WHERE DATE(xppedidos.fechatime) = ? UNION SELECT CONCAT(xppedidossinvisitar.idxppedidosSinVisitar,'NV') as 'idpedido', DATE(xppedidossinvisitar.fechatime) as 'fecha',TIME(xppedidossinvisitar.fechatime) AS 'hora',clientes.direccion, direccion.latitud, direccion.longitud,direccion.ciudad ,usuarios.Nombre as 'usuario', usuarios.reparto , 0 AS 'items', 0 AS 'monto',  clientes.Id_SistemaGestion AS 'codigo',clientes.nombre, xppedidossinvisitar.causa, xppedidossinvisitar.observacion  FROM xppedidossinvisitar LEFT JOIN clientes ON clientes.idClientes = xppedidossinvisitar.clientes_idClientes LEFT JOIN direccion ON direccion.idDireccion = clientes.Direccion_idDireccion LEFT JOIN usuarios ON usuarios.idUsuarios = xppedidossinvisitar.usuarios_idUsuarios WHERE DATE(xppedidossinvisitar.fechatime) = ? ORDER BY hora;",
    [dateInput, dateInput]
  );
  const ventasDesagregadas = await pool.query(
    "SELECT xppedidosdeta.idpedido,TIME(xppedidosdeta.fechatime) AS 'hora', xppedidosdeta.cantidad, xppedidosdeta.importe, xppedidosdeta.idpedidodeta, xppedidosdeta.pu, productos.idarticulo, productos.nombre AS nombreArt FROM xppedidos LEFT JOIN xppedidosdeta ON xppedidos.idpedido = xppedidosdeta.idpedido LEFT JOIN clientes ON clientes.idClientes = xppedidos.clientes_idClientes LEFT JOIN productos ON productos.idproductos = xppedidosdeta.productos_idproductos WHERE DATE(xppedidos.fechatime) = ? ORDER BY idpedido;",
    dateInput
  );
  //console.log(ventas);
  res.json({ ventas: ventas, ventasDesagregadas: ventasDesagregadas });
  res.end();
});

router.post("/reportesMFechas", async (req, res) => {
  const { dateInputS_mf, dateInputE_mf } = req.body;
  //console.log(dateInput);
  const ventas = await pool.query(
    "SELECT xppedidos.idpedido, DATE(xppedidos.fechatime) as 'fecha',TIME(xppedidos.fechatime) AS 'hora',clientes.direccion, direccion.latitud, direccion.longitud,direccion.ciudad ,usuarios.Nombre as 'usuario', usuarios.reparto , xppedidos.cantidad AS 'items', xppedidos.total AS 'monto',  clientes.Id_SistemaGestion AS 'codigo',clientes.nombre, 'venta' AS 'causa', xppedidos.observa AS 'observacion' FROM xppedidos LEFT JOIN clientes ON clientes.idClientes = xppedidos.clientes_idClientes LEFT JOIN direccion ON direccion.idDireccion = clientes.Direccion_idDireccion LEFT JOIN usuarios ON usuarios.idUsuarios = xppedidos.usuarios_idUsuarios WHERE (DATE(xppedidos.fechatime) <= ? AND DATE(xppedidos.fechatime) >= ?) UNION ALL SELECT CONCAT(xppedidossinvisitar.idxppedidosSinVisitar,'NV') as 'idpedido', DATE(xppedidossinvisitar.fechatime) as 'fecha',TIME(xppedidossinvisitar.fechatime) AS 'hora',clientes.direccion, direccion.latitud, direccion.longitud,direccion.ciudad ,usuarios.Nombre as 'usuario', usuarios.reparto , 0 AS 'items', 0 AS 'monto',  clientes.Id_SistemaGestion AS 'codigo',clientes.nombre, xppedidossinvisitar.causa, xppedidossinvisitar.observacion  FROM xppedidossinvisitar LEFT JOIN clientes ON clientes.idClientes = xppedidossinvisitar.clientes_idClientes LEFT JOIN direccion ON direccion.idDireccion = clientes.Direccion_idDireccion LEFT JOIN usuarios ON usuarios.idUsuarios = xppedidossinvisitar.usuarios_idUsuarios WHERE (DATE(xppedidossinvisitar.fechatime) <= ? AND DATE(xppedidossinvisitar.fechatime) >= ?) ORDER BY fecha,hora;",
    [dateInputE_mf, dateInputS_mf, dateInputE_mf, dateInputS_mf]
  );
  const ventasDesagregadas = await pool.query(
    "SELECT xppedidosdeta.idpedido,TIME(xppedidosdeta.fechatime) AS 'hora', xppedidosdeta.cantidad, xppedidosdeta.importe, xppedidosdeta.idpedidodeta, xppedidosdeta.pu, productos.idarticulo, productos.nombre AS nombreArt FROM xppedidos LEFT JOIN xppedidosdeta ON xppedidos.idpedido = xppedidosdeta.idpedido LEFT JOIN clientes ON clientes.idClientes = xppedidos.clientes_idClientes LEFT JOIN productos ON productos.idproductos = xppedidosdeta.productos_idproductos WHERE (DATE(xppedidos.fechatime) <= ? AND DATE(xppedidos.fechatime) >= ?) ORDER BY idpedido;",
    [dateInputE_mf, dateInputS_mf]
  );
  //console.log(ventas);
  //console.log(ventasDesagregadas);
  res.json({ ventas: ventas, ventasDesagregadas: ventasDesagregadas });
  res.end();
});

router.post("/reportesReparto", async (req, res) => {
  const { dateInputS, dateInputE, dia, turno, usuario } = req.body;
  //console.log(dateInput);
  var usuarioC = JSON.parse(usuario).idUsuarios;
  var turnoC = JSON.parse(turno).turno;
  var diaC = JSON.parse(dia).dia;
  var inputs = [
    dateInputE,
    dateInputS,
    diaC,
    usuarioC,
    turnoC,
    dateInputE,
    dateInputS,
    diaC,
    usuarioC,
    turnoC,
  ];
  //console.log(inputs);
  const ventas = await pool.query(
    "SELECT xppedidos.idpedido, DATE(xppedidos.fechatime) as 'fecha',TIME(xppedidos.fechatime) AS 'hora',clientes.direccion, direccion.latitud, direccion.longitud,direccion.ciudad ,usuarios.Nombre as 'usuario', usuarios.reparto , xppedidos.cantidad AS 'items', xppedidos.total AS 'monto',  clientes.Id_SistemaGestion AS 'codigo',clientes.nombre, 'venta' AS 'causa', xppedidos.observa AS 'observacion' FROM xppedidos LEFT JOIN clientes ON clientes.idClientes = xppedidos.clientes_idClientes LEFT JOIN direccion ON direccion.idDireccion = clientes.Direccion_idDireccion LEFT JOIN usuarios ON usuarios.idUsuarios = xppedidos.usuarios_idUsuarios WHERE (DATE(xppedidos.fechatime) <= ? AND DATE(xppedidos.fechatime) >= ? AND xppedidos.clientes_idClientes IN (SELECT clientes.idClientes FROM itinerario LEFT JOIN secuenciamiento ON itinerario.idItinerario = secuenciamiento.Itinerario_idItinerario LEFT JOIN clientes ON (clientes.idClientes = secuenciamiento.Clientes_idClientes_destino OR clientes.idClientes = secuenciamiento.Clientes_idClientes_origen) WHERE itinerario.dia = ? AND itinerario.Usuarios_idUsuarios = ? AND itinerario.turno = ? GROUP BY clientes.idClientes)) UNION ALL SELECT CONCAT(xppedidossinvisitar.idxppedidosSinVisitar,'NV') as 'idpedido', DATE(xppedidossinvisitar.fechatime) as 'fecha',TIME(xppedidossinvisitar.fechatime) AS 'hora',clientes.direccion, direccion.latitud, direccion.longitud,direccion.ciudad ,usuarios.Nombre as 'usuario', usuarios.reparto , 0 AS 'items', 0 AS 'monto',  clientes.Id_SistemaGestion AS 'codigo',clientes.nombre, xppedidossinvisitar.causa, xppedidossinvisitar.observacion  FROM xppedidossinvisitar LEFT JOIN clientes ON clientes.idClientes = xppedidossinvisitar.clientes_idClientes LEFT JOIN direccion ON direccion.idDireccion = clientes.Direccion_idDireccion LEFT JOIN usuarios ON usuarios.idUsuarios = xppedidossinvisitar.usuarios_idUsuarios WHERE (DATE(xppedidossinvisitar.fechatime) <= ? AND DATE(xppedidossinvisitar.fechatime) >= ? AND xppedidossinvisitar.clientes_idClientes IN (SELECT clientes.idClientes FROM itinerario LEFT JOIN secuenciamiento ON itinerario.idItinerario = secuenciamiento.Itinerario_idItinerario LEFT JOIN clientes ON (clientes.idClientes = secuenciamiento.Clientes_idClientes_destino OR clientes.idClientes = secuenciamiento.Clientes_idClientes_origen) WHERE itinerario.dia = ? AND itinerario.Usuarios_idUsuarios = ? AND itinerario.turno = ? GROUP BY clientes.idClientes)) ORDER BY fecha,hora;",
    inputs
  );
  const ventasDesagregadas = await pool.query(
    "SELECT xppedidosdeta.idpedido,TIME(xppedidosdeta.fechatime) AS 'hora', xppedidosdeta.cantidad, xppedidosdeta.importe, xppedidosdeta.idpedidodeta, xppedidosdeta.pu, productos.idarticulo, productos.nombre AS nombreArt FROM xppedidos LEFT JOIN xppedidosdeta ON xppedidos.idpedido = xppedidosdeta.idpedido LEFT JOIN clientes ON clientes.idClientes = xppedidos.clientes_idClientes LEFT JOIN productos ON productos.idproductos = xppedidosdeta.productos_idproductos WHERE (DATE(xppedidos.fechatime) <= ? AND DATE(xppedidos.fechatime) >= ? AND xppedidos.usuarios_idUsuarios = ? AND xppedidos.clientes_idClientes IN (SELECT clientes.idClientes FROM itinerario LEFT JOIN secuenciamiento ON itinerario.idItinerario = secuenciamiento.Itinerario_idItinerario LEFT JOIN clientes ON (clientes.idClientes = secuenciamiento.Clientes_idClientes_destino OR clientes.idClientes = secuenciamiento.Clientes_idClientes_origen) WHERE itinerario.dia = ? AND itinerario.Usuarios_idUsuarios = ? AND itinerario.turno = ? GROUP BY clientes.idClientes));",
    inputs
  );

  //console.log(ventas);
  //console.log(ventasDesagregadas);
  res.json({ ventas: ventas, ventasDesagregadas: ventasDesagregadas });
  res.end();
});

router.post("/reportesCliente", async (req, res) => {
  const { clientHelp_c, dateInputS_c, dateInputE_c } = req.body;
  //console.log(dateInput);
  const ventas = await pool.query(
    "SELECT xppedidos.idpedido, DATE(xppedidos.fechatime) as 'fecha',TIME(xppedidos.fechatime) AS 'hora',clientes.direccion, xppedidos.latitud, xppedidos.longitud,direccion.ciudad ,usuarios.Nombre as 'usuario', usuarios.reparto , xppedidos.cantidad AS 'items', xppedidos.total AS 'monto',  clientes.Id_SistemaGestion AS 'codigo',clientes.nombre, 'venta' AS 'causa', xppedidos.observa AS 'observacion' FROM xppedidos LEFT JOIN clientes ON clientes.idClientes = xppedidos.clientes_idClientes LEFT JOIN direccion ON direccion.idDireccion = clientes.Direccion_idDireccion LEFT JOIN usuarios ON usuarios.idUsuarios = xppedidos.usuarios_idUsuarios WHERE (xppedidos.clientes_idClientes = ? AND DATE(xppedidos.fechatime) <= ? AND DATE(xppedidos.fechatime) >= ?) UNION ALL SELECT CONCAT(xppedidossinvisitar.idxppedidosSinVisitar,'NV') as 'idpedido', DATE(xppedidossinvisitar.fechatime) as 'fecha',TIME(xppedidossinvisitar.fechatime) AS 'hora',clientes.direccion, direccion.latitud, direccion.longitud,direccion.ciudad ,usuarios.Nombre as 'usuario', usuarios.reparto , 0 AS 'items', 0 AS 'monto',  clientes.Id_SistemaGestion AS 'codigo',clientes.nombre, xppedidossinvisitar.causa, xppedidossinvisitar.observacion  FROM xppedidossinvisitar LEFT JOIN clientes ON clientes.idClientes = xppedidossinvisitar.clientes_idClientes LEFT JOIN direccion ON direccion.idDireccion = clientes.Direccion_idDireccion LEFT JOIN usuarios ON usuarios.idUsuarios = xppedidossinvisitar.usuarios_idUsuarios WHERE (xppedidossinvisitar.clientes_idClientes = ? AND DATE(xppedidossinvisitar.fechatime) <= ? AND DATE(xppedidossinvisitar.fechatime) >= ?) ORDER BY fecha,hora;",
    [clientHelp_c, dateInputE_c, dateInputS_c, clientHelp_c ,dateInputE_c, dateInputS_c]
  );
  const ventasDesagregadas = await pool.query(
    "SELECT xppedidosdeta.idpedido,TIME(xppedidosdeta.fechatime) AS 'hora', xppedidosdeta.cantidad, xppedidosdeta.importe, xppedidosdeta.idpedidodeta, xppedidosdeta.pu, productos.idarticulo, productos.nombre AS nombreArt FROM xppedidos LEFT JOIN xppedidosdeta ON xppedidos.idpedido = xppedidosdeta.idpedido LEFT JOIN clientes ON clientes.idClientes = xppedidos.clientes_idClientes LEFT JOIN productos ON productos.idproductos = xppedidosdeta.productos_idproductos WHERE (xppedidos.clientes_idClientes = ? AND DATE(xppedidos.fechatime) <= ? AND DATE(xppedidos.fechatime) >= ?) ORDER BY idpedido;",
    [clientHelp_c, dateInputE_c, dateInputS_c]
  );
  //console.log(ventas);
  //console.log(ventasDesagregadas);
  res.json({ ventas: ventas, ventasDesagregadas: ventasDesagregadas });
  res.end();
});

router.get("/", isLoggedIn, (req, res) => {
  res.render("ventas/ventas", {
    style: "boostrap-table.css",
    clients: true,
  });
});
router.post("/alta", async (req, res) => {
  const { ordenVenta, venta_producto } = req.body;
  var n_ordenVenta = JSON.parse(JSON.stringify(ordenVenta));
  var n_venta_producto = JSON.parse(JSON.stringify(venta_producto));
  n_ordenVenta = JSON.parse(n_ordenVenta);
  n_venta_producto = JSON.parse(n_venta_producto);
  //n_ordenVenta.usuarios_idUsuarios = req.user.idUsuarios;
  n_ordenVenta.cidterminal = "0".repeat(3-n_ordenVenta.usuarios_idUsuarios.toString().length) + n_ordenVenta.usuarios_idUsuarios.toString();
  //console.log(n_ordenVenta);
  //console.log(n_venta_producto);
  await pool.query(
    "INSERT INTO xppedidos set ?",
    [n_ordenVenta],
    async (err, fila) => {
      if (!err) {
        var idVenta = fila.insertId;
        var newSaleData = [];
        var cid =
          "DSL" +
          n_ordenVenta.cidterminal +
          "0".repeat(8 - idVenta.toString().length) +
          idVenta.toString();
        var updateSale = { cid: cid };
        for (let j = 0; j < n_venta_producto.length; j++) {
          n_venta_producto[j].pu = parseFloat(n_venta_producto[j].pu);
          n_venta_producto[j].cantidad = parseFloat(
            n_venta_producto[j].cantidad
          );
          n_venta_producto[j].importe = parseFloat(n_venta_producto[j].importe);
          n_venta_producto[j].idpedido = idVenta;
          n_venta_producto[j].estado = "C";
          n_venta_producto[j].cidempresa = "DON";
          n_venta_producto[j].cidterminal = n_ordenVenta.cidterminal;
          n_venta_producto[j].cid = cid;
          newSaleData.push([
            n_venta_producto[j].idproductos,
            n_venta_producto[j].cantidad,
            n_venta_producto[j].pu,
            n_venta_producto[j].importe,
            n_venta_producto[j].fechatime,
            n_venta_producto[j].idpedido,
            n_venta_producto[j].idarticulo,
            n_venta_producto[j].estado,
            n_venta_producto[j].cidempresa,
            n_venta_producto[j].cidterminal,
            n_venta_producto[j].cid,
          ]);
        }
        await pool.query(
          "INSERT INTO xppedidosdeta (productos_idproductos,cantidad,pu,importe,fechatime,idpedido,idarticulo,estado,cidempresa,cidterminal,cid) VALUES ?",
          [newSaleData],
          async (err1, fila1) => {
            if (!err1) {
              /* Despues de cargar la orden de venta, se actualizar el cid como la concatenacion de campos */
              await pool.query(
                "UPDATE xppedidos SET ? WHERE idpedido = ?;",
                [updateSale, idVenta],
                async (err2, fila2) => {
                  if (!err2) {
                    res.json(JSON.stringify(n_venta_producto));
                    res.end();
                  } else {
                    console.log(err2);
                  }
                }
              );
            } else {
              console.log(err1);
            }
          }
        );
      } else {
        console.log(err);
      }
    }
  );
});

router.post("/altaNoOrden", async (req, res) => {
  const { ordenVenta } = req.body;
  var n_ordenVenta = JSON.parse(JSON.stringify(ordenVenta));
  n_ordenVenta = JSON.parse(n_ordenVenta);
  //n_ordenVenta.usuarios_idUsuarios = req.user.idUsuarios;
  await pool.query("INSERT INTO xppedidossinvisitar set ?", [n_ordenVenta]);
  res.json(JSON.stringify(n_ordenVenta));
  res.end();
});

function IfNaN(parameter) {
  if (isNaN(parameter)) {
    return null;
  } else {
    return parameter;
  }
}
module.exports = router;
