const { response } = require("express");

module.exports = {
  isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    return res.redirect("/intro");
  },

  isNotLoggedIn(req, res, next) {
    if (!req.isAuthenticated()) {
      return next();
    }
    return res.redirect("/dashboard");
  },

  isLoggedInSale(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    return res.json({redirect: "/logout"}),res.end();
  },
  isLoggedReport(req, res, next) {
    if (req.isAuthenticated() && [31,41,81,111].includes(req.user.idUsuarios)) {
      return next();
    }
    return req.flash('message', 'Usted no posee los permisos necesarios para acceder al formulario'),res.redirect("/ventas");
  },
  isLoggedProducts(req, res, next) {
    if (req.isAuthenticated() && [31,41,81,111].includes(req.user.idUsuarios)) {
      return next();
    }
    return req.flash('message', 'Usted no posee los permisos necesarios para acceder al formulario'),res.redirect("/ventas");
  }
};
