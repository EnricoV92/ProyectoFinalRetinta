/**
 * @file Administra la autenticacion de un usuario
 * @name passport-conf 
 * @requires path,passport,passport-local,user-connection
 * @author Retinta Team
 * @version 1.0.0 
 */
'use strict'
const path = require('path'),
    passport = require('passport'),
    localStrategy = require('passport-local').Strategy,
    User = require(path.join(__dirname, '.', 'user-connection'));

passport.serializeUser(function (user, done) {
    done(null, user._id);
})

passport.deserializeUser(function (id, done) {
    User.findById(id, function (err, user) {
        done(err, user)
    })
})

passport.use(new localStrategy({
    usernameField: 'userMail',
    passwordField: 'userPassword'
},
    function (userMail, userPassword, done) {
        User.findOne({
            userMail
        }, function (err, usuario) {
            if (!usuario) {
                return done(null, false, {
                    message: `Este email: ${userMail} no esta registrado`
                })
            } else {
                usuario.compararPassword(userPassword, function (err, sonIguales) {
                    if (sonIguales) {
                        return done(null, usuario)
                    } else {
                        return done(null, false, {
                            message: 'La contraseña no es válida'
                        })
                    }
                })
            }
        })
    }
))

/**
 * @function estaAutenticado() - Verifica si un usuario esta logueado
 * @param {Object} req - Solicitud del usuario 
 * @param {Object} res - Respuesta a la solicitud de usuario
 * @param {Object} next - Siguiente función de middleware
 * @memberof passport-conf
 * @instance
 */
exports.estaAutenticado = function (req, res, next) {
    if (req.isAuthenticated()) {
        return next()
    }
    //req.session['message'] = 'Debes estar logueado para acceder a este recurso'; //vacio la seccion de mensajes
    //req.session['title'] = 'Inicia Sesion';
    //req.session['type'] = 'error';
    res.status(401).redirect('/login');
}