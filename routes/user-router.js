/**
 * @file Enrutador de las peticiones https para administrar usuarios
 * @name user-router
 * @requires express,path,user-controller,express-session,connect-mongo,passport,db-conf,passport-conf
 * @author ReTinta
 * @version 1.0.0 
 */
'use strict'

const express = require('express'),
    path = require('path');

var router = express.Router();
const UserController = require(path.join(__dirname, '..', 'controllers', 'user-controller')),
    session = require('express-session'),
    MongoStore = require('connect-mongo')(session),
    passport = require('passport'),

    conf = require(path.join(__dirname, '..', 'models', 'db-conf.json')),
    sess = {
        secret: 'ESTO ES UN SECRETO',
        name: 'RTSess',
        resave: true,
        saveUninitialized: true,
        store: new MongoStore({
            url: `mongodb://${conf.mongo.host}/${conf.mongo.db}`,
            autoReconnect: true
        }),
        cookie: {
            secure: true,
            maxAge: 3600000
        }
    };

router
    .use(session(sess))
    .use(passport.initialize())
    .use(passport.session())

const ppc = require(path.join(__dirname, '..', 'models', 'passport-conf'));


router
    //------ Home ReTinta ---------
    .get('/', UserController.sendHome)
    .get('/index.html', UserController.sendHome)

    //------- User Login -----------
    .get('/login', UserController.sendLogin)
    .post('/ajax', UserController.validate)
    .post('/mailValidation', UserController.mailValidation)
    .post('/resendMail', UserController.resendMail)
    .post('/doLogin', UserController.postLogin)
    .post('/signup', UserController.signup)
    .get('/logout', ppc.estaAutenticado, UserController.logout)
    //-------- User Profile ----------
    .param('user', ppc.estaAutenticado, UserController.controlValidation, UserController.who)
    .get('/profile::user', UserController.who, ppc.estaAutenticado, UserController.controlValidation, UserController.sendProfileUser)
    .get('/profile', ppc.estaAutenticado, UserController.controlValidation, UserController.sendProfile)
    .get('/account::user', UserController.who, ppc.estaAutenticado, UserController.controlValidation, UserController.sendProfileAccountUser)
    .get('/account', ppc.estaAutenticado, UserController.controlValidation, UserController.sendProfileAccount)
    //--------- Edit User Profile ----------
    .put('/account::user', ppc.estaAutenticado, UserController.controlValidation, UserController.editProfile)
    .put('/cambiarPassword', UserController.changePassword)
    .post('/cambiarAvatar', UserController.changeAvatar)


module.exports = router