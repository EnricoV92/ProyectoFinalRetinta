/**
 * @file Permite administrar los comentarios de una clase determinada
 * @name comments-model
 * @requires moment,path,comments-connection
 * @author Retinta Team
 * @version 1.0.0 
 */
'use strict'

const moment = require('moment'),
    path = require('path'),
    CommentsConn = require(path.join(__dirname, '.', 'comments-connection'));

/**
 * @class
 * @memberof comments-model
 */
var CommentsModel = () => { };

/**
 * @function save() - Permite almacenar un comentario
 * @param {Object} dataComments - Comentario a almacenar
 * @param {function} cb - Funcion a ejecutarse cuando se guardo un comentario con exito o no
 * @memberof comments-model.CommentsModel
 * @instance
 */
CommentsModel.save = function (dataComments, cb) {
    let idClass = dataComments.idClass;

    //Es el primero o no?
    let query = { classId: idClass }
    CommentsConn
        .findOne(query)
        .exec((err, dataCommentsMongo) => {
            if (err) {
                cb(err)
            } else {
                // console.log("dataCommentsMongo -->>" + dataCommentsMongo)
                if (dataCommentsMongo == null) {
                    //primer comentario
                    // console.log("Es primer comentario");
                    let time = moment(new Date).format('DD/MM/YYYY HH:mm');
                    var comment = {
                        ownerId: dataComments.ownerId,
                        ownerName: dataComments.ownerName,
                        ownerMail: dataComments.ownerMail,
                        text: dataComments.text,
                        time: time,
                    }

                    let comments = new CommentsConn({
                        classId: dataComments.idClass,
                        comments: [comment]
                    })
                    comments.save(function (err) {
                        if (err) {
                            cb(err)
                        }
                        cb(null, comment)
                    })
                    //primer comentario
                } else {
                    // console.log("NO Es primer comentario "+moment(Date.now, 'DD-MM-YY HH:mm'));
                    let time = moment(new Date).format('DD/MM/YYYY HH:mm');
                    let comment = {
                        ownerId: dataComments.ownerId,
                        ownerName: dataComments.ownerName,
                        ownerMail: dataComments.ownerMail,
                        text: dataComments.text,
                        time: time,
                    }
                    CommentsConn.findOneAndUpdate(
                        query,
                        { $push: { comments: comment } },
                        { safe: true, upsert: true },
                        function (err, comments) {
                            if (err) {
                                cb(err)
                            }
                            cb(null, comment)

                        }
                    );
                }
            }
        })



}

/**
 * @function getCommentsByIdClass() - Obtiene los comentarios de una determinada clase
 * @param {string} idClass- Id de clase
 * @memberof comments-model.CommentsModel
 * @instance
 */
CommentsModel.getCommentsByIdClass = function (idClass) {
    let query = { classId: idClass }
    CommentsConn
        .findOne(query)
        .exec()
}

/**
 * @function getOne() - Retorna los comentarios de una clase segun su id 
 * atravez de un callback
 * @param {string} idClass - Id de clase
 * @param {function} cb - Funcion a ejecutarse cuando se guardo un comentario con exito o no
 * @memberof comments-model.CommentsModel
 * @instance
 */
CommentsModel.getOne = function (idClass, cb) {
    let query = { classId: idClass }
    CommentsConn
        .findOne(query)
        .exec((err, dataComments) => {
            if (err) {
                cb(err)
            } else {

                cb(null, dataComments)
            }
        })
}
module.exports = CommentsModel