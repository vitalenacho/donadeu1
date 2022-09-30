const express = require('express');
const router = express.Router();

const pool = require('../database.js'); // pool === Database o conexion con la base de datos
/*
router.get('/', (req,res) =>{
    res.render('intro/intro', {
        style: 'intro.css',
        intro: true
    });    
});


router.post('/add', async (req,res) =>{
    const { uname, psw, remember } = req.body;
    const newUser = {
        'Nombre': uname,
        'Contraseña': psw,
        'e-mail': remember
    };
    console.log(newUser);
    await pool.query('INSERT INTO usuarios set ?', [newUser]);
    req.flash('success', 'Usuario creado satisfactoriamente');
    res.redirect('/dashboard');
});
*/

module.exports = router;