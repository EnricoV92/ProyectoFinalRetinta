/**
 * @file Establece el esquema de chats almacenado en 
 * base de datos Mongo. Ademas establece parametros de comunicacion con base de datos
 * @name chat-connection
 * @requires mongoose,mongoose.Schema
 * @author Retinta Team
 * @version 1.0.0 
 */
'use strict'

const mongoose = require('mongoose'),
      Schema = mongoose.Schema,
      //bcrypt = require('bcrypt-nodejs'),

    MessageSchema = new Schema({
        ownerMessage: { type: String, required: true },
        ownerIdMessage: { type: Schema.Types.ObjectId, required: true },
        textMessage: { type: String, required: true },
        timemessage: { type: Number, required: true }
    },
    {
        collection: 'message'
    }),
    ChatSchema = new Schema({
        classId: { type: Schema.Types.ObjectId },
        messagesChat : [MessageSchema]    
    }, {
        collection: 'chat'
    })

    
var ChatModel = mongoose.model('Chat', ChatSchema);
module.exports = ChatModel