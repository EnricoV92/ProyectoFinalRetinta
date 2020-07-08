/**
 * @file Enrutador de las peticiones https para clases almacenadas
 * @name classRec-router
 * @requires express,path,passport-conf,classRec-controller,user-controller
 * @author ReTinta
 * @version 1.0.0 
 */
'use strict'

const express = require('express'),
      path = require('path');
var router = express.Router();
const ppc = require(path.join(__dirname,'..','models','passport-conf')),
      ClassRecController = require(path.join(__dirname,'..','controllers','classRec-controller')),
      UserController = require(path.join(__dirname,'..','controllers','user-controller'));
      
router
    //----------------- Get Data Classes Rec ---------------    
    .get('/classRec/:id', ppc.estaAutenticado,UserController.controlValidation, ClassRecController.getClassRec)        
	.get('/classesRec', ClassRecController.getClassesRec)
	.post('/classRec/:id', ppc.estaAutenticado,UserController.controlValidation, ClassRecController.getClassRec)        
    .post('/classesRec', ClassRecController.getClassesRec) 
    
    //------------------ Store Classes -----------------
    .put('/classUpload', ppc.estaAutenticado,UserController.controlValidation, ClassRecController.classUpload) 
	.get('/classID::id', ClassRecController.storeStrokes)
	.post('/savedChat',ClassRecController.getSavedChat)
    
    //------------------ Comments Classes ---------------
    .post('/CommentClassUpload', ClassRecController.commentClassUpload)

module.exports = router
