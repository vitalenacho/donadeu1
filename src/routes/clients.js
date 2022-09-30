const express = require("express");
const router = express.Router();
const { isLoggedIn, isLoggedInSale } = require("../lib/auth");
const helpers = require("../lib/helpers.js");

const pool = require("../database.js"); // pool === Database o conexion con la base de datos

router.get("/alta", isLoggedIn, (req, res) => {
  res.render("clients/alta", {
    style: "clients.css",
    apiKey: "yKsNO9XriVmWrprNNiosXTalHQBu5SUyde4CwLoYJYQ",
    form: true,
  });
});
router.get("/", isLoggedIn, (req, res) => {
  res.render("clients/clientes", {
    style: "clients.css",
    clients: true,
  });
});
/*
router.post('/alta', async(req, res) => {
    const { fechaAlta, nombre, local, cuit, cuil, telefono, telefono2, correo, direccionData, lat, lon, Estado, observacion, direccion } = req.body;
    const newClient = {
        'nombre': nombre,
        'local': local,
        'telefono': telefono,
        'fechaAlta': fechaAlta,
        'telefono2': telefono2,
        'correo': correo,
        'cuit': cuit,
        'cuil': cuil,
        'Estado': Estado,
        'direccion': direccion
    };
    var direction = JSON.parse(direccionData);
    //console.log(direction);
    if (direction.street != null) {
        var newDirection = {
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

    var fechaFinal = new Date().toLocaleString();

    const newClientDB = {
        cliente: nombre,
        direccion: newDirection.calle + " " + newDirection.numero,
        localidad: newDirection.ciudad,
        email: correo,
        cidempresa: "DON",
        fechaact: fechaFinal,
        temp: 0,
        deleted: 0
    }


    await pool.query('INSERT INTO direccion set ?', [newDirection], async(err, fila) => {
        if (!err) {
            newClient.Direccion_idDireccion = fila.insertId;
            await pool.query('INSERT INTO clientes set ?', [newClient]);
            await pool.query('INSERT INTO xpclientes set ?', [newClientDB]);
            req.flash('success', 'Cliente creado satisfactoriamente');
            res.redirect('/clientes');
        } else {
            console.log(err);
        }
    });
});
*/

router.post("/alta",isLoggedInSale, async (req, res) => {
  const {
    fechaAlta,
    nombre,
    local,
    cuit,
    cuil,
    telefono,
    telefono2,
    correo,
    direccionData,
    lat,
    lon,
    Estado,
    observacion,
    direccion,
  } = req.body;
  const newClient = {
    nombre: nombre,
    local: local,
    telefono: telefono,
    fechaAlta: fechaAlta,
    telefono2: telefono2,
    correo: correo,
    cuit: cuit,
    cuil: cuil,
    Estado: Estado,
    direccion: direccion,
    Id_SistemaGestion: 0,
    usuarioAlta: req.user.idUsuarios,
  };
  var direction = JSON.parse(direccionData);
  //console.log(direction);
  if (direction.street != null) {
    var newDirection = {
      calle: direction.street,
      numero: direction.houseNumber,
      ciudad: direction.city,
      provincia: direction.state,
      pais: direction.countryCode,
      codigoPostal: direction.postalCode,
      latitud: lat,
      longitud: lon,
      departamento: "nulo",
      observacion: observacion,
    };
  } else {
    var newDirection = {
      calle: direction.Street,
      numero: direction.HouseNumber,
      ciudad: direction.City,
      provincia: direction.State,
      pais: direction.Country,
      codigoPostal: direction.PostalCode,
      latitud: lat,
      longitud: lon,
      departamento: "nulo",
      observacion: observacion,
    };
  }

  var options = {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  };

  //var fechaFinal = new Date().toLocaleDateString("es-AR", options).split("/").reverse().join("-");

  const newClientDB = {
    cliente: nombre,
    direccion: newDirection.calle + " " + newDirection.numero,
    localidad: newDirection.ciudad,
    email: correo,
    cidempresa: "DON",
    fechaact: fechaAlta,
    temp: 0,
    deleted: 0,
  };

  await pool.query(
    "INSERT INTO direccion set ?",
    [newDirection],
    async (err, fila) => {
      if (!err) {
        newClient.Direccion_idDireccion = fila.insertId;
        await pool.query(
          "INSERT INTO clientes set ?",
          [newClient],
          async (err1, fila1) => {
            if (!err1) {
              newClient.idClientes = fila1.insertId;
              await pool.query(
                "INSERT INTO xpclientes set ?",
                [newClientDB],
                async (err2, fila2) => {
                  if (!err2) {
                    newClient.codigo = 0;
                    newClient.idDireccion = newClient.Direccion_idDireccion;
                    res.json(JSON.stringify({message: "El cliente fue cargado con exito",result:"OK",cliente:newClient}));
                    res.end();
                  } else {
                    res.status(502).send(err2);
                    //res.json(JSON.stringify({message: "Problemas en la carga del cliente",result:"NO"}));
                    //res.end();
                  }
                }
              );
            } else {
                res.status(502).send(err1);
              //res.json(JSON.stringify({message: "Problemas en la carga del cliente",result:"NO"}));
              //res.end();
            }
          }
        );
      } else {
        res.status(502).send(err);
        //res.json(JSON.stringify({message: "Problemas en la carga del cliente",result:"NO"}));
        //res.end();
      }
    }
  );

});

router.get("/modificar", isLoggedIn, async (req, res) => {
  const clients = await pool.query(
    "SELECT clientes.idClientes, clientes.nombre, clientes.local, clientes.telefono, clientes.telefono2, clientes.cuit, clientes.cuil, clientes.correo, clientes.Id_SistemaGestion, clientes.Estado, clientes.direccion, direccion.idDireccion, direccion.calle, direccion.numero, direccion.codigoPostal, direccion.ciudad, direccion.pais, direccion.latitud AS lat, direccion.longitud AS lon, direccion.observacion,clientes.nombre AS Nombre, clientes.local AS Local, clientes.Id_SistemaGestion AS Código, clientes.direccion AS Dirección FROM clientes JOIN direccion WHERE clientes.Direccion_idDireccion = direccion.idDireccion"
  );
  //const clients = await pool.query("SELECT clientes.idClientes, clientes.nombre, clientes.local, clientes.telefono, clientes.telefono2, clientes.cuit, clientes.cuil, clientes.correo, clientes.Id_SistemaGestion, clientes.Estado, direccion.idDireccion, direccion.calle, direccion.numero, direccion.codigoPostal, direccion.ciudad, direccion.pais, direccion.latitud AS lat, direccion.longitud AS lon, direccion.observacion,clientes.nombre AS Nombre, clientes.local AS Local, clientes.Id_SistemaGestion AS Código, CONCAT(direccion.calle, ' ' , direccion.numero,', ', direccion.ciudad) AS Dirección FROM clientes JOIN direccion WHERE clientes.Direccion_idDireccion = direccion.idDireccion");
  //console.log(Object.keys(clients[0]));
  res.render("clients/modificar", {
    style: "clients.css",
    apiKey: "yKsNO9XriVmWrprNNiosXTalHQBu5SUyde4CwLoYJYQ",
    clientesData: JSON.stringify(clients),
    clientesKeys: ["Código", "Nombre", "Local", "Dirección"],
    form: true,
  });
});

router.post("/modificar", async (req, res) => {
  //console.log(req.body);
  const {
    fechaMod,
    nombre,
    local,
    cuit,
    cuil,
    telefono,
    telefono2,
    correo,
    idDireccion,
    direccionData,
    lat,
    lon,
    clienteModificar,
    Id_SistemaGestion,
    Estado,
    observacion,
    direccion,
  } = req.body;

  var newClient = {
    nombre: nombre,
    local: local,
    telefono: IfNaN(parseInt(telefono)),
    telefono2: IfNaN(parseInt(telefono2)),
    correo: correo,
    cuit: IfNaN(parseInt(cuit)),
    cuil: IfNaN(parseInt(cuil)),
    Id_SistemaGestion: IfNaN(parseInt(Id_SistemaGestion)),
    Estado: Estado,
    direccion: direccion,
  };
  var direction = JSON.parse(direccionData);
  if (direction.street != null) {
    var newDirection = {
      calle: direction.street,
      numero: direction.houseNumber,
      ciudad: direction.city,
      provincia: direction.state,
      pais: direction.countryCode,
      codigoPostal: direction.postalCode,
      latitud: lat,
      longitud: lon,
      departamento: "nulo",
      observacion: observacion,
    };
  } else {
    var newDirection = {
      calle: direction.Street,
      numero: direction.HouseNumber,
      ciudad: direction.City,
      provincia: direction.State,
      pais: direction.Country,
      codigoPostal: direction.PostalCode,
      latitud: lat,
      longitud: lon,
      departamento: "nulo",
      observacion: observacion,
    };
  }
  const oldClientData = JSON.parse(clienteModificar);
  const oldClient = {
    nombre: oldClientData.nombre,
    local: oldClientData.local,
    telefono: IfNaN(parseInt(oldClientData.telefono)),
    telefono2: IfNaN(parseInt(oldClientData.telefono2)),
    correo: oldClientData.correo,
    cuit: IfNaN(parseInt(oldClientData.cuit)),
    cuil: IfNaN(parseInt(oldClientData.cuil)),
    Id_SistemaGestion: IfNaN(parseInt(oldClientData.Id_SistemaGestion)),
    Estado: oldClientData.Estado,
    direccion: oldClientData.direccion,
  };
  //console.log(JSON.stringify(oldClient));
  //console.log(JSON.stringify(newClient));
  const oldDirection = {
    calle: oldClientData.calle,
    numero: oldClientData.numero,
    ciudad: oldClientData.ciudad,
    provincia: oldClientData.provincia,
    pais: oldClientData.pais,
    codigoPostal: oldClientData.codigoPostal,
    latitud: oldClientData.lat,
    longitud: oldClientData.lon,
    departamento: "nulo",
    observacion: oldClientData.observacion,
  };
  if (JSON.stringify(newClient) != JSON.stringify(oldClient)) {
    //console.log(JSON.stringify(newClient));
    //console.log(JSON.stringify(oldClient));
    newClient.usuarioMod = req.user.idUsuarios;
    newClient.modificado = 1;
    newClient.fechaMod = fechaMod;
    await pool.query(
      "UPDATE clientes SET ? WHERE idClientes = ?",
      [newClient, oldClientData.idClientes],
      async (err, fila) => {
        if (!err) {
          if (JSON.stringify(newDirection) != JSON.stringify(oldDirection)) {
            //console.log(JSON.stringify(newDirection));
            //console.log(JSON.stringify(oldDirection));
            await pool.query(
              "UPDATE direccion SET ? WHERE idDireccion = ?",
              [newDirection, idDireccion],
              async (err, fila) => {
                if (!err) {
                  req.flash(
                    "success",
                    "Se modifico el Cliente y su Dirección satisfactoriamente"
                  );
                  res.redirect("/clientes");
                } else {
                  console.log(err);
                }
              }
            );
          } else {
            req.flash("success", "¡Cliente modificado satisfactoriamente!");
            res.redirect("/clientes");
          }
          //req.flash('success', 'Cliente modificado satisfactoriamente');
          //res.redirect('/clientes');
        } else {
          console.log(err);
        }
      }
    );
  } else {
    if (JSON.stringify(newDirection) != JSON.stringify(oldDirection)) {
      //console.log(JSON.stringify(newDirection));
      //console.log(JSON.stringify(oldDirection));
      newClient = {};
      newClient.modificado = 1;
      newClient.fechaMod = fechaMod;
      newClient.usuarioMod = req.user.idUsuarios;
      await pool.query(
        "UPDATE clientes SET ? WHERE idClientes = ?",
        [newClient, oldClientData.idClientes],
        async (err, fila) => {
          if (!err) {
            if (JSON.stringify(newDirection) != JSON.stringify(oldDirection)) {
              //console.log(JSON.stringify(newDirection));
              //console.log(JSON.stringify(oldDirection));
              await pool.query(
                "UPDATE direccion SET ? WHERE idDireccion = ?",
                [newDirection, idDireccion],
                async (err, fila) => {
                  if (!err) {
                    req.flash(
                      "success",
                      "Se modifico el Cliente y su Dirección satisfactoriamente"
                    );
                    res.redirect("/clientes");
                  } else {
                    console.log(err);
                  }
                }
              );
            } else {
              req.flash("success", "¡Cliente modificado satisfactoriamente!");
              res.redirect("/clientes");
            }
            //req.flash('success', 'Cliente modificado satisfactoriamente');
            //res.redirect('/clientes');
          } else {
            console.log(err);
          }
        }
      );
    } else {
      req.flash("message", "¡No se realizaron cambios!");
      res.redirect("/clientes");
    }
    //req.flash("message", '¡No se realizaron cambios!');
    //res.redirect('/clientes');
  }
});

router.get("/baja", isLoggedIn, async (req, res) => {
  const clients = await pool.query(
    "SELECT clientes.idClientes, clientes.nombre, clientes.local, clientes.telefono, clientes.correo, clientes.Direccion_idDireccion, direccion.calle, direccion.numero, direccion.codigoPostal, direccion.ciudad, direccion.pais, direccion.latitud AS lat, direccion.longitud AS lon  FROM clientes JOIN direccion WHERE clientes.Direccion_idDireccion = direccion.idDireccion"
  );
  //console.log(clients);
  res.render("clients/baja", {
    style: "clients.css",
    apiKey: "yKsNO9XriVmWrprNNiosXTalHQBu5SUyde4CwLoYJYQ",
    clientesData: clients,
    form: true,
  });
});

router.post("/baja", async (req, res) => {
  //console.log(req.body);
  const { clienteModificar } = req.body;

  const oldClientData = JSON.parse(clienteModificar);
  //console.log(oldClientData);

  await pool.query(
    "DELETE FROM clientes WHERE idClientes = ?",
    [oldClientData.idClientes],
    async (err, fil) => {
      if (!err) {
        await pool.query(
          "DELETE FROM direccion WHERE idDireccion = ?",
          [oldClientData.Direccion_idDireccion],
          async (err1, fila) => {
            if (!err1) {
              req.flash("success", "Cliente eliminado satisfactoriamente");
              res.redirect("/clientes");
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

router.get("/visual", isLoggedIn, async (req, res) => {
  const clients = await pool.query(
    "SELECT clientes.idClientes, clientes.nombre, clientes.local, clientes.telefono, clientes.telefono2, clientes.cuit, clientes.cuil, clientes.correo, clientes.Id_SistemaGestion, clientes.Estado, clientes.direccion, direccion.idDireccion, direccion.calle, direccion.numero, direccion.codigoPostal, direccion.ciudad, direccion.pais, direccion.latitud AS lat, direccion.longitud AS lon, direccion.observacion,clientes.nombre AS Nombre, clientes.local AS Local, clientes.Id_SistemaGestion AS Código, clientes.direccion AS Dirección FROM clientes JOIN direccion WHERE clientes.Direccion_idDireccion = direccion.idDireccion"
  );
  //const clients = await pool.query("SELECT clientes.idClientes, clientes.nombre, clientes.local, clientes.telefono, clientes.telefono2, clientes.cuit, clientes.cuil, clientes.correo, clientes.Id_SistemaGestion, clientes.Estado, direccion.idDireccion, direccion.calle, direccion.numero, direccion.codigoPostal, direccion.ciudad, direccion.pais, direccion.latitud AS lat, direccion.longitud AS lon, direccion.observacion,clientes.nombre AS Nombre, clientes.local AS Local, clientes.Id_SistemaGestion AS Código, CONCAT(direccion.calle, ' ' , direccion.numero,', ', direccion.ciudad) AS Dirección FROM clientes JOIN direccion WHERE clientes.Direccion_idDireccion = direccion.idDireccion");
  //console.log(Object.keys(clients[0]));
  res.render("clients/visual", {
    style: "clients.css",
    apiKey: "yKsNO9XriVmWrprNNiosXTalHQBu5SUyde4CwLoYJYQ",
    clientesData: JSON.stringify(clients),
    clientesKeys: ["Código", "Nombre", "Local", "Dirección"],
    form: true,
  });
});

function IfNaN(parameter) {
  if (isNaN(parameter)) {
    return null;
  } else {
    return parameter;
  }
}
module.exports = router;
