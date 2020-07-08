/**
 * @file Permite la administracion de los chat de una clase
 * @name chat-model
 * @requires path,chat-connection
 * @author Retinta Team
 * @version 1.0.0 
 */
'use strict'

const path = require('path'), 
      ChatConn = require(path.join(__dirname,'.','chat-connection'));
    //fs = require('fs'),

/**
 * @class
 * @memberof chat-model
 */ 
var ChatModel = function() {};

/**
 * @function saveClass() - Guarda el chat de una clase
 * @param {Object} dataClass - Datos de una clase
 * @param {function} cb - Funcion que se ejecuta si el chat se almacena correctamente
 * @memberof chat-model.ChatModel
 * @instance
 */
ChatModel.saveClass = function(dataClass, cb) {
    let chat = new ChatConn({
    })

    chat.save(function(err,data) {
        if (err) {
            cb(err)
        }
    })
    
}

module.exports = ChatModel