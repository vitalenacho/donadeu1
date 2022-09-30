const express = require('express');
const morgan = require('morgan');
const exphbs = require('express-handlebars');
const path = require('path');
const session = require('express-session');
const flash = require('connect-flash');
const MysqlStore = require('express-mysql-session');
const passport = require('passport');
const expressValidator = require('express-validator');
const request = require("request");

const { database } = require('./keys');

// initializations (Inicializar aplicaciones)
const app = express();
require("./lib/passport");

// Settings (Configuraciones iniciales del sistema)
app.set('port', process.env.PORT || 4000);
app.set('views', path.join(__dirname, 'views'));
app.engine('.hbs', exphbs({
    defaultLayout: 'main',
    layoutsDir: path.join(app.get('views'), 'layouts'),
    partialsDir: path.join(app.get('views'), 'partials'),
    extname: '.hbs',
    helpers: {
        toJSON: function (object) {
            return JSON.stringify(object);
        }
    }
}));

app.set('view engine', '.hbs');

// Middlewares (Conecciones o intermediarios)
app.use(session({
    secret: 'donadeumysqlsession',
    resave: false,
    saveUninitialized: false,
    store: new MysqlStore(database)
}));
app.use(flash());
app.use(morgan('dev'));
app.use(express.urlencoded({
    extended: false
}));  //Para poder aceptar de los formularios los datos enviados del usuario
app.use(express.json());
app.use(passport.initialize());
app.use(passport.session());


// Global Variables (Variables globales)
app.use((req, res, next) => { // Toma el req (Info del usuario), toma el res (Lo que el servidor quiere responder)
    app.locals.success = req.flash('success');
    app.locals.message = req.flash('message');
    app.locals.user = req.user;
    next(); // funcion para continuar con el resto del codigo
});

// Routes (Que es lo que va a hacer un usuario cuando visite tal URL)
app.use(require('./routes/index.js'));
app.use(require('./routes/authentication.js'));
app.use('/intro', require('./routes/intro.js'));
app.use('/dashboard', require('./routes/dashboard.js'));
app.use('/clientes', require('./routes/clients.js'));
app.use('/itinerarios', require('./routes/itinerarios.js'));

// Public (codigos que el navegador puede acceder)
app.use(express.static(path.join(__dirname, 'public')));


// Starting the Server 
app.listen(app.get('port'), () => {
    console.log('Server on port', app.get('port'));
});




// BORRAR TODOS LOS DATOS DE LAS TABLAS
/*
const pool = require('./database.js');
async function hacer1() {
    await pool.query('DELETE FROM almacen');
    await pool.query('DELETE FROM direccion');
    await pool.query('DELETE FROM clientes');
}
hacer1();
*/

// CARGAR DIRECCION Y ALMACEN
/*
const pool = require('./database.js');
async function hacer1() {
    var newDirection = {
        "pais": "Argentina",
        "ciudad": "Santa Fe",
        "Provincia": "Santa Fe",
        "calle": "San Juan",
        "numero": "7019",
        "codigoPostal": "3006",
        "latitud": -31.600365,
        "longitud": -60.708382
       }
       var newAlmacen = {};
        await pool.query('INSERT INTO direccion set ?', [newDirection], async (err, fila) => {
            if (!err) {
                newAlmacen.Direccion_idDireccion = fila.insertId;
                await pool.query('INSERT INTO almacen set ?', [newAlmacen]);
            } else {
                console.log(err);
            }
        });
    }

hacer1();
*/


// CARGAR CLIENTES DESDE ARCHIVO JSON
var x = 0;
var jsonObj = require("./views/clients/DatosClientes/LunesMañanaSuero.json");
var i;
var reparto = jsonObj.clientes[0].reparto.split(/(?=[A-Z])/);
var dia = reparto[0];
//console.log(dia,turno,usuario);
var idClientesAcargar = [];
if (reparto[2] == undefined) {
    var usuario = reparto[1];
    var turno = "Mañana"
} else {
    var turno = reparto[1];
    var usuario = reparto[2];
}

if (usuario == "Galeano") {
    var idUsuarioReparto = 1;
} else {
    var idUsuarioReparto = 2;
}
var APIKEY = '0XJwbo2Q-sEDOPF5fk27JywrgA3WuKimWP5SXrNb188';
//console.log(dia, turno, usuario, idUsuarioReparto);


const pool = require('./database.js');


var datosClientes = [];

cargarClientes(jsonObj, idClientesAcargar).then(idClientesAcargar => getClients(datosClientes, idClientesAcargar).then(datosClientes => getMatrix(datosClientes, APIKEY))).then(idClientesAcargar => cargarBaseMatrix(idClientesAcargar)).then(idClientesAcargar => cargarsecuenciamiento(idClientesAcargar, dia, turno, idUsuarioReparto));



async function cargarClientes(jsonObj, idClientesAcargar) {
    for (i = 0; i < jsonObj.clientes.length; i++) {

        if (jsonObj.clientes[i].nombreCliente == null) {
            jsonObj.clientes[i].nombreCliente = "NoData";
        }

        if (jsonObj.clientes[i].codigo == null) {
            jsonObj.clientes[i].codigo = 0;
        }

        var newClient = {
            'nombre': jsonObj.clientes[i].nombreCliente,
            'local': "NoData",
            'telefono': 0,
            'correo': "NoData",
            'Id_SistemaGestion': jsonObj.clientes[i].codigo
        };

        if (jsonObj.clientes[i].direccion == null) {
            jsonObj.clientes[i].direccion = "NoData";
        }

        if (jsonObj.clientes[i].latitud == null || jsonObj.clientes[i].latitud == "#N/A") {
            jsonObj.clientes[i].latitud = 0;
        }

        if (jsonObj.clientes[i].longitud == null || jsonObj.clientes[i].longitud == "#N/A") {
            jsonObj.clientes[i].longitud = 0;
        }

        var newDirection = {
            calle: jsonObj.clientes[i].direccion,
            numero: 0,
            ciudad: "NoData",
            provincia: "Santa Fe",
            pais: "Argentina",
            codigoPostal: "NoData",
            latitud: jsonObj.clientes[i].latitud,
            longitud: jsonObj.clientes[i].longitud,
            departamento: "nulo"
        };


        await pool.query('INSERT INTO direccion set ?', [newDirection], async (err, fila) => {
            if (!err) {
                newClient.Direccion_idDireccion = fila.insertId;
                await pool.query('INSERT INTO clientes set ?', [newClient], async (err1, fila1) => {

                    idClientesAcargar.push(fila1.insertId);
                    return idClientesAcargar;
                });
                console.log(newClient.Id_SistemaGestion);
                //req.flash('success', 'Cliente creado satisfactoriamente');
                //res.redirect('/cargarClientes');
                return idClientesAcargar;
            } else {
                console.log(err);
            }
        });

    }
    return idClientesAcargar;
}


//const pool = require('./database.js');

//var APIKEY = '0XJwbo2Q-sEDOPF5fk27JywrgA3WuKimWP5SXrNb188';
//var idSistemaDonadeu = [1266, 1509, 1510, 2997, 2821, 3024, 1512, 1511, 1599, 1271, 1260, 2941, 2057, 1265, 2968, 1781, 1273, 3143, 3099, 1797, 1991, 2111, 1948, 1949, 1953, 2045, 2046, 2001, 1998, 3055, 1796, 3038];
//var clientes = [];
//var datosClientes = [];
async function getClients(datosClientes, idSistemaDonadeu) {
    for (i = 0; i < idSistemaDonadeu.length; i++) {
        var clientes = await pool.query("SELECT clientes.idClientes, clientes.nombre, clientes.Id_SistemaGestion, clientes.Direccion_idDireccion, direccion.calle, direccion.latitud, direccion.longitud FROM clientes JOIN direccion WHERE clientes.Direccion_idDireccion = direccion.idDireccion AND clientes.idClientes = ?", idSistemaDonadeu[i]);
        datosClientes.push(clientes[0]);
        //latLon.push("=" + clientes[0].latitud + "," + clientes[0].longitud);
    }
    return datosClientes;
}


async function getMatrix(datosClientes, APIKEY) {
    var dataMatrix = [];
    for (j = 0; j < datosClientes.length; j++) {
        datosClientes[j].consulta = "&start0" + "=" + datosClientes[j].latitud + "," + datosClientes[j].longitud;
        var contador = 0;
        for (k = 0; k < datosClientes.length; k++) {
            if (j != k) {
                dataMatrix.push({
                    Clientes_idClientes_origen: datosClientes[j].idClientes,
                    Clientes_idClientes_destino: datosClientes[k].idClientes
                });
                datosClientes[j].consulta = datosClientes[j].consulta + "&destination" + contador + "=" + datosClientes[k].latitud + "," + datosClientes[k].longitud;
                contador = contador + 1;
            }
        }
    }

    var lastIndex = 0;
    for (l = 0; l < datosClientes.length; l++) {
        var latLonQuery = datosClientes[l].consulta;


        //var latLon = "&start0=52.43,13.4&start1=52.5,13.46&destination0=52.5,13.43&destination1=52.5,13.46"
        var consulta = "https://matrix.route.ls.hereapi.com/routing/7.2/calculatematrix.json?apiKey=" + APIKEY + latLonQuery + "&mode=fastest;car;traffic:disabled&summaryAttributes=traveltime,distance"

        request(consulta, { json: true }, async (err, res, body) => {
            if (err) {
                return console.log(err);
            } else {
                var distanceMatrix = res.body.response.matrixEntry;
                //console.log(dataMatrix[0])
                for (m = 0; m < distanceMatrix.length; m++) {
                    dataMatrix[lastIndex].distanciaViaje = distanceMatrix[m].summary.distance / 1000;
                    dataMatrix[lastIndex].tiempoViaje = distanceMatrix[m].summary.travelTime / 60;
                    lastIndex = lastIndex + 1;
                }
                //console.log(dataMatrix.length,lastIndex);
                if (dataMatrix.length != lastIndex) {
                    return dataMatrix, lastIndex;
                } else {
                    for (n = 0; n < dataMatrix.length; n++) {
                        //console.log(dataMatrix[n]);
                        await pool.query('INSERT INTO distanceclient set ?', [dataMatrix[n]]);
                    }
                }
            }
        })

    }

}

//console.log(dataMatrix[0])
//return dataMatrix;
/*
getClients(datosClientes, idSistemaDonadeu).then(datosClientes =>
    getMatrix(datosClientes, APIKEY))
*/




//const pool = require('./database.js');
async function cargarBaseMatrix(idSistemaDonadeu) {
    var APIKEY = '0XJwbo2Q-sEDOPF5fk27JywrgA3WuKimWP5SXrNb188';
    var idAlmacen = [1];
    //var idSistemaDonadeu = [1266, 1509, 1510, 2997, 2821, 3024, 1512, 1511, 1599, 1271, 1260, 2941, 2057, 1265, 2968, 1781, 1273, 3143, 3099, 1797, 1991, 2111, 1948, 1949, 1953, 2045, 2046, 2001, 1998, 3055, 1796, 3038];
    var datosClientes = [];
    for (i = 0; i < idSistemaDonadeu.length; i++) {
        var clientes = await pool.query("SELECT clientes.idClientes, clientes.nombre, clientes.Id_SistemaGestion, clientes.Direccion_idDireccion, direccion.calle, direccion.latitud, direccion.longitud FROM clientes JOIN direccion WHERE clientes.Direccion_idDireccion = direccion.idDireccion AND clientes.idClientes = ?", idSistemaDonadeu[i]);
        datosClientes.push(clientes[0]);
    }
    var datosAlmacen = await pool.query("SELECT almacen.idAlmacen, almacen.Direccion_idDireccion, direccion.calle, direccion.numero, direccion.latitud, direccion.longitud FROM almacen JOIN direccion WHERE almacen.Direccion_idDireccion = direccion.idDireccion AND almacen.idAlmacen = ?", idAlmacen);
    var dataMatrixIda = [];
    var dataMatrixVuelta = [];
    var consultasClienteBase = [];
    //var consultasCB = [];
    for (j = 0; j < datosAlmacen.length; j++) {
        var consultaBC = "&start0" + "=" + datosAlmacen[j].latitud + "," + datosAlmacen[j].longitud;
        var consultaCB = "";
        var contador = 0;
        var contador2 = 0;
        for (k = 0; k < datosClientes.length; k++) {
            dataMatrixIda.push({
                Almacen_idAlmacen: datosAlmacen[j].idAlmacen,
                Clientes_idClientes: datosClientes[k].idClientes,
                tipoViaje: "ida"
            });
            dataMatrixVuelta.push({
                Almacen_idAlmacen: datosAlmacen[j].idAlmacen,
                Clientes_idClientes: datosClientes[k].idClientes,
                tipoViaje: "vuelta"
            });
            consultaBC = consultaBC + "&destination" + contador + "=" + datosClientes[k].latitud + "," + datosClientes[k].longitud;
            contador = contador + 1;
            //console.log(contador, datosClientes.length, contador2)
            if (contador2 < 15 && contador != datosClientes.length) {
                //console.log(contador2)
                consultaCB = consultaCB + "&start" + contador2 + "=" + datosClientes[k].latitud + "," + datosClientes[k].longitud;
                contador2 = contador2 + 1;
            } else if (contador == datosClientes.length) {

                consultaCB = consultaCB + "&start" + contador2 + "=" + datosClientes[k].latitud + "," + datosClientes[k].longitud;
                consultaCB = consultaCB + "&destination0" + "=" + datosAlmacen[j].latitud + "," + datosAlmacen[j].longitud;
                consultasClienteBase.push(consultaCB);
                //console.log("caca");
                //consultaCB = consultaCB + "&start" + contador2 + "=" + datosClientes[k].latitud + "," + datosClientes[k].longitud;
            } else {
                contador2 = 0;
                consultaCB = consultaCB + "&destination0" + "=" + datosAlmacen[j].latitud + "," + datosAlmacen[j].longitud;
                consultasClienteBase.push(consultaCB);
                //console.log(consultaCB);
                consultaCB = "&start" + contador2 + "=" + datosClientes[k].latitud + "," + datosClientes[k].longitud;
                contador2 = contador2 + 1;
            }
            //console.log(consultaCB);

        }
    }
    //console.log(consultaCB);
    //console.log(consultasClienteBase);

    var lastIndex = 0;
    var latLonQuery = consultaBC;
    var consultaBC = "https://matrix.route.ls.hereapi.com/routing/7.2/calculatematrix.json?apiKey=" + APIKEY + latLonQuery + "&mode=fastest;car;traffic:disabled&summaryAttributes=traveltime,distance";

    request(consultaBC, { json: true }, async (err, res, body) => {
        if (err) {
            return console.log(err);
        } else {
            var distanceMatrix = res.body.response.matrixEntry;
            //console.log(dataMatrix[0])
            for (m = 0; m < distanceMatrix.length; m++) {
                dataMatrixIda[lastIndex].distanciaViaje = distanceMatrix[m].summary.distance / 1000;
                dataMatrixIda[lastIndex].tiempoViaje = distanceMatrix[m].summary.travelTime / 60;
                lastIndex = lastIndex + 1;
            }
            //console.log(dataMatrix.length,lastIndex);
            if (dataMatrixIda.length != lastIndex) {
                return dataMatrixIda, lastIndex;
            } else {
                console.log(dataMatrixIda)

                for (n = 0; n < dataMatrixIda.length; n++) {
                    //console.log(dataMatrixIda[n]);
                    await pool.query('INSERT INTO distancebase set ?', [dataMatrixIda[n]]);
                }
            }
        }
    })


    var newIndex = 0;
    for (let i = 0; i < consultasClienteBase.length; i++) {
        var latLonQuery = consultasClienteBase[i];
        var consultaCB = "https://matrix.route.ls.hereapi.com/routing/7.2/calculatematrix.json?apiKey=" + APIKEY + latLonQuery + "&mode=fastest;car;traffic:disabled&summaryAttributes=traveltime,distance";
        request(consultaCB, { json: true }, async (err, res, body) => {
            if (err) {
                return console.log(err);
            } else {
                var distanceMatrix = res.body.response.matrixEntry;
                //console.log(distanceMatrix.length)
                for (m = 0; m < distanceMatrix.length; m++) {
                    dataMatrixVuelta[newIndex].distanciaViaje = distanceMatrix[m].summary.distance / 1000;
                    dataMatrixVuelta[newIndex].tiempoViaje = distanceMatrix[m].summary.travelTime / 60;
                    newIndex = newIndex + 1;
                }
                //console.log(dataMatrixVuelta.length,newIndex);
                if (dataMatrixVuelta.length != newIndex) {
                    return dataMatrixVuelta, newIndex;
                } else {
                    console.log(dataMatrixVuelta)

                    for (n = 0; n < dataMatrixVuelta.length; n++) {
                        //console.log(dataMatrixVuelta[n]);
                        await pool.query('INSERT INTO distancebase set ?', [dataMatrixVuelta[n]]);
                    }

                }
            }
        })

    }



}

//cargarBaseMatrix()



/*
const pool = require('./database.js');
async function crearVehiculo() {
    var vehiculo = { nombre: "Citroen Furgon", patente: "000000", tipo: "furgon", capacidad: "500" }
    await pool.query("INSERT INTO vehiculos set ?", [vehiculo]);
}

//crearVehiculo();
*/



//const pool = require('./database.js');
async function cargarsecuenciamiento(idSistemaDonadeu, dia, turno, idUsuarioReparto) {
    //var idSistemaDonadeu = [1266, 1509, 1510, 2997, 2821, 3024, 1512, 1511, 1599, 1271, 1260, 2941, 2057, 1265, 2968, 1781, 1273, 3143, 3099, 1797, 1991, 2111, 1948, 1949, 1953, 2045, 2046, 2001, 1998, 3055, 1796, 3038];
    var sequenceData = [];
    var idAlmacen = 1;
    var itinerarioData = { TiempoTotal: 0, DistanciaTotal: 0, dia: dia, Almacen_idAlmacen: idAlmacen, Usuarios_idUsuarios: idUsuarioReparto, Vehiculos_idVehiculos: 1, turno: turno }
    var idClientesIda = await pool.query("SELECT clientes.idClientes AS id FROM clientes WHERE clientes.idClientes = ?", idSistemaDonadeu[0]);
    var distanceBaseIda = await pool.query("SELECT * FROM distancebase WHERE tipoViaje = 'ida' AND Almacen_idAlmacen = ? AND Clientes_idClientes = ? ", [idAlmacen, idClientesIda[0].id]);
    distanceBaseIda[0].orden = 0;
    itinerarioData.TiempoTotal += distanceBaseIda[0].tiempoViaje;
    itinerarioData.DistanciaTotal += distanceBaseIda[0].distanciaViaje;
    sequenceData.push(distanceBaseIda[0]);
    var idClientes_origen = await pool.query("SELECT clientes.idClientes AS id FROM clientes WHERE clientes.idClientes = ?", idSistemaDonadeu[0]);
    for (let i = 1; i < idSistemaDonadeu.length; i++) {
        var idClientes_destino = await pool.query("SELECT clientes.idClientes AS id FROM clientes WHERE clientes.idClientes = ?", idSistemaDonadeu[i]);
        var distanceClient = await pool.query("SELECT * FROM distanceclient WHERE distanceclient.Clientes_idClientes_origen = ? AND distanceclient.Clientes_idClientes_destino = ?", [idClientes_origen[0].id, idClientes_destino[0].id]);
        distanceClient[0].orden = i;
        itinerarioData.TiempoTotal += distanceClient[0].tiempoViaje;
        itinerarioData.DistanciaTotal += distanceClient[0].distanciaViaje;
        sequenceData.push(distanceClient[0]);
        idClientes_origen = JSON.parse(JSON.stringify(idClientes_destino));
    }
    var idClientesVuelta = await pool.query("SELECT clientes.idClientes AS id FROM clientes WHERE clientes.idClientes = ?", idSistemaDonadeu[idSistemaDonadeu.length - 1]);
    var distanceBaseVuelta = await pool.query("SELECT * FROM distancebase WHERE tipoViaje = 'vuelta' AND Almacen_idAlmacen = ? AND Clientes_idClientes = ? ", [idAlmacen, idClientesVuelta[0].id]);
    distanceBaseVuelta[0].orden = idSistemaDonadeu.length;
    itinerarioData.TiempoTotal += distanceBaseVuelta[0].tiempoViaje;
    itinerarioData.DistanciaTotal += distanceBaseVuelta[0].distanciaViaje;
    sequenceData.push(distanceBaseVuelta[0]);
    //console.log(itinerarioData);

    await pool.query("INSERT INTO itinerario set ?", [itinerarioData], async (err, res) => {
        if (!err) {
            var idItinerario = res.insertId;
            for (let k = 0; k < sequenceData.length; k++) {

                if (sequenceData[k].idDistanceBase == null) {
                    var newEntry = {
                        orden: sequenceData[k].orden,
                        DistanceClient_idDistanceClient: sequenceData[k].idDistanceClient,
                        Itinerario_idItinerario: idItinerario
                    }
                } else {
                    var newEntry = {
                        orden: sequenceData[k].orden,
                        DistanceBase_idDistanceBase: sequenceData[k].idDistanceBase,
                        Itinerario_idItinerario: idItinerario
                    }
                }
                await pool.query("INSERT INTO secuenciamiento set ?", [newEntry])
            }

        } else {
            console.log(err);
        }
    });


}

//cargarsecuenciamiento();



/*
const pool = require('./database.js');
async function crearVehiculo() {
    var vehiculo = { nombre: "Citroen Furgon", patente: "000000", tipo: "furgon", capacidad: "500" }
    await pool.query("INSERT INTO vehiculos set ?", [vehiculo]);
}

//crearVehiculo();
*/