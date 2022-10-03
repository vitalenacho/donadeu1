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
const fetch = require('node-fetch');

const { database } = require('./keys');

// initializations (Inicializar aplicaciones)
const app = express();
require("./lib/passport");

// Settings (Configuraciones iniciales del sistema)
app.set('port', process.env.PORT || 4000);
app.set('views', path.join(__dirname, 'views'));
app.engine('.hbs', exphbs.engine({
    defaultLayout: 'main',
    layoutsDir: path.join(app.get('views'), 'layouts'),
    partialsDir: path.join(app.get('views'), 'partials'),
    extname: '.hbs',
    helpers: {
        toJSON: function(object) {
            return JSON.stringify(object);
        },
        splitData: function(object) {
            return object.split(",")[0];
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
})); //Para poder aceptar de los formularios los datos enviados del usuario
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
app.use('/ventas', require('./routes/ventas.js'));
app.use('/productos', require('./routes/products.js'));


// Public (codigos que el navegador puede acceder)
app.use(express.static(path.join(__dirname, 'public')));


// Starting the Server 
//app.listen(port);
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
    await pool.query('INSERT INTO direccion set ?', [newDirection], async(err, fila) => {
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
/*
var x = 0;
var jsonObj = require("./views/clients/DatosClientes/MartesTardeGaleano.json");
var i;
var reparto = jsonObj.clientes[0].reparto.split(/(?=[A-Z])/);
var dia = reparto[0];
//console.log(dia,turno,usuario);
var ClientesAcargar = [];
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
*/
//console.log(jsonObj);


//const promesa0 = cargarClientes(jsonObj, ClientesAcargar);
//var datosClientes = [];
//const promesa1 = cargarClientes2(jsonObj, ClientesAcargar).then(ClientesAcargar => cargarBaseMatrix(ClientesAcargar));
//const promesa2 = cargarClientes2(jsonObj, ClientesAcargar).then(ClientesAcargar => getClients(datosClientes, ClientesAcargar).then(datosClientes => getMatrix(datosClientes, APIKEY)));
//const promesa3 = cargarClientes2(jsonObj, ClientesAcargar).then(ClientesAcargar => cargarSecuenciamiento(ClientesAcargar, dia, turno, idUsuarioReparto));
//promesa0.then(promesa1.then(promesa2).then(promesa3));




//
//cargarClientes2(jsonObj, ClientesAcargar).then(ClientesAcargar => cargarBaseMatrix(ClientesAcargar));
//cargarClientes2(jsonObj, ClientesAcargar).then(ClientesAcargar => getClients(datosClientes, ClientesAcargar).then(datosClientes => getMatrix(datosClientes, APIKEY)));
//cargarClientes2(jsonObj, ClientesAcargar).then(ClientesAcargar => cargarSecuenciamiento(ClientesAcargar, dia, turno, idUsuarioReparto));




//cargarClientes(jsonObj, ClientesAcargar).then((ClientesAcargar) => getClients(datosClientes, ClientesAcargar).then((datosClientes) => getMatrix(datosClientes, APIKEY).then((ClientesAcargar) => cargarBaseMatrix(ClientesAcargar).then((ClientesAcargar) => cargarSecuenciamiento(ClientesAcargar, dia, turno, idUsuarioReparto)))));

//.then((ClientesAcargar) => getClients(datosClientes, ClientesAcargar).then((datosClientes, ClientesAcargar) => getMatrix(datosClientes, ClientesAcargar , APIKEY).then((ClientesAcargar) => cargarSecuenciamiento(ClientesAcargar, dia, turno, idUsuarioReparto)))));

/*
DELETE FROM secuenciamiento;
DELETE FROM itinerario;
DELETE FROM distanceclient;
DELETE FROM distancebase;
DELETE FROM direccion WHERE direccion.idDireccion != 2353;
*/


//cargarClientes(jsonObj, ClientesAcargar).then((ClientesAcargar) => {cargarBaseMatrix(ClientesAcargar)})
//cargarClientes2(jsonObj, ClientesAcargar).then(ClientesAcargar => cargarBaseMatrix(ClientesAcargar)).then(cargarClientes2(jsonObj, ClientesAcargar).then(ClientesAcargar => getClients(datosClientes, ClientesAcargar).then(datosClientes => getMatrix(datosClientes, APIKEY)))).then(cargarClientes2(jsonObj, ClientesAcargar).then(ClientesAcargar => cargarSecuenciamiento(ClientesAcargar, dia, turno, idUsuarioReparto)));

//var datosClientes = [];
//var ClientesAcargar = [[7222, 0],[7223, 1],[7224, 2]];

//cargarClientes_de1(jsonObj, ClientesAcargar).then((ClientesAcargar) => getClients_de1(datosClientes, ClientesAcargar).then((datosClientes) => getMatrix_de1(datosClientes, APIKEY).then((ClientesAcargar) => cargarBaseMatrix_de1(ClientesAcargar).then((ClientesAcargar) => cargarSecuenciamiento_de1(ClientesAcargar, dia, turno, idUsuarioReparto)))));

//cargarClientes_de1(jsonObj, ClientesAcargar).then((ClientesAcargar) => getClients_de1_v2(datosClientes, ClientesAcargar).then((datosClientes) => cargarSecuenciamiento_de1_v2(datosClientes, dia, turno, idUsuarioReparto)));
//cargarClientes_de1(jsonObj, ClientesAcargar);
//var dia = "Lunes";
//var turno = "Mañana";
//var idUsuarioReparto = 1;

//getClients_de1_v2(datosClientes, ClientesAcargar).then((datosClientes) => cargarSecuenciamiento_de1_v2(datosClientes, dia, turno, idUsuarioReparto));
async function cargarClientes_de1(jsonObj, ClientesAcargar) {
    console.log("entro CargarCliente");
    direccionesAcargar = [];
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

        direccionesAcargar.push([newDirection.calle, newDirection.numero, newDirection.ciudad, newDirection.provincia, newDirection.pais, newDirection.codigoPostal, newDirection.latitud, newDirection.longitud, newDirection.departamento]);
        //ClientesAcargar.push([newClient.nombre, newClient.local, newClient.telefono, newClient.correo, newClient.Id_SistemaGestion, i])
        ClientesAcargar.push([newClient.Id_SistemaGestion, i])

        //cargarBD(newDirection, newClient);
    }

    return new Promise((res, rej) => {

        setTimeout(() => {
            /*
                async function cargarBD_de1(newDirection, newClient) {
                    await pool.query('INSERT INTO direccion (calle,numero,ciudad,provincia,pais,codigoPostal,latitud,longitud,departamento) VALUES ?', [newDirection], async(err, fila) => {
                        if (!err) {
                            newId = fila.insertId;
                            //console.log(newId);
                            for (j = 0; j < newClient.length; j++) {
                                newClient[j][newClient[j].length - 1] = newClient[j][newClient[j].length - 1] * 10 + newId;
                                //console.log(newClient[j][newClient[j].length-1]);
                            }
                            //console.log(newClient);
                            await pool.query('INSERT INTO clientes (nombre,local,telefono,correo,Id_SistemaGestion,Direccion_idDireccion) VALUES ?', [newClient]);
                        } else {
                            console.log(err);
                        }
                    });
                    return newClient;
                }



                cargarBD_de1(direccionesAcargar, ClientesAcargar);
                */
            setTimeout(() => {
                res(ClientesAcargar);
            }, 2000);
            //console.log(direccionesAcargar);
        }, 1000)
    });

}

async function getClients_de1(datosClientes, idSistemaDonadeu) {
    console.log("entro getClients");
    //console.log(idSistemaDonadeu);
    for (i = 0; i < idSistemaDonadeu.length; i++) {
        //console.log(idSistemaDonadeu[i]);
        var clientes = await pool.query("SELECT clientes.idClientes, clientes.nombre, clientes.Id_SistemaGestion, clientes.Direccion_idDireccion, direccion.calle, direccion.latitud, direccion.longitud FROM clientes JOIN direccion WHERE clientes.Direccion_idDireccion = direccion.idDireccion AND clientes.nombre = ? AND clientes.local = ? AND clientes.telefono = ? AND clientes.correo = ? AND clientes.Id_SistemaGestion = ?", idSistemaDonadeu[i]);
        datosClientes.push(clientes[0]);
        //latLon.push("=" + clientes[0].latitud + "," + clientes[0].longitud);
    }
    return new Promise((res, rej) => {
        setTimeout(() => {
            //console.log(datosClientes);
            res([datosClientes, idSistemaDonadeu]);
        }, 1000)
    });
}

async function getClients_de1_v2(datosClientes, idSistemaDonadeu) {
    console.log("entro getClients");
    //console.log(idSistemaDonadeu);
    for (i = 0; i < idSistemaDonadeu.length; i++) {
        //console.log(idSistemaDonadeu[i]);
        //var clientes = await pool.query("SELECT clientes.idClientes, clientes.nombre, clientes.Id_SistemaGestion, clientes.Direccion_idDireccion, direccion.calle, direccion.latitud, direccion.longitud FROM clientes JOIN direccion WHERE clientes.Direccion_idDireccion = direccion.idDireccion AND clientes.nombre = ? AND clientes.local = ? AND clientes.telefono = ? AND clientes.correo = ? AND clientes.Id_SistemaGestion = ?", idSistemaDonadeu[i]);
        var clientes = await pool.query("SELECT clientes.idClientes, clientes.nombre, clientes.Id_SistemaGestion, clientes.Direccion_idDireccion, direccion.calle, direccion.latitud, direccion.longitud FROM clientes JOIN direccion WHERE clientes.Direccion_idDireccion = direccion.idDireccion AND clientes.Id_SistemaGestion = ?", idSistemaDonadeu[i][0]);
        datosClientes.push(clientes[0]);
        //latLon.push("=" + clientes[0].latitud + "," + clientes[0].longitud);
    }
    return new Promise((res, rej) => {
        setTimeout(() => {
            //console.log(datosClientes);
            res(datosClientes);
        }, 1000)
    });
}

function getMatrix_de1(Data, APIKEY) {
    console.log("entro getMatrix");
    //console.log(datosClientes);
    var dataMatrix = [];
    var datosClientes = Data[0];
    var idSistemaDonadeu = Data[1];
    var consultas = [];

    for (j = 0; j < datosClientes.length; j++) {
        datosClientes[j].consulta = "&start0" + "=" + datosClientes[j].latitud + "," + datosClientes[j].longitud;
        var contador = 0;
        for (k = 0; k < datosClientes.length; k++) {
            if (j != k) {
                datosClientes[j].consulta = datosClientes[j].consulta + "&destination" + contador + "=" + datosClientes[k].latitud + "," + datosClientes[k].longitud;
                dataMatrix.push([0, 0, datosClientes[j].idClientes, datosClientes[k].idClientes]);
                contador = contador + 1;
            }
        }
    }

    var lastIndex = 0;
    var latLonQuery = "";

    for (let l = 0; l < datosClientes.length; l++) {
        latLonQuery = datosClientes[l].consulta;
        //console.log(l, consulta);
        //console.log(lastIndex);
        //var latLon = "&start0=52.43,13.4&start1=52.5,13.46&destination0=52.5,13.43&destination1=52.5,13.46"

        var consulta = "https://matrix.route.ls.hereapi.com/routing/7.2/calculatematrix.json?apiKey=" + APIKEY + latLonQuery + "&mode=fastest;car;traffic:enabled&summaryAttributes=traveltime,distance";
        //console.log(latLonQuery);
        request.get(consulta, { json: true }, (err, res, body) => {
                if (err) {
                    return console.log(err);
                } else {
                    distanceMatrix = res.body.response.matrixEntry;
                    //console.log(dataMatrix[0])


                    // console.log(consulta);
                    // console.log(distanceMatrix);
                    lastIndex = l * (datosClientes.length - 1);
                    //console.log(l,lastIndex);

                    //console.log(lastIndex);
                    for (m = 0; m < distanceMatrix.length; m++) {
                        //console.log(dataMatrix[lastIndex].Clientes_idClientes_origen,dataMatrix[lastIndex].Clientes_idClientes_destino,lastIndex,distanceMatrix[m].summary.distance,distanceMatrix[m].summary.travelTime);
                        dataMatrix[lastIndex][0] = distanceMatrix[m].summary.distance / 1000;
                        dataMatrix[lastIndex][1] = distanceMatrix[m].summary.travelTime / 60;
                        lastIndex = lastIndex + 1;
                    }
                    //console.log(dataMatrix.length,lastIndex);

                    if (dataMatrix.length != lastIndex) {
                        //return dataMatrix, lastIndex;
                    } else {
                        /*
                        for (n = 0; n < dataMatrix.length; n++) {
                            //console.log(dataMatrix[n]);
                            await pool.query('INSERT INTO distanceclient set ?', [dataMatrix[n]]);
                        }
                        */

                    }

                }
            })
            /*
            if (l < datosClientes.length) {
                lastIndex = lastIndex + datosClientes.length-2;
            }
            */
        latLonQuery = "";
    }

    async function CargarDatosCC(dataMatrix) {
        //for (n = 0; n < dataMatrix.length; n++) {
        //console.log(dataMatrix[n]);
        await pool.query('INSERT INTO distanceclient (distanciaViaje,tiempoViaje,Clientes_idClientes_origen, Clientes_idClientes_destino) VALUES ?', [dataMatrix]);
        //}
    }
    return new Promise((res, rej) => {

        setTimeout(() => {
            CargarDatosCC(dataMatrix);
            console.log(dataMatrix);
            //console.log(idSistemaDonadeu);
        }, 8000)


        setTimeout(() => {
            res(datosClientes);
            //console.log(idSistemaDonadeu);
        }, 4000)
    });
}

async function cargarBaseMatrix_de1(idSistemaDonadeu) {
    console.log("entro cargarBaseMatrix");
    var APIKEY = '0XJwbo2Q-sEDOPF5fk27JywrgA3WuKimWP5SXrNb188';
    var idAlmacen = [21];
    //var idSistemaDonadeu = [1266, 1509, 1510, 2997, 2821, 3024, 1512, 1511, 1599, 1271, 1260, 2941, 2057, 1265, 2968, 1781, 1273, 3143, 3099, 1797, 1991, 2111, 1948, 1949, 1953, 2045, 2046, 2001, 1998, 3055, 1796, 3038];
    var datosClientes = idSistemaDonadeu;
    var datosAlmacen = await pool.query("SELECT almacen.idAlmacen, almacen.Direccion_idDireccion, direccion.calle, direccion.numero, direccion.latitud, direccion.longitud FROM almacen JOIN direccion WHERE almacen.Direccion_idDireccion = direccion.idDireccion AND almacen.idAlmacen = ?", idAlmacen);
    //console.log(datosClientes);
    var dataMatrixIda = [];
    var dataMatrixVuelta = [];
    var consultasClienteBase = [];
    //var consultasCB = [];
    for (j = 0; j < datosAlmacen.length; j++) {
        var consultaBC = "&start0" + "=" + datosAlmacen[j].latitud + "," + datosAlmacen[j].longitud;
        var consultaCB = "";
        var contador = 0;
        var contador2 = 0;
        //console.log(datosClientes);
        for (k = 0; k < datosClientes.length; k++) {
            dataMatrixIda.push([0, 0, datosAlmacen[j].idAlmacen, datosClientes[k].idClientes, "ida"]);
            dataMatrixVuelta.push([0, 0, datosAlmacen[j].idAlmacen, datosClientes[k].idClientes, "vuelta"]);
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


    var latLonQuery = consultaBC;
    var consultaBC = "https://matrix.route.ls.hereapi.com/routing/7.2/calculatematrix.json?apiKey=" + APIKEY + latLonQuery + "&mode=fastest;car;traffic:enabled&summaryAttributes=traveltime,distance";

    request(consultaBC, { json: true }, (err, res, body) => {
        if (err) {
            return console.log(err);
        } else {
            var distanceMatrix = res.body.response.matrixEntry;
            //console.log(dataMatrix[0])
            var lastIndex = 0;
            for (m = 0; m < distanceMatrix.length; m++) {
                dataMatrixIda[lastIndex][0] = distanceMatrix[m].summary.distance / 1000;
                dataMatrixIda[lastIndex][1] = distanceMatrix[m].summary.travelTime / 60;
                lastIndex = lastIndex + 1;
            }
            //console.log(dataMatrix.length,lastIndex);
            if (dataMatrixIda.length != lastIndex) {
                //return dataMatrixIda, lastIndex;
            } else {
                //console.log(dataMatrixIda);

                /*
                for (n = 0; n < dataMatrixIda.length; n++) {
                    //console.log(dataMatrixIda[n]);
                    await pool.query('INSERT INTO distancebase set ?', [dataMatrixIda[n]]);
                }
                */
            }
        }
    })



    setTimeout(() => {
        var newIndex = 0;
        //var listIndexes = [];
        //var flag = false;


        for (let l = 0; l < consultasClienteBase.length; l++) {
            var latLonQuery = consultasClienteBase[l];


            var consultaCB = "https://matrix.route.ls.hereapi.com/routing/7.2/calculatematrix.json?apiKey=" + APIKEY + latLonQuery + "&mode=fastest;car;traffic:enabled&summaryAttributes=traveltime,distance";
            request(consultaCB, { json: true }, (err, res, body) => {
                if (err) {
                    return console.log(err);
                } else {
                    var distanceMatrix = res.body.response.matrixEntry;
                    //console.log(distanceMatrix.length)
                    newIndex = l * 15;

                    //newIndex = l*(consultasClienteBase.length-1);
                    //console.log(l,newIndex);

                    for (m = 0; m < distanceMatrix.length; m++) {
                        dataMatrixVuelta[newIndex][0] = distanceMatrix[m].summary.distance / 1000;
                        dataMatrixVuelta[newIndex][1] = distanceMatrix[m].summary.travelTime / 60;
                        newIndex = newIndex + 1;
                    }
                    //console.log(dataMatrixVuelta.length,newIndex);
                    if (dataMatrixVuelta.length != newIndex) {
                        //return dataMatrixVuelta, newIndex;
                    } else {
                        //console.log(dataMatrixVuelta);
                        /*
                        for (n = 0; n < dataMatrixVuelta.length; n++) {
                            //console.log(dataMatrixVuelta[n]);
                            await pool.query('INSERT INTO distancebase set ?', [dataMatrixVuelta[n]]);
                        }
                        */

                    }
                }
            })

        }

        //console.log(idSistemaDonadeu);
    }, 1000)


    async function CargarDatosBase(dataMatrixIda, dataMatrixVuelta) {

        await pool.query('INSERT INTO distancebase (distanciaViaje,tiempoViaje, Almacen_idAlmacen, Clientes_idClientes,tipoViaje) VALUES ?', [dataMatrixIda]);

        await pool.query('INSERT INTO distancebase (distanciaViaje,tiempoViaje, Almacen_idAlmacen, Clientes_idClientes,tipoViaje) VALUES ?', [dataMatrixVuelta]);

    }

    return new Promise((res, rej) => {
        setTimeout(() => {
            console.log(dataMatrixIda);
            console.log(dataMatrixVuelta);
            CargarDatosBase(dataMatrixIda, dataMatrixVuelta);
        }, 8000)

        setTimeout(() => {
            res(datosClientes);
            //console.log(dataMatrixVuelta);
        }, 12000)
    });

}


async function cargarSecuenciamiento_de1(idSistemaDonadeu, dia, turno, idUsuarioReparto) {
    console.log("entro cargarSecuenciamiento");
    //var idSistemaDonadeu = [1266, 1509, 1510, 2997, 2821, 3024, 1512, 1511, 1599, 1271, 1260, 2941, 2057, 1265, 2968, 1781, 1273, 3143, 3099, 1797, 1991, 2111, 1948, 1949, 1953, 2045, 2046, 2001, 1998, 3055, 1796, 3038];
    var sequenceData = [];
    var idAlmacen = 21;
    var idSistemaDonadeu = idSistemaDonadeu;
    var itinerarioData = { TiempoTotal: 0, DistanciaTotal: 0, dia: dia, Almacen_idAlmacen: idAlmacen, Usuarios_idUsuarios: idUsuarioReparto, Vehiculos_idVehiculos: 1, turno: turno }
    var idClientesIda = idSistemaDonadeu[0];
    var distanceBaseIda = await pool.query("SELECT * FROM distancebase WHERE tipoViaje = 'ida' AND Almacen_idAlmacen = ? AND Clientes_idClientes = ? ", [idAlmacen, idClientesIda.idClientes]);

    distanceBaseIda[0].orden = 0;
    //itinerarioData.TiempoTotal += distanceBaseIda[0].tiempoViaje;
    //itinerarioData.DistanciaTotal += distanceBaseIda[0].distanciaViaje;
    sequenceData.push(distanceBaseIda[0]);
    var idClientes_origen = idSistemaDonadeu[0];
    for (let i = 1; i < idSistemaDonadeu.length; i++) {
        var idClientes_destino = idSistemaDonadeu[i];
        var distanceClient = await pool.query("SELECT * FROM distanceclient WHERE distanceclient.Clientes_idClientes_origen = ? AND distanceclient.Clientes_idClientes_destino = ?", [idClientes_origen.idClientes, idClientes_destino.idClientes]);
        //console.log(idClientes_origen[0],idClientes_destino[0]);
        //console.log(distanceClient[0]);
        distanceClient[0].orden = i;
        //itinerarioData.TiempoTotal += distanceClient[0].tiempoViaje;
        //itinerarioData.DistanciaTotal += distanceClient[0].distanciaViaje;
        sequenceData.push(distanceClient[0]);
        idClientes_origen = JSON.parse(JSON.stringify(idClientes_destino));
    }
    var idClientesVuelta = idSistemaDonadeu[idSistemaDonadeu.length - 1];
    var distanceBaseVuelta = await pool.query("SELECT * FROM distancebase WHERE tipoViaje = 'vuelta' AND Almacen_idAlmacen = ? AND Clientes_idClientes = ? ", [idAlmacen, idClientesVuelta.idClientes]);
    distanceBaseVuelta[0].orden = idSistemaDonadeu.length;
    //itinerarioData.TiempoTotal += distanceBaseVuelta[0].tiempoViaje;
    //itinerarioData.DistanciaTotal += distanceBaseVuelta[0].distanciaViaje;
    sequenceData.push(distanceBaseVuelta[0]);
    //console.log(itinerarioData);

    setTimeout(() => {
        //console.log(sequenceData);
        for (let j = 0; j < sequenceData.length; j++) {
            itinerarioData.TiempoTotal += sequenceData[j].tiempoViaje;
            itinerarioData.DistanciaTotal += sequenceData[j].distanciaViaje;
        }
    }, 2000);

    setTimeout(async() => {
        await pool.query("INSERT INTO itinerario set ?", [itinerarioData], async(err, res) => {
            if (!err) {
                var idItinerario = res.insertId;
                //console.log(sequenceData);
                var newRowsBase = [];
                var newRowsCli = [];
                for (let k = 0; k < sequenceData.length; k++) {

                    if (sequenceData[k].idDistanceBase == null) {
                        var newEntry = [sequenceData[k].orden, sequenceData[k].idDistanceClient, idItinerario];
                        //orden, DistanceClient_idDistanceClient,Itinerario_idItinerario
                        newRowsCli.push(newEntry);
                    } else {
                        var newEntry = [sequenceData[k].orden, sequenceData[k].idDistanceBase, idItinerario]
                        newRowsBase.push(newEntry);
                        //orden,DistanceBase_idDistanceBase,Itinerario_idItinerario
                    }

                }
                await pool.query("INSERT INTO secuenciamiento (orden, DistanceClient_idDistanceClient,Itinerario_idItinerario) VALUES ?", [newRowsCli]);
                await pool.query("INSERT INTO secuenciamiento (orden,DistanceBase_idDistanceBase,Itinerario_idItinerario) VALUES ?", [newRowsBase]);
            } else {
                console.log(err);
            }
        });

    }, 2000);

}

async function cargarSecuenciamiento_de1_v2(idSistemaDonadeu, dia, turno, idUsuarioReparto) {
    console.log("entro cargarSecuenciamiento");
    //var idSistemaDonadeu = [1266, 1509, 1510, 2997, 2821, 3024, 1512, 1511, 1599, 1271, 1260, 2941, 2057, 1265, 2968, 1781, 1273, 3143, 3099, 1797, 1991, 2111, 1948, 1949, 1953, 2045, 2046, 2001, 1998, 3055, 1796, 3038];
    var sequenceData = [];
    var idAlmacen = 1;
    var idSistemaDonadeu = idSistemaDonadeu;
    var idUsuarioReparto = 1;
    var itinerarioData = { TiempoTotal: 0, DistanciaTotal: 0, dia: dia, Almacen_idAlmacen: idAlmacen, Usuarios_idUsuarios: idUsuarioReparto, Vehiculos_idVehiculos: 1, turno: turno }


    var idClientes_origen = idSistemaDonadeu[0].idClientes;
    for (let i = 1; i < idSistemaDonadeu.length; i++) {
        var idClientes_destino = idSistemaDonadeu[i].idClientes;

        sequenceData.push([idClientes_origen, idClientes_destino, i]);
        idClientes_origen = JSON.parse(JSON.stringify(idClientes_destino));
    }

    //console.log(itinerarioData);

    setTimeout(async() => {
        await pool.query("INSERT INTO itinerario set ?", [itinerarioData], async(err, res) => {
            if (!err) {
                var idItinerario = res.insertId;
                //console.log(sequenceData);

                for (let k = 0; k < sequenceData.length; k++) {
                    sequenceData[k].push(idItinerario);
                }

                setTimeout(async() => {
                    console.log(sequenceData);
                    await pool.query("INSERT INTO secuenciamiento (Clientes_idClientes_origen, Clientes_idClientes_destino,orden,Itinerario_idItinerario) VALUES ?", [sequenceData]);
                }, 1000);
            } else {
                console.log(err);
            }
        });

    }, 2000);

}


async function cargarClientes(jsonObj, ClientesAcargar) {
    console.log("entro CargarCliente");
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


        ClientesAcargar.push([newClient.nombre, newClient.local, newClient.telefono, newClient.correo, newClient.Id_SistemaGestion])

        async function cargarBD(newDirection, newClient) {
            await pool.query('INSERT INTO direccion set ?', [newDirection], async(err, fila) => {
                if (!err) {
                    newClient.Direccion_idDireccion = fila.insertId;
                    await pool.query('INSERT INTO clientes set ?', [newClient]);
                    //console.log(newClient.Id_SistemaGestion);
                    //req.flash('success', 'Cliente creado satisfactoriamente');
                    //res.redirect('/cargarClientes');
                    //return idClientesAcargar;
                } else {
                    console.log(err);
                }
            });
            return ClientesAcargar;
        }
        cargarBD(newDirection, newClient);
    }
    return new Promise((res, rej) => {
        setTimeout(() => {
            res(ClientesAcargar);
        }, 2000)
    });

}

async function cargarClientes2(jsonObj, ClientesAcargar) {
    console.log("entro CargarCliente");
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

        ClientesAcargar.push([newClient.nombre, newClient.local, newClient.telefono, newClient.correo, newClient.Id_SistemaGestion])

    }
    //console.log(newClient);
    return new Promise((res, rej) => {
        setTimeout(() => {
            res(ClientesAcargar);
        }, 1000)
    });
}

//const pool = require('./database.js');

//var APIKEY = '0XJwbo2Q-sEDOPF5fk27JywrgA3WuKimWP5SXrNb188';
//var idSistemaDonadeu = [1266, 1509, 1510, 2997, 2821, 3024, 1512, 1511, 1599, 1271, 1260, 2941, 2057, 1265, 2968, 1781, 1273, 3143, 3099, 1797, 1991, 2111, 1948, 1949, 1953, 2045, 2046, 2001, 1998, 3055, 1796, 3038];
//var clientes = [];
//var datosClientes = [];
async function getClients(datosClientes, idSistemaDonadeu) {
    console.log("entro getClients");
    for (i = 0; i < idSistemaDonadeu.length; i++) {
        //console.log(idSistemaDonadeu[i]);
        var clientes = await pool.query("SELECT clientes.idClientes, clientes.nombre, clientes.Id_SistemaGestion, clientes.Direccion_idDireccion, direccion.calle, direccion.latitud, direccion.longitud FROM clientes JOIN direccion WHERE clientes.Direccion_idDireccion = direccion.idDireccion AND clientes.nombre = ? AND clientes.local = ? AND clientes.telefono = ? AND clientes.correo = ? AND clientes.Id_SistemaGestion = ?", idSistemaDonadeu[i]);
        datosClientes.push(clientes[0]);
        //latLon.push("=" + clientes[0].latitud + "," + clientes[0].longitud);
    }
    return new Promise((res, rej) => {
        setTimeout(() => {
            //console.log(datosClientes);
            res([datosClientes, idSistemaDonadeu]);
        }, 1000)
    });
}


function getMatrix(Data, APIKEY) {
    console.log("entro getMatrix");
    //console.log(datosClientes);
    var dataMatrix = [];
    var datosClientes = Data[0];
    var idSistemaDonadeu = Data[1];

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
    var latLonQuery = "";

    for (let l = 0; l < datosClientes.length; l++) {
        latLonQuery = datosClientes[l].consulta;
        //console.log(l, consulta);
        //console.log(lastIndex);
        //var latLon = "&start0=52.43,13.4&start1=52.5,13.46&destination0=52.5,13.43&destination1=52.5,13.46"

        var consulta = "https://matrix.route.ls.hereapi.com/routing/7.2/calculatematrix.json?apiKey=" + APIKEY + latLonQuery + "&mode=fastest;car;traffic:enabled&summaryAttributes=traveltime,distance";
        //console.log(latLonQuery);
        request.get(consulta, { json: true }, (err, res, body) => {
                if (err) {
                    return console.log(err);
                } else {
                    distanceMatrix = res.body.response.matrixEntry;
                    //console.log(dataMatrix[0])


                    // console.log(consulta);
                    // console.log(distanceMatrix);
                    lastIndex = l * (datosClientes.length - 1);
                    //console.log(l,lastIndex);

                    //console.log(lastIndex);
                    for (m = 0; m < distanceMatrix.length; m++) {
                        //console.log(dataMatrix[lastIndex].Clientes_idClientes_origen,dataMatrix[lastIndex].Clientes_idClientes_destino,lastIndex,distanceMatrix[m].summary.distance,distanceMatrix[m].summary.travelTime);
                        dataMatrix[lastIndex].distanciaViaje = distanceMatrix[m].summary.distance / 1000;
                        dataMatrix[lastIndex].tiempoViaje = distanceMatrix[m].summary.travelTime / 60;
                        lastIndex = lastIndex + 1;
                    }
                    //console.log(dataMatrix.length,lastIndex);

                    if (dataMatrix.length != lastIndex) {
                        //return dataMatrix, lastIndex;
                    } else {
                        /*
                        for (n = 0; n < dataMatrix.length; n++) {
                            //console.log(dataMatrix[n]);
                            await pool.query('INSERT INTO distanceclient set ?', [dataMatrix[n]]);
                        }
                        */

                    }

                }
            })
            /*
            if (l < datosClientes.length) {
                lastIndex = lastIndex + datosClientes.length-2;
            }
            */
        latLonQuery = "";
    }

    async function CargarDatosCC(dataMatrix) {
        for (n = 0; n < dataMatrix.length; n++) {
            //console.log(dataMatrix[n]);
            await pool.query('INSERT INTO distanceclient set ?', [dataMatrix[n]]);
        }
    }
    return new Promise((res, rej) => {

        setTimeout(() => {
            CargarDatosCC(dataMatrix);

            //console.log(idSistemaDonadeu);
        }, 2000)


        setTimeout(() => {
            res(idSistemaDonadeu);
            //console.log(idSistemaDonadeu);
        }, 4000)
    });
}

//console.log(dataMatrix[0])
//return dataMatrix;
/*
getClients(datosClientes, idSistemaDonadeu).then(datosClientes =>
    getMatrix(datosClientes, APIKEY))
*/



//const pool = require('./database.js');
async function cargarBaseMatrix(idSistemaDonadeu) {
    console.log("entro cargarBaseMatrix");
    var APIKEY = '0XJwbo2Q-sEDOPF5fk27JywrgA3WuKimWP5SXrNb188';
    var idAlmacen = [1];
    //var idSistemaDonadeu = [1266, 1509, 1510, 2997, 2821, 3024, 1512, 1511, 1599, 1271, 1260, 2941, 2057, 1265, 2968, 1781, 1273, 3143, 3099, 1797, 1991, 2111, 1948, 1949, 1953, 2045, 2046, 2001, 1998, 3055, 1796, 3038];
    var datosClientes = [];
    for (i = 0; i < idSistemaDonadeu.length; i++) {
        //console.log(idSistemaDonadeu);
        var clientes = await pool.query("SELECT clientes.idClientes, clientes.nombre, clientes.Id_SistemaGestion, clientes.Direccion_idDireccion, direccion.calle, direccion.latitud, direccion.longitud FROM clientes JOIN direccion WHERE clientes.Direccion_idDireccion = direccion.idDireccion AND clientes.nombre = ? AND clientes.local = ? AND clientes.telefono = ? AND clientes.correo = ? AND clientes.Id_SistemaGestion = ?", idSistemaDonadeu[i]);
        datosClientes.push(clientes[0]);
        //console.log(clientes[0]);
    }
    var datosAlmacen = await pool.query("SELECT almacen.idAlmacen, almacen.Direccion_idDireccion, direccion.calle, direccion.numero, direccion.latitud, direccion.longitud FROM almacen JOIN direccion WHERE almacen.Direccion_idDireccion = direccion.idDireccion AND almacen.idAlmacen = ?", idAlmacen);
    //console.log(datosClientes);
    var dataMatrixIda = [];
    var dataMatrixVuelta = [];
    var consultasClienteBase = [];
    //var consultasCB = [];
    for (j = 0; j < datosAlmacen.length; j++) {
        var consultaBC = "&start0" + "=" + datosAlmacen[j].latitud + "," + datosAlmacen[j].longitud;
        var consultaCB = "";
        var contador = 0;
        var contador2 = 0;
        //console.log(datosClientes);
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


    var latLonQuery = consultaBC;
    var consultaBC = "https://matrix.route.ls.hereapi.com/routing/7.2/calculatematrix.json?apiKey=" + APIKEY + latLonQuery + "&mode=fastest;car;traffic:enabled&summaryAttributes=traveltime,distance";

    request(consultaBC, { json: true }, (err, res, body) => {
        if (err) {
            return console.log(err);
        } else {
            var distanceMatrix = res.body.response.matrixEntry;
            //console.log(dataMatrix[0])
            var lastIndex = 0;
            for (m = 0; m < distanceMatrix.length; m++) {
                dataMatrixIda[lastIndex].distanciaViaje = distanceMatrix[m].summary.distance / 1000;
                dataMatrixIda[lastIndex].tiempoViaje = distanceMatrix[m].summary.travelTime / 60;
                lastIndex = lastIndex + 1;
            }
            //console.log(dataMatrix.length,lastIndex);
            if (dataMatrixIda.length != lastIndex) {
                //return dataMatrixIda, lastIndex;
            } else {
                //console.log(dataMatrixIda);

                /*
                for (n = 0; n < dataMatrixIda.length; n++) {
                    //console.log(dataMatrixIda[n]);
                    await pool.query('INSERT INTO distancebase set ?', [dataMatrixIda[n]]);
                }
                */
            }
        }
    })



    setTimeout(() => {
        var newIndex = 0;
        var listIndexes = [];
        var flag = false;


        for (let l = 0; l < consultasClienteBase.length; l++) {
            var latLonQuery = consultasClienteBase[l];


            var consultaCB = "https://matrix.route.ls.hereapi.com/routing/7.2/calculatematrix.json?apiKey=" + APIKEY + latLonQuery + "&mode=fastest;car;traffic:enabled&summaryAttributes=traveltime,distance";
            request(consultaCB, { json: true }, (err, res, body) => {
                if (err) {
                    return console.log(err);
                } else {
                    var distanceMatrix = res.body.response.matrixEntry;
                    //console.log(distanceMatrix.length)
                    newIndex = l * 15;

                    //newIndex = l*(consultasClienteBase.length-1);
                    //console.log(l,newIndex);

                    for (m = 0; m < distanceMatrix.length; m++) {
                        dataMatrixVuelta[newIndex].distanciaViaje = distanceMatrix[m].summary.distance / 1000;
                        dataMatrixVuelta[newIndex].tiempoViaje = distanceMatrix[m].summary.travelTime / 60;
                        newIndex = newIndex + 1;
                    }
                    //console.log(dataMatrixVuelta.length,newIndex);
                    if (dataMatrixVuelta.length != newIndex) {
                        //return dataMatrixVuelta, newIndex;
                    } else {
                        //console.log(dataMatrixVuelta);
                        /*
                        for (n = 0; n < dataMatrixVuelta.length; n++) {
                            //console.log(dataMatrixVuelta[n]);
                            await pool.query('INSERT INTO distancebase set ?', [dataMatrixVuelta[n]]);
                        }
                        */

                    }
                }
            })

        }

        //console.log(idSistemaDonadeu);
    }, 1000)


    async function CargarDatosBase(dataMatrixIda, dataMatrixVuelta) {
        for (n = 0; n < dataMatrixIda.length; n++) {
            //console.log(dataMatrixIda[n]);
            await pool.query('INSERT INTO distancebase set ?', [dataMatrixIda[n]]);
        }

        for (m = 0; m < dataMatrixVuelta.length; m++) {
            //console.log(dataMatrixVuelta[n]);
            await pool.query('INSERT INTO distancebase set ?', [dataMatrixVuelta[m]]);
        }
    }

    return new Promise((res, rej) => {
        setTimeout(() => {
            CargarDatosBase(dataMatrixIda, dataMatrixVuelta);
        }, 3000)

        setTimeout(() => {
            res(idSistemaDonadeu);
            //console.log(dataMatrixVuelta);
        }, 5000)
    });

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
async function cargarSecuenciamiento(idSistemaDonadeu, dia, turno, idUsuarioReparto) {
    console.log("entro cargarSecuenciamiento");
    //var idSistemaDonadeu = [1266, 1509, 1510, 2997, 2821, 3024, 1512, 1511, 1599, 1271, 1260, 2941, 2057, 1265, 2968, 1781, 1273, 3143, 3099, 1797, 1991, 2111, 1948, 1949, 1953, 2045, 2046, 2001, 1998, 3055, 1796, 3038];
    var sequenceData = [];
    var idAlmacen = 1;
    var itinerarioData = { TiempoTotal: 0, DistanciaTotal: 0, dia: dia, Almacen_idAlmacen: idAlmacen, Usuarios_idUsuarios: idUsuarioReparto, Vehiculos_idVehiculos: 1, turno: turno }
    var idClientesIda = await pool.query("SELECT clientes.idClientes AS id FROM clientes WHERE clientes.nombre = ? AND clientes.local = ? AND clientes.telefono = ? AND clientes.correo = ? AND clientes.Id_SistemaGestion = ?", idSistemaDonadeu[0]);
    var distanceBaseIda = await pool.query("SELECT * FROM distancebase WHERE tipoViaje = 'ida' AND Almacen_idAlmacen = ? AND Clientes_idClientes = ? ", [idAlmacen, idClientesIda[0].id]);
    distanceBaseIda[0].orden = 0;
    //itinerarioData.TiempoTotal += distanceBaseIda[0].tiempoViaje;
    //itinerarioData.DistanciaTotal += distanceBaseIda[0].distanciaViaje;
    sequenceData.push(distanceBaseIda[0]);
    var idClientes_origen = await pool.query("SELECT clientes.idClientes AS id FROM clientes WHERE clientes.nombre = ? AND clientes.local = ? AND clientes.telefono = ? AND clientes.correo = ? AND clientes.Id_SistemaGestion = ?", idSistemaDonadeu[0]);
    for (let i = 1; i < idSistemaDonadeu.length; i++) {
        var idClientes_destino = await pool.query("SELECT clientes.idClientes AS id FROM clientes WHERE clientes.nombre = ? AND clientes.local = ? AND clientes.telefono = ? AND clientes.correo = ? AND clientes.Id_SistemaGestion = ?", idSistemaDonadeu[i]);
        var distanceClient = await pool.query("SELECT * FROM distanceclient WHERE distanceclient.Clientes_idClientes_origen = ? AND distanceclient.Clientes_idClientes_destino = ?", [idClientes_origen[0].id, idClientes_destino[0].id]);
        //console.log(idClientes_origen[0],idClientes_destino[0]);
        //console.log(distanceClient[0]);
        distanceClient[0].orden = i;
        //itinerarioData.TiempoTotal += distanceClient[0].tiempoViaje;
        //itinerarioData.DistanciaTotal += distanceClient[0].distanciaViaje;
        sequenceData.push(distanceClient[0]);
        idClientes_origen = JSON.parse(JSON.stringify(idClientes_destino));
    }
    var idClientesVuelta = await pool.query("SELECT clientes.idClientes AS id FROM clientes WHERE clientes.nombre = ? AND clientes.local = ? AND clientes.telefono = ? AND clientes.correo = ? AND clientes.Id_SistemaGestion = ?", idSistemaDonadeu[idSistemaDonadeu.length - 1]);
    var distanceBaseVuelta = await pool.query("SELECT * FROM distancebase WHERE tipoViaje = 'vuelta' AND Almacen_idAlmacen = ? AND Clientes_idClientes = ? ", [idAlmacen, idClientesVuelta[0].id]);
    distanceBaseVuelta[0].orden = idSistemaDonadeu.length;
    //itinerarioData.TiempoTotal += distanceBaseVuelta[0].tiempoViaje;
    //itinerarioData.DistanciaTotal += distanceBaseVuelta[0].distanciaViaje;
    sequenceData.push(distanceBaseVuelta[0]);
    //console.log(itinerarioData);

    setTimeout(() => {
        //console.log(sequenceData);
        for (let j = 0; j < sequenceData.length; j++) {
            itinerarioData.TiempoTotal += sequenceData[j].tiempoViaje;
            itinerarioData.DistanciaTotal += sequenceData[j].distanciaViaje;
        }
    }, 1000);

    setTimeout(async() => {
        await pool.query("INSERT INTO itinerario set ?", [itinerarioData], async(err, res) => {
            if (!err) {
                var idItinerario = res.insertId;
                //console.log(sequenceData);
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

    }, 2000);

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