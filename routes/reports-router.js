/**
 * @file Enrutador de las peticiones https para reportes
 * @name class-router
 * @requires express,path,passport-conf,reports-controller,user-controller
 * @author ReTinta
 * @version 1.0.0 
 */
'use strict'

const express = require('express'),
      path = require('path');
var router = express.Router();
const ppc = require(path.join(__dirname,'..','models','passport-conf')),
      reportsController = require(path.join(__dirname,'..','controllers','reports-controller')),
      UserController = require(path.join(__dirname,'..','controllers','user-controller'));

router
    //------------- Create/Save Classes -----------------------
    .get('/charts', ppc.estaAutenticado,UserController.controlValidation,reportsController.sendClassReports)
    .get('/myreports', ppc.estaAutenticado,UserController.controlValidation,reportsController.obtenerReportes) 

module.exports = router