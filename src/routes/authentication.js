const express = require('express');
const router = express.Router();
const passport = require('passport');
const { isLoggedIn, isNotLoggedIn } = require('../lib/auth');

const pool = require('../database.js'); // pool === Database o conexion con la base de datos
/*
router.get('/intro', (req,res) =>{
    res.render('intro/intro', {
        style: 'intro.css',
        intro: true
    });    
});
*/

router.post('/newUser',passport.authenticate('local.signup', {
        successRedirect:'/dashboard',
        failureRedirect:'/intro',
        failureFlash: true
    }));

router.post('/altUser',passport.authenticate('local.changepass', {
        successRedirect:'/dashboard',
        failureRedirect:'/intro',
        failureFlash: true
    }));    



router.get('/intro', isNotLoggedIn, (req, res) => {
    res.render('intro/intro', {
        style: 'intro.css',
        intro: true
    });
});

router.post('/intro', isNotLoggedIn, (req, res, next) => {
    passport.authenticate('local.login', {
        successRedirect: '/dashboard',
        failureRedirect: '/intro',
        failureFlash: true
    })(req, res, next);
});

router.get('/logout', (req, res) => {
    req.logOut();
    res.redirect('/intro');
});



module.exports = router;