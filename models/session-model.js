/**
 * @file Permite almacenar la session en base de datos para que 
 * sea persistente durante un tiempo determinado
 * @name session-model 
 * @requires path,express-session,connect-mongo,db-conf
 * @author Retinta Team
 * @version 1.0.0 
 */
'use strict'

const path = require('path'),
      session = require('express-session'),
      MongoStore = require('connect-mongo')(session),
      conf = require(path.join(__dirname,'.','db-conf')),
      sess = {
        secret : 'ESTO ES UN SECRETO',
        resave : true,
        saveUninitialized : true,
        store : new MongoStore ({
            url : `mongodb://${conf.mongo.host}/${conf.mongo.db}`,
            autoReconnect : true
        }),
        cookie:{
            secure:true,
            maxAge:3600000
        }
    };

module.exports = sess,session
