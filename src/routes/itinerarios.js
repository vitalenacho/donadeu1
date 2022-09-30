const express = require('express');
const router = express.Router();
const { isLoggedIn, isLoggedInSale} = require('../lib/auth');


const pool = require('../database.js'); // pool === Database o conexion con la base de datos


router.get('/', isLoggedIn, async(req, res) => {
    const idUsuario = req.user.idUsuarios
    const usuarios = await pool.query("SELECT * FROM usuarios WHERE reparto IS NOT NULL;");
    //const dias = [{ dia: "Lunes" }, { dia: "Martes" }, { dia: "Miercoles" }, { dia: "Jueves" }, { dia: "Viernes" }, { dia: "Sabado" }, { dia: "Rafaela" }, { dia: "Esperanza" }];
    const dias_turnos = await pool.query("SELECT dia,turno FROM itinerario GROUP BY dia,turno;"); 
    var dias = [];
    var turnos =[];
    var dias01 = [];
    var turno01 = [];
    dias_turnos.map(function(d_t) {
        if(!dias01.includes(d_t.dia)){
            dias01.push(d_t.dia);
            dias.push({dia: d_t.dia});
        }
        if(!turno01.includes(d_t.turno)){
            turno01.push(d_t.turno)
            turnos.push({turno: d_t.turno})
        }
    });
    //const itinerarios = await pool.query("SELECT * FROM itinerario WHERE Usuarios_idUsuarios = ?", [idUsuario]);
    //console.log(itinerarios);
    res.render('itinerarios/itinerarios', {
        style: 'itinerarios.css',
        usuarios: usuarios,
        dias: dias,
        turnos: turnos
    });
});

router.get('/visual', isLoggedIn, async(req, res) => {
    res.redirect('/itinerarios')
});


router.get('/alta', isLoggedIn, async(req, res) => {
    const idUsuario = req.user.idUsuarios;
    const clientes = await pool.query("SELECT direccion.idDireccion, direccion.latitud, direccion.longitud, clientes.nombre, clientes.idClientes, direccion.ciudad, clientes.direccion FROM secuenciamiento RIGHT JOIN clientes ON (clientes.idClientes != secuenciamiento.Clientes_idClientes_destino AND clientes.idClientes = secuenciamiento.Clientes_idClientes_origen) OR (clientes.idClientes = secuenciamiento.Clientes_idClientes_destino AND clientes.idClientes != secuenciamiento.Clientes_idClientes_origen) LEFT JOIN direccion ON clientes.Direccion_idDireccion = direccion.idDireccion WHERE (secuenciamiento.Itinerario_idItinerario IS NULL AND latitud !=0 AND longitud !=0) GROUP BY clientes.idClientes;");
    res.render('itinerarios/alta', {
        style: 'itinerariosABM.css',
        clientesSinAsignar: clientes
    });
});

//SELECT direccion.idDireccion, direccion.latitud, direccion.longitud, clientes.idClientes, secuenciamiento.DistanceClient_idDistanceClient AS CHECKEAR FROM secuenciamiento LEFT JOIN distanceclient ON secuenciamiento.DistanceClient_idDistanceClient = distanceclient.idDistanceClient RIGHT JOIN clientes ON (clientes.idClientes != distanceclient.Clientes_idClientes_destino AND clientes.idClientes = distanceclient.Clientes_idClientes_origen) OR (clientes.idClientes = distanceclient.Clientes_idClientes_destino AND clientes.idClientes != distanceclient.Clientes_idClientes_origen) LEFT JOIN direccion ON clientes.Direccion_idDireccion = direccion.idDireccion WHERE secuenciamiento.DistanceClient_idDistanceClient IS NULL GROUP BY direccion.idDireccion

router.post('/visual',isLoggedIn, async(req, res) => {
    //console.log(req.body);
    const { daySelected, userSelected, turnSelected } = req.body;
    //console.log([daySelected, userSelected, turnSelected]);
    if (daySelected != null && userSelected != null && turnSelected != null) {
        //var datosItinerarioCliente = JSON.parse(daySelected);
        //var itinerariosBD = await pool.query("SELECT direccion.idDireccion, direccion.latitud, direccion.longitud, secuenciamiento.orden, distancebase.Clientes_idClientes, distancebase.tiempoViaje, distancebase.distanciaViaje FROM secuenciamiento LEFT JOIN distancebase ON secuenciamiento.DistanceBase_idDistanceBase = distancebase.idDistanceBase LEFT JOIN almacen ON almacen.idAlmacen = distancebase.Almacen_idAlmacen LEFT JOIN direccion ON almacen.Direccion_idDireccion = direccion.idDireccion WHERE secuenciamiento.Itinerario_idItinerario = ? AND secuenciamiento.DistanceClient_idDistanceClient IS NULL UNION ALL SELECT direccion.idDireccion, direccion.latitud, direccion.longitud, secuenciamiento.orden, clientes.idClientes, distanceclient.tiempoViaje,distanceclient.distanciaViaje FROM secuenciamiento LEFT JOIN distanceclient ON secuenciamiento.DistanceClient_idDistanceClient = distanceclient.idDistanceClient LEFT JOIN clientes ON clientes.idClientes = distanceclient.Clientes_idClientes_destino OR clientes.idClientes = distanceclient.Clientes_idClientes_origen LEFT JOIN direccion ON clientes.Direccion_idDireccion = direccion.idDireccion WHERE secuenciamiento.Itinerario_idItinerario = ? AND secuenciamiento.DistanceBase_idDistanceBase IS NULL GROUP BY direccion.idDireccion ORDER BY orden", [datosItinerarioCliente.idItinerario, datosItinerarioCliente.idItinerario]);

        var dataUser = JSON.parse(userSelected);
        var dataDay = JSON.parse(daySelected);
        var dataTurn = JSON.parse(turnSelected);
        // CONSULTA POR DIA | USUARIO | TURNO
        //console.log(dataUser)
        var condiciones = [dataDay.dia, dataUser.idUsuarios, dataTurn.turno, dataDay.dia, dataUser.idUsuarios, dataTurn.turno, dataDay.dia, dataUser.idUsuarios, dataTurn.turno];
        var itinerariosBD = await pool.query("SELECT direccion.idDireccion, direccion.latitud, direccion.longitud, direccion.calle, direccion.numero, direccion.ciudad, direccion.provincia, direccion.pais, direccion.codigoPostal, direccion.observacion,'' AS direccion,'' AS codigo,'' AS idClientes, 0 AS orden,'Donadeu' As nombre FROM itinerario LEFT JOIN almacen ON almacen.idAlmacen = itinerario.Almacen_idAlmacen LEFT JOIN direccion ON almacen.Direccion_idDireccion = direccion.idDireccion WHERE itinerario.dia = ? AND itinerario.Usuarios_idUsuarios = ? AND itinerario.turno = ? UNION ALL SELECT direccion.idDireccion, direccion.latitud, direccion.longitud, direccion.calle, direccion.numero, direccion.ciudad, direccion.provincia, direccion.pais, direccion.codigoPostal, direccion.observacion,clientes.direccion,clientes.Id_SistemaGestion AS codigo, clientes.idClientes, MAX(secuenciamiento.orden), clientes.nombre FROM itinerario LEFT JOIN secuenciamiento ON itinerario.idItinerario = secuenciamiento.Itinerario_idItinerario LEFT JOIN clientes ON (secuenciamiento.Clientes_idClientes_origen = clientes.idClientes OR secuenciamiento.Clientes_idClientes_destino = clientes.idClientes) LEFT JOIN direccion ON clientes.Direccion_idDireccion = direccion.idDireccion WHERE itinerario.dia = ? AND itinerario.Usuarios_idUsuarios = ? AND itinerario.turno = ? GROUP BY clientes.idClientes UNION ALL SELECT direccion.idDireccion, direccion.latitud, direccion.longitud, direccion.calle, direccion.numero, direccion.ciudad, direccion.provincia, direccion.pais, direccion.codigoPostal, direccion.observacion,'' AS direccion,'' AS codigo,'' AS idClientes,99 AS orden,'Donadeu' As nombre FROM itinerario LEFT JOIN almacen ON almacen.idAlmacen = itinerario.Almacen_idAlmacen LEFT JOIN direccion ON almacen.Direccion_idDireccion = direccion.idDireccion WHERE itinerario.dia = ? AND itinerario.Usuarios_idUsuarios = ? AND itinerario.turno = ? ORDER BY orden;", condiciones);
        //console.log(itinerariosBD);

        // CONSULTA VIEJA V4
        //var itinerariosBD = await pool.query("SELECT direccion.idDireccion, direccion.latitud, direccion.longitud, direccion.calle, direccion.numero, direccion.ciudad, direccion.provincia, direccion.pais, direccion.codigoPostal, 0 AS orden,'Donadeu' As nombre FROM itinerario LEFT JOIN almacen ON almacen.idAlmacen = itinerario.Almacen_idAlmacen LEFT JOIN direccion ON almacen.Direccion_idDireccion = direccion.idDireccion WHERE itinerario.dia = ? AND itinerario.Usuarios_idUsuarios = ? AND itinerario.turno = ? UNION ALL SELECT direccion.idDireccion, direccion.latitud, direccion.longitud, direccion.calle, direccion.numero, direccion.ciudad, direccion.provincia, direccion.pais, direccion.codigoPostal, secuenciamiento.orden, clientes.nombre FROM itinerario LEFT JOIN secuenciamiento ON itinerario.idItinerario = secuenciamiento.Itinerario_idItinerario LEFT JOIN clientes ON (secuenciamiento.Clientes_idClientes_origen = clientes.idClientes OR secuenciamiento.Clientes_idClientes_destino = clientes.idClientes) LEFT JOIN direccion ON clientes.Direccion_idDireccion = direccion.idDireccion WHERE itinerario.dia = ? AND itinerario.Usuarios_idUsuarios = ? AND itinerario.turno = ? GROUP BY clientes.idClientes UNION ALL SELECT direccion.idDireccion, direccion.latitud, direccion.longitud, direccion.calle, direccion.numero, direccion.ciudad, direccion.provincia, direccion.pais, direccion.codigoPostal,99 AS orden,'Donadeu' As nombre FROM itinerario LEFT JOIN almacen ON almacen.idAlmacen = itinerario.Almacen_idAlmacen LEFT JOIN direccion ON almacen.Direccion_idDireccion = direccion.idDireccion WHERE itinerario.dia = ? AND itinerario.Usuarios_idUsuarios = ? AND itinerario.turno = ? ORDER BY orden;", condiciones);

        // CONSULTA VIEJA V3
        //var itinerariosBD = await pool.query("SELECT direccion.idDireccion, direccion.latitud, direccion.longitud, direccion.calle,0 AS orden,'Donadeu' As nombre FROM itinerario LEFT JOIN almacen ON almacen.idAlmacen = itinerario.Almacen_idAlmacen LEFT JOIN direccion ON almacen.Direccion_idDireccion = direccion.idDireccion WHERE itinerario.dia = ? AND itinerario.Usuarios_idUsuarios = ? AND itinerario.turno = ? UNION ALL SELECT direccion.idDireccion, direccion.latitud, direccion.longitud, direccion.calle, secuenciamiento.orden, clientes.nombre FROM itinerario LEFT JOIN secuenciamiento ON itinerario.idItinerario = secuenciamiento.Itinerario_idItinerario LEFT JOIN clientes ON (secuenciamiento.Clientes_idClientes_origen = clientes.idClientes OR secuenciamiento.Clientes_idClientes_destino = clientes.idClientes) LEFT JOIN direccion ON clientes.Direccion_idDireccion = direccion.idDireccion WHERE itinerario.dia = ? AND itinerario.Usuarios_idUsuarios = ? AND itinerario.turno = ? GROUP BY clientes.idClientes UNION ALL SELECT direccion.idDireccion, direccion.latitud, direccion.longitud, direccion.calle,99 AS orden,'Donadeu' As nombre FROM itinerario LEFT JOIN almacen ON almacen.idAlmacen = itinerario.Almacen_idAlmacen LEFT JOIN direccion ON almacen.Direccion_idDireccion = direccion.idDireccion WHERE itinerario.dia = ? AND itinerario.Usuarios_idUsuarios = ? AND itinerario.turno = ? ORDER BY orden;", condiciones);
        // CONSULTA VIEJA V2
        //var condiciones = [dataDay.dia, dataUser.idUsuarios, dataTurn.turno, dataDay.dia, dataUser.idUsuarios, dataTurn.turno];
        //var itinerariosBD = await pool.query("SELECT direccion.idDireccion, direccion.latitud, direccion.longitud, direccion.calle, secuenciamiento.orden, distancebase.Clientes_idClientes, clientes.nombre, distancebase.tiempoViaje, distancebase.distanciaViaje FROM itinerario LEFT JOIN secuenciamiento ON itinerario.idItinerario = secuenciamiento.Itinerario_idItinerario LEFT JOIN distancebase ON secuenciamiento.DistanceBase_idDistanceBase = distancebase.idDistanceBase LEFT JOIN almacen ON almacen.idAlmacen = distancebase.Almacen_idAlmacen LEFT JOIN direccion ON almacen.Direccion_idDireccion = direccion.idDireccion LEFT JOIN clientes ON clientes.idClientes = distancebase.Clientes_idClientes WHERE itinerario.dia = ? AND itinerario.Usuarios_idUsuarios = ? AND itinerario.turno = ? AND secuenciamiento.DistanceClient_idDistanceClient IS NULL UNION ALL SELECT direccion.idDireccion, direccion.latitud, direccion.longitud, direccion.calle, secuenciamiento.orden, clientes.idClientes, clientes.nombre, distanceclient.tiempoViaje,distanceclient.distanciaViaje FROM itinerario LEFT JOIN secuenciamiento ON itinerario.idItinerario = secuenciamiento.Itinerario_idItinerario LEFT JOIN distanceclient ON secuenciamiento.DistanceClient_idDistanceClient = distanceclient.idDistanceClient LEFT JOIN clientes ON clientes.idClientes = distanceclient.Clientes_idClientes_destino OR clientes.idClientes = distanceclient.Clientes_idClientes_destino LEFT JOIN direccion ON clientes.Direccion_idDireccion = direccion.idDireccion WHERE itinerario.dia = ? AND itinerario.Usuarios_idUsuarios = ? AND itinerario.turno = ? AND secuenciamiento.DistanceBase_idDistanceBase IS NULL GROUP BY direccion.idDireccion ORDER BY orden", condiciones);


        // CONSULTA VIEJA
        //var itinerariosBD = await pool.query("SELECT direccion.idDireccion, direccion.latitud, direccion.longitud, secuenciamiento.orden, distancebase.Clientes_idClientes, distancebase.tiempoViaje, distancebase.distanciaViaje FROM itinerario LEFT JOIN secuenciamiento ON itinerario.idItinerario = secuenciamiento.Itinerario_idItinerario LEFT JOIN distancebase ON secuenciamiento.DistanceBase_idDistanceBase = distancebase.idDistanceBase LEFT JOIN almacen ON almacen.idAlmacen = distancebase.Almacen_idAlmacen LEFT JOIN direccion ON almacen.Direccion_idDireccion = direccion.idDireccion WHERE itinerario.dia = ? AND itinerario.Usuarios_idUsuarios = ? AND itinerario.turno = ? AND secuenciamiento.DistanceClient_idDistanceClient IS NULL UNION ALL SELECT direccion.idDireccion, direccion.latitud, direccion.longitud, secuenciamiento.orden, clientes.idClientes, distanceclient.tiempoViaje,distanceclient.distanciaViaje FROM itinerario LEFT JOIN secuenciamiento ON itinerario.idItinerario = secuenciamiento.Itinerario_idItinerario LEFT JOIN distanceclient ON secuenciamiento.DistanceClient_idDistanceClient = distanceclient.idDistanceClient LEFT JOIN clientes ON clientes.idClientes = distanceclient.Clientes_idClientes_destino OR clientes.idClientes = distanceclient.Clientes_idClientes_origen LEFT JOIN direccion ON clientes.Direccion_idDireccion = direccion.idDireccion WHERE itinerario.dia = ? AND itinerario.Usuarios_idUsuarios = ? AND itinerario.turno = ? AND secuenciamiento.DistanceBase_idDistanceBase IS NULL GROUP BY direccion.idDireccion ORDER BY orden", condiciones);
        // SELECT direccion.idDireccion, direccion.latitud, direccion.longitud, secuenciamiento.orden, distancebase.Clientes_idClientes, distancebase.tiempoViaje, distancebase.distanciaViaje FROM itinerario LEFT JOIN secuenciamiento ON itinerario.idItinerario = secuenciamiento.Itinerario_idItinerario LEFT JOIN distancebase ON secuenciamiento.DistanceBase_idDistanceBase = distancebase.idDistanceBase LEFT JOIN almacen ON almacen.idAlmacen = distancebase.Almacen_idAlmacen LEFT JOIN direccion ON almacen.Direccion_idDireccion = direccion.idDireccion WHERE itinerario.dia = "Lunes" AND itinerario.Usuarios_idUsuarios = 1 AND itinerario.turno = "Mañana" AND secuenciamiento.DistanceClient_idDistanceClient IS NULL UNION ALL SELECT direccion.idDireccion, direccion.latitud, direccion.longitud, secuenciamiento.orden, clientes.idClientes, distanceclient.tiempoViaje,distanceclient.distanciaViaje FROM itinerario LEFT JOIN secuenciamiento ON itinerario.idItinerario = secuenciamiento.Itinerario_idItinerario LEFT JOIN distanceclient ON secuenciamiento.DistanceClient_idDistanceClient = distanceclient.idDistanceClient LEFT JOIN clientes ON clientes.idClientes = distanceclient.Clientes_idClientes_destino OR clientes.idClientes = distanceclient.Clientes_idClientes_origen LEFT JOIN direccion ON clientes.Direccion_idDireccion = direccion.idDireccion WHERE itinerario.dia = "Lunes" AND itinerario.Usuarios_idUsuarios = 1 AND itinerario.turno = "Mañana" AND secuenciamiento.DistanceBase_idDistanceBase IS NULL GROUP BY direccion.idDireccion ORDER BY orden

        //console.log(itinerariosBD[0])
        if (itinerariosBD[0] != undefined) {
            const inputs = [dataDay.dia, dataUser.idUsuarios, dataTurn.turno,dataDay.dia, dataUser.idUsuarios, dataTurn.turno];
            const products = await pool.query("SELECT * FROM productos");
            const ventas = await pool.query("SELECT xppedidos.idpedido, xppedidos.fechatime, xppedidos.clientes_idClientes, xppedidos.total, xppedidosdeta.idpedidodeta, xppedidosdeta.productos_idproductos AS idproductos, xppedidosdeta.cantidad, xppedidosdeta.importe, xppedidos.observa AS 'observacion', '-' AS 'causa' FROM xppedidosdeta LEFT JOIN xppedidos ON xppedidosdeta.idpedido = xppedidos.idpedido LEFT JOIN itinerario ON itinerario.dia = ? AND itinerario.Usuarios_idUsuarios = ? AND itinerario.turno = ? LEFT JOIN secuenciamiento ON (secuenciamiento.Clientes_idClientes_origen = xppedidos.clientes_idClientes OR secuenciamiento.Clientes_idClientes_destino = xppedidos.clientes_idClientes) WHERE DATE(xppedidos.fechatime) <= DATE(convert_tz(NOW(),'UTC','America/Argentina/Buenos_Aires')) AND DATE(xppedidos.fechatime) >= DATE(convert_tz(NOW(),'UTC','America/Argentina/Buenos_Aires'))-INTERVAL 2 WEEK GROUP BY xppedidosdeta.idpedidodeta UNION ALL SELECT CONCAT(xppedidossinvisitar.idxppedidosSinVisitar,'NV') AS 'idpedido', xppedidossinvisitar.fechatime, xppedidossinvisitar.clientes_idClientes, 0 AS 'total', 0 AS 'idpedidodeta', 0 AS idproductos, 0 AS 'cantidad', 0 AS 'importe', xppedidossinvisitar.observacion, xppedidossinvisitar.causa FROM xppedidossinvisitar LEFT JOIN itinerario ON itinerario.dia = ? AND itinerario.Usuarios_idUsuarios = ? AND itinerario.turno = ? LEFT JOIN secuenciamiento ON (secuenciamiento.Clientes_idClientes_origen = xppedidossinvisitar.clientes_idClientes OR secuenciamiento.Clientes_idClientes_destino = xppedidossinvisitar.clientes_idClientes) WHERE DATE(xppedidossinvisitar.fechatime) <= DATE(convert_tz(NOW(),'UTC','America/Argentina/Buenos_Aires')) AND DATE(xppedidossinvisitar.fechatime) >= DATE(convert_tz(NOW(),'UTC','America/Argentina/Buenos_Aires'))-INTERVAL 2 WEEK GROUP BY idpedido ORDER BY fechatime;", inputs);
            const repartoMeta = { dia: dataDay.dia, usuario: dataUser.Nombre, turno: dataTurn.turno };
            //console.log(itinerariosBD);
            //console.log(ventas);
            itinerariosBD[itinerariosBD.length - 1].ultimo = true;
            itinerariosBD[0].primero = true;
            res.render('itinerarios/visual', {
                style: 'visual.css',
                style2: 'boostrap-table.css',
                visual: true,
                itinerarios: itinerariosBD,
                idUsuarios: req.user.idUsuarios,
                Productos: products,
                ventas: ventas,
                repartoMeta: repartoMeta,
                apiKey: 'yKsNO9XriVmWrprNNiosXTalHQBu5SUyde4CwLoYJYQ'
            });
        } else {
            req.flash('message', 'NO EXISTEN DATOS PARA LA COMBINACIÓN INGRESADA');
            res.redirect("/itinerarios");
        }
    } else {
        req.flash('message', 'DEBES SELECCIONAR UNA COMBINACION DÍA | USUARIO | TURNO ');
        res.redirect("/itinerarios");
    }

});

router.post('/modificar',isLoggedInSale, async(req, res) => {
    //console.log(req.body);
    const { idDireccion, lat, lon, direccion, direccionData, observacion, OldDireccionData } = req.body;
    //console.log(req.body);
    var oldClientData = JSON.parse(OldDireccionData);
    var direction = JSON.parse(direccionData);
    if (direction.street != null) {
        var newDirection = {
            idDireccion: idDireccion,
            calle: direction.street,
            numero: direction.houseNumber,
            ciudad: direction.city,
            provincia: direction.state,
            pais: direction.countryCode,
            codigoPostal: direction.postalCode,
            latitud: lat,
            longitud: lon,
            departamento: "nulo",
            observacion: observacion
        };
    } else {
        var newDirection = {
            idDireccion: idDireccion,
            calle: direction.Street,
            numero: direction.HouseNumber,
            ciudad: direction.City,
            provincia: direction.State,
            pais: direction.Country,
            codigoPostal: direction.PostalCode,
            latitud: lat,
            longitud: lon,
            departamento: "nulo",
            observacion: observacion
        };
    }

    //console.log(JSON.stringify(newDirection));
    //console.log(JSON.stringify(oldDirection));
    newClient = {};
    newClient.modificado = 1;
    newClient.direccion = direccion;
    newClient.usuarioMod = req.user.idUsuarios;
    await pool.query('UPDATE clientes SET ? WHERE idClientes = ?', [newClient, oldClientData.idClientes], async(err, fila) => {
        if (!err) {
            //console.log(JSON.stringify(newDirection));
            //console.log(JSON.stringify(oldDirection));
            await pool.query('UPDATE direccion SET ? WHERE idDireccion = ?', [newDirection, idDireccion], async(err, fila) => {
                if (!err) {
                    res.end();
                    //req.flash('success', 'Se modifico el Cliente y su Dirección satisfactoriamente');
                    //res.redirect('/clientes');
                } else {
                    console.log(err);
                }
            });

        }
    });
});


module.exports = router;