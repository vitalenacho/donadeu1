const express = require("express");
const router = express.Router();
const { isLoggedIn, isLoggedProducts } = require("../lib/auth");
const helpers = require("../lib/helpers.js");

const pool = require("../database.js"); // pool === Database o conexion con la base de datos

router.get("/modificar", isLoggedProducts, async (req, res) => {
  const products = await pool.query(
    "SELECT productos.*, productos.idarticulo AS Código, productos.nombre AS Nombre, productos.alias AS Alias FROM productos"
  );
  res.render("productos/modificar", {
    style: "clients.css",
    productosData: JSON.stringify(products),
    productosKeys: ["Código", "Nombre", "Alias"],
    form: true,
  });
});

router.post("/modificar", async (req, res) => {
  //console.log(req.body);
  const {
    productoModificar,
    nombre,
    alias,
    precio1,
    precio2
  } = req.body;
  var oldProduct0 = JSON.parse(productoModificar);
  var oldProduct = {};
  oldProduct.idproductos = oldProduct0.idproductos, oldProduct.idarticulo = oldProduct0.idarticulo, oldProduct.nombre = oldProduct0.nombre,oldProduct.alias = oldProduct0.alias, oldProduct.precio1 = parseFloat(oldProduct0.precio1), oldProduct.precio2 = parseFloat(oldProduct0.precio2);
  var newProduct = {};
  newProduct.idproductos = oldProduct.idproductos,newProduct.idarticulo = oldProduct.idarticulo,newProduct.nombre = nombre,newProduct.alias = alias, newProduct.precio1 = parseFloat(precio1), newProduct.precio2 = parseFloat(precio2);
  var newProduct2 = JSON.parse(JSON.stringify(newProduct));
  delete newProduct2.alias;
  //console.log({oldProduct:JSON.stringify(oldProduct),newProduct:JSON.stringify(newProduct),logica: JSON.stringify(oldProduct) != JSON.stringify(newProduct)})
  if (JSON.stringify(oldProduct) != JSON.stringify(newProduct)) {

    await pool.query(
      "UPDATE xparticulos SET ? WHERE idarticulo = ?",
      [newProduct2, newProduct2.idarticulo],
      async (err, fila) => {
        if (!err) {
            await pool.query(
              "UPDATE productos SET ? WHERE idproductos = ?",
              [newProduct, newProduct.idproductos],
              async (err1, fila) => {
                if (!err1) {
                  req.flash(
                    "success",
                    "Se modificaron los datos del producto"
                  );
                  res.redirect("/dashboard");
                } else {
                  console.log(err);
                }
              }
            );
          
        } else {
          console.log(err);
        }
      }
    );
  } else {
      req.flash("message", "¡No se realizaron cambios en el PRODUCTO!");
      res.redirect("/dashboard");
  }
});

router.post("/altaViejo", async (req, res) => {
  await pool.query(
    "INSERT INTO productos (nombre, precio1, precio2, medida, peso, tipo, idarticulo, esdescuento, cidempresa, fechaact, temp, deleted, modificado) SELECT xparticulos.nombre, xparticulos.precio1, xparticulos.precio2, xparticulos.medida, xparticulos.peso, xparticulos.tipo, xparticulos.idarticulo, xparticulos.esdescuento, xparticulos.cidempresa, xparticulos.fechaact, xparticulos.temp, xparticulos.deleted, xparticulos.modificado FROM xparticulos LEFT JOIN productos ON (productos.idarticulo) = (xparticulos.idarticulo) WHERE productos.idarticulo is null;",
    async (err, fila) => {
      if (!err) {
        res.json({ resultado: "OK" });
        res.end();
      } else {
        console.log(err);
      }
    }
  );
});

router.post("/modificarViejo", async (req, res) => {
  await pool.query(
    "UPDATE productos,xparticulos SET productos.nombre = xparticulos.nombre, productos.precio1 = xparticulos.precio1, productos.precio2 = xparticulos.precio2, productos.medida = xparticulos.medida, productos.peso = xparticulos.peso, productos.tipo = xparticulos.tipo, productos.idarticulo = xparticulos.idarticulo, productos.esdescuento = xparticulos.esdescuento, productos.cidempresa = xparticulos.cidempresa, productos.fechaact = xparticulos.fechaact, productos.temp = xparticulos.temp, productos.deleted = xparticulos.deleted, productos.modificado = xparticulos.modificado WHERE productos.idarticulo = xparticulos.idarticulo;",
    async (err, fila) => {
      if (!err) {
        res.json({ resultado: "OK" });
        res.end();
      } else {
        console.log(err);
      }
    }
  );
});

function IfNaN(parameter) {
  if (isNaN(parameter)) {
    return null;
  } else {
    return parameter;
  }
}
module.exports = router;
