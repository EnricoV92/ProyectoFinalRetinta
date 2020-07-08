/**
 * @file Enrutador de las peticiones https para ABMC de clases y gestion de clases en linea
 * @name class-router
 * @requires express,path,multer,passport-conf,class-controller,user-controller
 * @author ReTinta
 * @version 1.0.0 
 */
'use strict'

const express = require('express'),
      path = require('path'),
      multer = require('multer');

var router = express.Router();
const ppc = require(path.join(__dirname, '..', 'models', 'passport-conf')),
      ClassController = require(path.join(__dirname, '..', 'controllers', 'class-controller')),
      UserController = require(path.join(__dirname, '..', 'controllers', 'user-controller')),
      upload = multer({
            dest: path.join(__dirname, '..', 'uploads', 'classImg'),
            onFileUploadStart: function (file, req, res) {
                  if (!req.file) return false
            }
      });

router
      //------------- Create/Save Classes -----------------------
      .get('/createClass', ppc.estaAutenticado, UserController.controlValidation, ClassController.sendFormClass)
      .post('/saveClass', ppc.estaAutenticado, upload.single('img'), ClassController.saveClass)

      .get('/editClass/:id', ppc.estaAutenticado, ClassController.sendFormClassEdit)
      .post('/editClass/:id', ppc.estaAutenticado, upload.single('img'), ClassController.editClass)

      //--------------- User Classes ---------------------------
      .get('/myClasses', ppc.estaAutenticado, UserController.controlValidation, ClassController.myClasses)
      .get('/myClasses::mail', ppc.estaAutenticado, UserController.controlValidation, ClassController.myClasses)
      .delete('/classDelete', ppc.estaAutenticado, UserController.controlValidation, ClassController.classDelete)

      //------------- Get Data Classes --------------------------
      .get('/class/:id', ppc.estaAutenticado, UserController.controlValidation, ClassController.getClass)
      .post('/class/:id', ppc.estaAutenticado, UserController.controlValidation, ClassController.getClass)
      .get('/report/:id', ClassController.getAssistsP)
      .get('/chart/:id', ppc.estaAutenticado, UserController.controlValidation, ClassController.getClass)
      .get('/canVote', ppc.estaAutenticado, UserController.controlValidation, ClassController.canVote)

      //--------------- Classes Online -------------------
      .put('/classOnline', ppc.estaAutenticado, UserController.controlValidation, ClassController.classStart)
      .get('/classesOnline', ClassController.getClassesOnline)
      .post('/classesOnline', ClassController.getClassesOnline)
      .put('/endClass', ppc.estaAutenticado, UserController.controlValidation, ClassController.classEnd)
      .put('/classVote', ppc.estaAutenticado, UserController.controlValidation, ClassController.classVote) // votar

      .get("/classes/:id/screens", ClassController.getScreens)

module.exports = router