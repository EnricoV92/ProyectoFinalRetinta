/**
 * @file Prepara todos los servicios para que esten listos para trabajar (Servidor Express y WebSocket). 
 * Cambia el estado del puerto 3000 a modo escucha.
 * @name server
 * @requires path,app,websocket-server
 * @author ReTinta
 * @version 1.0.0 
 */
'use strict'

const path = require('path'),
      port = 443;
var https = require(path.join(__dirname,'app')),

    server = https.listen(port , function () {
        console.log('\x1b[41m\x1b[37m%s\x1b[0m',`Escuchando en el puerto ${port} `);
    });
const websocketServer = require(path.join(__dirname,'websocket-server'));
websocketServer.WebSocketServerInit(server);

//para redireccionar a puerto seguro
var http = require('http');
http.createServer((req,res)=>{
    res.writeHead(301, {"Location":"https://"+req.headers['host'] + req.url});
    res.end();
}).listen(80);