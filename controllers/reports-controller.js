/**
 * @file Controlador para los reportes de las clases
 * @name reports-controller 
 * @requires reports-service
 * @author Retinta Team
 * @version 1.0.0 
 */
'use strict'

const path = require('path'),
    ReportsService = require(path.join(__dirname, '..', 'services', 'reports-service')),
    reportsService = new ReportsService();

/**
 * @class
 * @memberof reports-controller
 */
var ReportsController = () => { };

/**
 * @function sendClassReports() - Permite visualizar la pagina
 * de reportes
 * @param {Object} req - Solicitud del usuario 
 * @param {Object} res - Respuesta a la solicitud de usuario
 * @memberof reports-controller.ReportsController
 * @instance
 */
ReportsController.sendClassReports = (req, res) => {
    let locals = {
        dataUser: req.user
    }
    res.render(path.join('pug', 'class_reports'), locals)
}

/**
 * @function obtenerReportes() - Otorga toda la informacion de 
 * reportes perteneciente al usuario utilizando o no un filtro
 * @param {Object} req - Solicitud del usuario 
 * @param {Object} res - Respuesta a la solicitud de usuario
 * @param {Object} next - Siguiente función de middleware
 * @memberof reports-controller.ReportsController
 * @instance
 */
ReportsController.obtenerReportes = async (req, res, next) => {
    const idOwner = req.user._id;
    let arrayIds = req.query.idClasses;
    if (req.query.idClasses) {
        arrayIds = arrayIds.split(',');
    }
    const responseData = await reportsService.obtenerReportes(idOwner, arrayIds);
    res.json(responseData);
}

module.exports = ReportsController;

