/**
 * @file Administracion de pagina Retinta
 * @name app
 * @requires express,fs,https,body-parser,path,express-method-override,public,uploads,
 * views,user-router,class-router,classRec-router,reports-router
 * @author ReTinta
 * @version 1.0.0 
 */
'use strict'

const express = require('express');
var app = express();
const fs = require('fs'),
      https = require('https').createServer({//creamos servidor
            key: fs.readFileSync('server.key'),//clave privada
            cert: fs.readFileSync('server.crt')//certificado firmado
        }, app),
      bodyParser = require("body-parser"),
      //cookieParser = require("cookie-parser"),
      path = require('path'),
      restFul = require('express-method-override')('_method'),
      publicDir = express.static(path.join(__dirname,'public')),
      uploadDir = express.static(path.join(__dirname,'uploads')),
      viewDir = path.join(__dirname,'views'),
      userRouter = require(path.join(__dirname,'routes','user-router')),
      classRouter = require(path.join(__dirname,'routes','class-router')),
      classRecRouter = require(path.join(__dirname,'routes','classRec-router')),
      reportsRouter = require(path.join(__dirname,'routes','reports-router'));
      //port = (process.env.PORT || 3000);

function error404(req, res, next) {
    res.render(path.join('pug','page_system_404_3'),{error:'La página que está buscando no existe'})
}
app
    .set('views', viewDir)
    .set('view engine', 'pug')
    .use(bodyParser.json())
    .use(bodyParser.urlencoded({
        extended: true
    }))
    .use(publicDir)
    .use(uploadDir)
    .use(restFul)
    .use(userRouter)
    .use(classRouter)
    .use(classRecRouter)
    .use(reportsRouter)
    .use(error404)


module.exports = https;