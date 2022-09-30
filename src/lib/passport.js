const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const pool = require('../database.js'); // pool === Database o conexion con la base de datos
const helpers = require('../lib/helpers.js')

passport.use('local.signup', new LocalStrategy({
    usernameField: 'uname',
    passwordField: 'psw',
    passReqToCallback: true
}, async(req, uname, psw, done) => {
    //console.log(req.body);
    const { remember } = req.body;
    const newUser = {
        Nombre: uname,
        Contraseña: psw,
        'e-mail': remember
    };
    console.log(newUser);
    newUser.Contraseña = await helpers.encryptPassword(psw);
    const result = await pool.query('INSERT INTO usuarios SET ?', [newUser]);
    newUser.id = result.insertId;
    console.log(newUser);
    return done(null, newUser);
}));




passport.use('local.login', new LocalStrategy({
    usernameField: 'uname',
    passwordField: 'psw',
    passReqToCallback: true
}, async(req, uname, psw, done) => {
    const rows = await pool.query('SELECT * FROM usuarios WHERE Nombre = ?', [uname]);
    if (rows.length > 0) {
        const user = rows[0];
        //console.log(user);
        const validPassword = await helpers.matchPassword(psw, user.Contraseña);
        //const validPassword = psw == user.password;
        //console.log([psw,user.Contraseña, validPassword]);
        if (validPassword) {
            user.id = user.idUsuarios;
            done(null, user, req.flash('success', '¡Bienvenido!'));
        } else {
            done(null, false, req.flash('message', 'Contraseña incorrecta'));
        }
    } else {
        return done(null, false, req.flash('message', 'El nombre de usuario no existe'));
    }
}));

passport.use('local.changepass', new LocalStrategy({
    usernameField: 'uname',
    passwordField: 'psw',
    passReqToCallback: true
}, async(req, uname, psw, done) => {
    //console.log(req.body);
    const { remember } = req.body;
    const newUser = {
        Nombre: uname,
        Contraseña: psw,
        'e-mail': remember
    };
    console.log(newUser);
    newUser.Contraseña = await helpers.encryptPassword(psw);
    const result = await pool.query('UPDATE usuarios SET usuarios.Contraseña = ? WHERE usuarios.idUsuarios = 41;', newUser.Contraseña);
    newUser.id = 41;
    console.log(newUser);
    console.log(result);
    return done(null, newUser);
}));

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async(id, done) => {
    const rows = await pool.query('SELECT * FROM usuarios WHERE idUsuarios = ?', [id]);
    const user = rows[0];
    done(null, rows[0]);
});