const express = require('express');
const router = express.Router();
const { isLoggedIn } = require('../lib/auth');


const pool = require('../database.js'); // pool === Database o conexion con la base de datos

function diaSemana() {
    var d = new Date();
    var weekday = new Array(7);
    weekday[0] = "Domingo";
    weekday[1] = "Lunes";
    weekday[2] = "Martes";
    weekday[3] = "Miércoles";
    weekday[4] = "Jueves";
    weekday[5] = "Viernes";
    weekday[6] = "Sabado";

    var n = weekday[d.getDay()];
    return n;
}
router.get('/', isLoggedIn, (req, res) => {
    res.render('dashboard/dashboard', {
        style: 'style.css',
        day: diaSemana(),
        dashboard: true
    });
});


module.exports = router;