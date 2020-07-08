/**
 * @file Establece el esquema de comentarios almacenado en 
 * base de datos Mongo. Ademas establece parametros de comunicacion con base de datos
 * @name comments-connection
 * @requires mongoose,mongoose.Schema
 * @author Retinta Team
 * @version 1.0.0 
 */
'use strict'

const mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    //bcrypt = require('bcrypt-nodejs'),

    CommentSchema = new Schema({
        ownerId: { type: Schema.Types.ObjectId },
        ownerName: { type: String },
        ownerMail: { type: String },
        text: { type: String },
        time: { type: String }
    },
        {
            collection: 'comment'
        }),
    CommentsSchema = new Schema({
        classId: { type: Schema.Types.ObjectId },
        comments: [CommentSchema]
    }, {
        collection: 'comments'
    })

var CommentsModel = mongoose.model('Comments', CommentsSchema);
module.exports = CommentsModel