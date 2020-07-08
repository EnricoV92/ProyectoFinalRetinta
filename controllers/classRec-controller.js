/**
 * @file Controlador para gestionar la reproducción de clases
 * @name classRec-controller 
 * @requires class-model,user-model,comments-model,path,class-controller
 * @author Retinta Team
 * @version 1.0.0 
 */
'use strict'

const path = require('path'),
    ClassModel = require(path.join(__dirname, '..', 'models', 'class-model')),
    UserModel = require(path.join(__dirname, '..', 'models', 'user-model')),
    CommentsModel = require(path.join(__dirname, '..', 'models', 'comments-model')),
    ClassController = require(path.join(__dirname, '.', 'class-controller'));

/**
 * @class
 * @memberof classRec-controller
 */
var ClassRecController = () => { };

/**
 * @function getClassRec() - Permite acceder a la reproducción de 
 * una clase de consulta
 * @param {Object} req - Solicitud del usuario 
 * @param {Object} res - Respuesta a la solicitud de usuario
 * @param {Object} next - Siguiente función de middleware
 * @memberof classRec-controller.ClassRecController
 * @instance
 */
ClassRecController.getClassRec = function (req, res, next) {
    let id = req.params.id
    let idOwner
    let comments = {}

    // esta entrando x post
    if (req.method === 'POST') {
        ClassModel.getOne(id, function (err, dataClass) {
            if (err) {
                next(err);
            } else if (parseInt(dataClass.classState.toString()) == 4) {
                let pass = req.body.password;

                ClassModel.comparePassword(dataClass, pass, function (err, sonIguales) {
                    if (err) next(err);
                    else {
                        idOwner = dataClass.classOwner;
                        ClassRecController.getOwnerPromise(idOwner).then(function (owner) {

                            let locals = {
                                data: dataClass,
                                dataUser: req.user,
                                dataOwner: owner

                            }
                            if (sonIguales) {
                                CommentsModel.getOne(id, function (err, dataComments) {
                                    if (err) {
                                        next(err)
                                    } else {
                                        if (dataComments != null) {
                                            comments = dataComments.comments
                                        }
                                        locals.dataComments = comments;
                                        locals.classType = 'classRec';
                                        res.render(path.join('pug', 'class_upload'), locals);
                                    }
                                })
                            } else {
                                req.session.title = 'Error al ingresar a clase'
                                req.session.message = 'La contraseña de la clase es incorrecta';
                                req.session.type = 'error';
                                locals.dataMsj = {
                                    title: req.session.title,
                                    message: req.session.message,
                                    type: req.session.type
                                }
                                locals.classType = 'classRec';
                                req.session['title'] = '';
                                req.session['message'] = '';
                                req.session['type'] = '';
                                console.log('la contraseña de la clase es incorrecta');
                                res.render(path.join('pug', 'enter_password'), locals);
                            }
                        });
                    }
                });
            } else {
                res.redirect('/classesRec');
            }
        });
    } else {
        // esta entrando x get
        // console.log("la id pasada por parametros es: " + id)
        CommentsModel.getOne(id, function (err, dataComments) {
            if (err) {
                next(err)
            } else {
                if (dataComments != null) {
                    comments = dataComments.comments
                }
                ClassModel.getOne(id, function (err, dataClass) {
                    if (err) {
                        next(err)
                    } else {
                        idOwner = dataClass.classOwner

                        ClassRecController.getOwnerPromise(idOwner).then(function (owner) {
                            let locals = {
                                data: dataClass,
                                dataUser: req.user,
                                dataOwner: owner,
                                dataComments: comments


                            }

                            if (dataClass.classOwner == req.user.id) {
                                // console.log('Esta entrando el Owner a su clase por eso no pedimos contraseqa')

                                switch (req.path) {
                                    case "/classRec/" + id:
                                        //console.log("lo que obtubo en la consulta(dataClass) es:" + dataClass)
                                        res.render(path.join('pug', 'class_upload'), locals);
                                        break;
                                    case "/chart/" + id:
                                        res.render(path.join('pug', 'charts'), locals);
                                        break;
                                    default:
                                        break;
                                }

                            } else {
                                // console.log('No es el owner x eso le pedimos contraseqa si es privada')
                                if (dataClass.classPublic) {
                                    // console.log('Se probo q es PUBLICA')
                                    res.render(path.join('pug', 'class_upload'), locals);
                                } else {
                                    locals.dataMsj = {
                                        title: req.session.title,
                                        message: req.session.message,
                                        type: req.session.type
                                    }
                                    req.session['title'] = '';
                                    req.session['message'] = '';
                                    req.session['type'] = '';
                                    locals.classType = 'classRec';
                                    // console.log('Se probo q es PRIVADA')
                                    res.render(path.join('pug', 'enter_password'), locals);
                                }
                            }
                        })

                    }
                })

            }
        })
    }


}

/**
 * @function getClassesRecRec() - Permite buscar clases de 
 * consulta para su reproducción
 * @param {Object} req - Solicitud del usuario 
 * @param {Object} res - Respuesta a la solicitud de usuario
 * @param {Object} next - Siguiente función de middleware
 * @memberof classRec-controller.ClassRecController
 * @instance
 */
ClassRecController.getClassesRec = function (req, res, next) {
    req.body.grabadas = 1;
    ClassController.getClassesOnline(req, res, next);
    /*let arrayClasses
    ClassModel.getAllUploads(function (err, arrayClassesUploads) {
        if (err) {
            next(err)
        } else {
            arrayClasses = arrayClassesUploads
        }
        //deberia controlar con un if que no entro al next error

        var fn = function asyncArrayByIds(v) { // sample async action
            return new Promise(resolve => setTimeout(() => resolve(v.classOwner), 100));
        };

        var actions = arrayClasses.map(fn); // run the function over all items

        // we now have a promises array and we want to wait for it

        var results = Promise.all(actions); // pass array of promises

        let locals
        results.then(function (data) {
            var fn2 = function asyncConvertIdToDataOwners(v) { // sample async action
                return new Promise(resolve => setTimeout(() => resolve(ClassRecController.getOwnerPromise(v)), 100));
            };

            var actions2 = data.map(fn2); // run the function over all items

            var results2 = Promise.all(actions2); // pass array of promises

            results2.then(data => { // or just .then(console.log)
                // console.log('DATAFINAL ----> ' + data)
                locals = {
                    dataUser: req.user,
                    dataClassesInprogres: arrayClasses,
                    dataOwners: data
                }
                res.render('./pug/classes_uploads', locals)
            })
        })
    })*/
}


/**
 * @function classUpload() - Permite cambiar el estado de una 
 * clase a Subida
 * @param {Object} req - Solicitud del usuario 
 * @param {Object} res - Respuesta a la solicitud de usuario
 * @param {Object} next - Siguiente función de middleware
 * @memberof classRec-controller.ClassRecController
 * @instance
 */
ClassRecController.classUpload = function (req, res, next) {
    let id = req.body._id
    //console.log("la id pasada por parametros es :" + id)
    ClassModel.updateUpload(id, function (err) {
        if (err) {
            next(err)
        } else {
            req.session['message'] = 'Nueva clase subida';
            req.session['type'] = 'info';
            req.session['source'] = 'claseSubida';
            res.redirect('/profile:' + req.user.userName)
        }
    })
}

/**
 * @function storeStrokes() - Permite almacenar los dibujos de una 
 * clase
 * @param {string} classId - Id de clase 
 * @param {Object} strokes - Lineas de trazado a almacenar
 * @memberof classRec-controller.ClassRecController
 * @instance
 */
ClassRecController.storeStrokes = function (classId, strokes) {
    ClassModel.storeStrokes(classId, strokes, function (err) {
        if (err)
            console.log("Exception saving the Strokes")
    })

}

/**
 * @function storeChat() - Permite almacenar el chat de una 
 * clase en línea
 * @param {string} classId - Id de clase 
 * @param {Object} chatMsg - Chats a almacenar
 * @memberof classRec-controller.ClassRecController
 * @instance
 */
ClassRecController.storeChat = function (classId, chatMsg) {
    ClassModel.storeChat(classId, chatMsg, function (err) {
        if (err) {
            console.log("Exception saving the Strokes")
        } else {
            console.log("Strokes saved")
        }
    })
}

/**
 * @function getSavedChat() - Obtiene el chat de una clase
 * dada
 * @param {Object} req - Solicitud del usuario 
 * @param {Object} res - Respuesta a la solicitud de usuario
 * @param {Object} next - Siguiente función de middleware
 * @memberof classRec-controller.ClassRecController
 * @instance
 */
ClassRecController.getSavedChat = function (req, res, next) {
    ClassModel.getSavedChat(req.body.classId, function (err, chat) {
        if (err) next(err)
        res.json(chat)
    })
}

/**
 * @function commentClassUpload() - Permite cargar comentarios a una 
 * clase de consulta
 * @param {Object} req - Solicitud del usuario 
 * @param {Object} res - Respuesta a la solicitud de usuario
 * @param {Object} next - Siguiente función de middleware
 * @memberof classRec-controller.ClassRecController
 * @instance
 */
ClassRecController.commentClassUpload = function (req, res, next) {

    let dataComment = {
        idClass: req.body.idClass,
        ownerId: req.body.ownerId,
        ownerMail: req.user.userMail,
        ownerName: req.body.ownerName,
        text: req.body.text
    }
    // console.log('dataComment Back-End' + JSON.stringify(dataComment));

    CommentsModel.save(dataComment, function (err, comment) {
        if (err) {
            next(err)
        } else {
            res.send(comment)
        }
    }
    )
}

/**
 * @function getOwnerPromise() - Retorna promesa de obtener
 * un usuario por medio de su id
 * @param {string} idOwner - Id de usuario 
 * @memberof classRec-controller.ClassRecController
 * @instance
 */
ClassRecController.getOwnerPromise = function (idOwner) {
    return new Promise(function (resolve, reject) {
        let i
        let owner
        return UserModel.getUserById(idOwner)
            .then(function (user) {
                owner = user
            })
            .then(function () {
                resolve(owner)
            })
            .catch(function (err) {
                console.log('err', err)
            })
    })
}

/**
 * @function getComentsPromise() - Retorna promesa de obtener
 * los comentarios de una clase determinada
 * @param {string} idOwner - Id de usuario 
 * @memberof classRec-controller.ClassRecController
 * @instance
 */
ClassRecController.getComentsPromise = function (idClass) {
    return new Promise(function (resolve, reject) {

        return CommentsModel.getCommentsByIdClass(idClass).then(function (dataComments) {
            resolve(dataComments)
        })
            .catch(function (err) {
                console.log('err', err)
            })
    })
}

module.exports = ClassRecController