/**
 * @file Controlador para ABMC de clases y gestion de clases en linea
 * Permite iniciar, finalizar y valorar clases
 * @name class-controller
 * @requires class-model,class-service,user-model,path,dataValidation
 * @author Retinta Team
 * @version 1.0.0
 */
'use strict';

const path = require('path'),
  ClassModel = require(path.join(__dirname, '..', 'models', 'class-model')),
  ClassService = require(path.join(
    __dirname,
    '..',
    'services',
    'class-service'
  )),
  UserModel = require(path.join(__dirname, '..', 'models', 'user-model')),
  //CommentsModel = require('../models/comments-model'),
  checker = require(path.join(__dirname, '..', 'models', 'dataValidation'));

/**
 * @class
 * @memberof class-controller
 */
var ClassController = () => {};

const uploadDir = 'classImg';

/**
 * @function sendFormClass() - Envia pagina de creacion de
 * clases en Retinta
 * @param {Object} req - Solicitud del usuario
 * @param {Object} res - Respuesta a la solicitud de usuario
 * @param {Object} next - Siguiente función de middleware
 * @memberof class-controller.ClassController
 * @instance
 */
ClassController.sendFormClass = function (req, res, next) {
  let locals = {
    dataUser: req.user,
  };

  res.render(path.join('pug', 'create_class'), locals);
};

/**
 * @function comprobarDatos() - Valida que los datos de una
 * nueva clase cumplan con los formatos esperados
 * @param {Object} dataUser - Datos de la nueva clase
 * @memberof class-controller
 * @instance
 */
function comprobarDatos(myclass) {
  if (
    !checker.isNotEmpty(myclass.title) &&
    !checker.between(myclass.title, 3, 60)
  )
    return false;
  if (
    !checker.isNotEmpty(myclass.description) &&
    !checker.between(myclass.description, 3, 100)
  )
    return false;
  if (!checker.isNotEmpty(myclass.category)) return false;
  if (!checker.isNotEmpty(myclass.img)) return false;
  if (!myclass.public) {
    if (
      !checker.isNotEmpty(myclass.password) &&
      !checker.between(myclass.password, 8, 16)
    )
      return false;
  }
  return true;
}
/**
 * @function saveClass() - Permite crear una clase en Retinta
 * @param {Object} req - Solicitud del usuario
 * @param {Object} res - Respuesta a la solicitud de usuario
 * @param {Object} next - Siguiente funcion de middleware
 * @memberof class-controller.ClassController
 * @instance
 */
ClassController.saveClass = function (req, res, next) {
  let pathImg;
  let myclass;

  if (req.file) {
    //console.log('Imagen cargada')
    pathImg = path.join('/', `${uploadDir}`, `${req.file.filename}`); // armar el string de la url con una constante
  } else {
    //console.log('Imagen por defecto')
    pathImg = path.join('/', `${uploadDir}`, 'clasePorDefecto.jpg'); // armar el string de la url con una constante
  }
  myclass = {
    title: req.body.title,
    description: req.body.description,
    category: req.body.category,
    owner: req.user._id,
    percent_assist: req.body.porcentaje_de_asistencia,
    public: true,
    password: '',
    img: pathImg,
  };
  //console.log('fields.isPrivate  ----> ' + fields.isPrivate)
  if (req.body.isPrivate == 'private') {
    myclass.public = false;
    myclass.password = req.body.password;
    //console.log('ENTROO ACA AL FIIIN')
    //console.log('fields.password  ----> ' + fields.password)
  }
  if (comprobarDatos(myclass)) {
    ClassModel.saveClass(myclass, function (err, docs) {
      if (err) {
        next(err);
      }
      req.session['message'] = 'Nueva clase creada';
      req.session['type'] = 'success';
      res.redirect('/myClasses');
    });
  } else {
    res.sendFile(path.join('pug', 'page_system_404_3'), {
      error: 'Verifique los datos ingresados al crear la clase',
    });
  }
};

/**
 * @function getClass() - Permite acceder a una clase particular
 * @param {Object} req - Solicitud del usuario
 * @param {Object} res - Respuesta a la solicitud de usuario
 * @param {Object} next - Siguiente funcion de middleware
 * @memberof class-controller.ClassController
 * @instance
 */
ClassController.getClass = function (req, res, next) {
  let id = req.params.id;
  let idOwner;
  if (req.method === 'POST') {
    //console.log('LA ID DE ESTA Clase es -->' + id)
    ClassModel.getOne(id, function (err, dataClass) {
      if (err) {
        next(err);
      } else if (parseInt(dataClass.classState.toString()) == 2) {
        let pass = req.body.password;

        ClassModel.comparePassword(dataClass, pass, function (err, sonIguales) {
          if (err) next(err);
          else {
            idOwner = dataClass.classOwner;
            ClassController.getOwnerPromise(idOwner).then(function (owner) {
              let locals = {
                data: dataClass,
                dataUser: req.user,
                dataOwner: owner,
              };
              if (sonIguales) {
                res.render(path.join('pug', 'class'), locals);
              } else {
                req.session.title = 'Error al ingresar a clase';
                req.session.message = 'La contraseña de la clase es incorrecta';
                req.session.type = 'error';
                locals.dataMsj = {
                  title: req.session.title,
                  message: req.session.message,
                  type: req.session.type,
                };
                locals.classType = 'class';
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
        res.redirect('/classesOnline');
      }
    });
  } else {
    //esta entrando x get
    // console.log("la id pasada por parametros es: " + id)
    ClassModel.getOne(id, function (err, dataClass) {
      if (err) {
        next(err);
      } else if (
        parseInt(dataClass.classState.toString()) == 2 ||
        req.path == '/chart/' + id
      ) {
        idOwner = dataClass.classOwner;

        ClassController.getOwnerPromise(idOwner).then(function (owner) {
          let locals = {
            data: dataClass,
            dataUser: req.user,
            dataOwner: owner,
          };

          if (dataClass.classOwner == req.user.id) {
            // console.log('Esta entrando el Owner a su clase por eso no pedimos contraseqa')

            switch (req.path) {
              case '/class/' + id:
                //console.log("lo que obtubo en la consulta(dataClass) es:" + dataClass)
                res.render(path.join('pug', 'class'), locals);
                break;
              case '/chart/' + id:
                res.render(path.join('pug', 'charts'), locals);
                break;
              default:
                break;
            }
          } else {
            // console.log('No es el owner x eso le pedimos contraseqa si es privada')
            if (dataClass.classPublic) {
              // console.log('Se probo q es PUBLICA')
              res.render(path.join('pug', 'class'), locals);
            } else {
              // console.log('Se probo q es PRIVADA')
              (locals.classType = 'class'),
                (locals.dataMsj = {
                  title: req.session.title,
                  message: req.session.message,
                  type: req.session.type,
                });
              req.session['title'] = '';
              req.session['message'] = '';
              req.session['type'] = '';
              res.render(path.join('pug', 'enter_password'), locals);
            }
          }
        });
      } else {
        if (dataClass.classOwner == req.user.id) res.redirect('/myClasses');
        else res.redirect('/classesOnline');
      }
    });
  }
};

/**
 * @function getAssists() - Muestra tabla con asistencias de una
 * clase
 * @param {Object} req - Solicitud del usuario
 * @param {Object} res - Respuesta a la solicitud de usuario
 * @param {Object} next - Siguiente funcion de middleware
 * @memberof class-controller.ClassController
 * @instance
 */
ClassController.getAssists = function (req, res, next) {
  let id = req.params.id; // id de la clase q le pasas x GET
  let users = [];
  let i;
  let locals;
  ClassModel.getOne(id, function (err, dataClass) {
    if (err) next(err);
    for (i = 0; i < dataClass.classAssists.length; i++) {
      UserModel.getUserById(dataClass.classAssists[i], function (user) {
        users.push(user);
      });
    }
    res.render(path.join('pug', 'table_asistense'), locals);
  });
};

/**
 * @function myClasses() - Visualiza pagina con todas las clases
 * del usuario
 * @param {Object} req - Solicitud del usuario
 * @param {Object} res - Respuesta a la solicitud de usuario
 * @param {Object} next - Siguiente funcion de middleware
 * @memberof class-controller.ClassController
 * @instance
 */
ClassController.myClasses = function (req, res, next) {
  let id;
  let anotherUser;
  const getClassesAndRenderPug = (id) => {
    ClassModel.getAllMyClasses(id, function (
      err,
      arrayClassesCreated,
      arrayClassesFinalizated,
      arrayClassesUploads
    ) {
      if (err) {
        next(err);
      } else {
        let locals = {
          dataClassesCreated: arrayClassesCreated,
          dataClassesFinalizated: arrayClassesFinalizated,
          dataClassesUploads: arrayClassesUploads,
          dataClassesOnline: arrayClassesCreated.filter(
            (classs) => classs.classState == 2
          ),
          dataUser: req.user,
          dataMsj: {
            title: req.session.title,
            message: req.session.message,
            type: req.session.type,
          },
          source: req.session['source'],
          permisos: !anotherUser,
          dataAnotherUser: anotherUser || req.user,
        };
        req.session['message'] = ''; //vacio la seccion de mensajes
        req.session['title'] = '';
        req.session['source'] = '';
        //renderizar el pug donde se muestran las clases y pasarle locals
        res.render(path.join('pug', 'profile_classes'), locals);
      }
    });
  };
  if (req.params.mail) {
    UserModel.getUserByMail(req.params.mail, function (err, user) {
      if (err) next(err);
      id = user._id;
      anotherUser = user;
      getClassesAndRenderPug(id);
    });
  } else {
    id = req.user._id;
    getClassesAndRenderPug(id);
  }
};

/**
 * @function classDelete() - Da de baja una clase
 * @param {Object} req - Solicitud del usuario
 * @param {Object} res - Respuesta a la solicitud de usuario
 * @param {Object} next - Siguiente función de middleware
 * @memberof class-controller.ClassController
 * @instance
 */
ClassController.classDelete = function (req, res, next) {
  let id = req.body._id;
  //console.log("la id pasada por parametros es:" + id)
  ClassModel.updateBaja(id, function (err) {
    if (err) {
      next(err);
    } else {
      res.redirect('/myClasses');
    }
  });
};

/**
 * @function sendFormClassEdit() - Envia pagina de edicion de
 * clases en Retinta
 * @param {Object} req - Solicitud del usuario
 * @param {Object} res - Respuesta a la solicitud de usuario
 * @param {Object} next - Siguiente funcion de middleware
 * @memberof class-controller.ClassController
 * @instance
 */
ClassController.sendFormClassEdit = function (req, res, next) {
  let id = req.params.id;
  ClassModel.getOne(id, function (err, myclass) {
    if (err) next(err);
    let locals = {
      dataClass: myclass,
    };
    res.render(path.join('pug', 'edit_class'), locals);
  });
};

/**
 * @function editClass() - Edita los datos de una clase
 * @param {Object} req - Solicitud del usuario
 * @param {Object} res - Respuesta a la solicitud de usuario
 * @param {Object} next - Siguiente funcion de middleware
 * @memberof class-controller.ClassController
 * @instance
 */
ClassController.editClass = function (req, res, next) {
  let pathImg;
  let myclassUpdated;

  if (req.file) {
    //console.log('Imagen cargada')
    pathImg = path.join('/', `${uploadDir}`, `${req.file.filename}`); // armar el string de la url con una constante
  } else {
    pathImg = req.body.imgpath;
  }
  myclassUpdated = {
    _id: req.body._id,
    title: req.body.title,
    description: req.body.description,
    category: req.body.category,
    public: true,
    password: '',
    img: pathImg,
  };
  if (req.body.isPrivate == 'private') {
    myclassUpdated.public = false;
    myclassUpdated.password = req.body.password;
  }
  if (comprobarDatos(myclassUpdated)) {
    ClassModel.editClass(myclassUpdated, function (err) {
      if (err) next();
      res.redirect('/myClasses');
    });
  } else {
    res.sendFile(
      path.join(__dirname, '..', 'views', 'html', 'page_system_404_3.html')
    );
  }
};

/**
 * @function classStart() - Permite cambiar el estado de una
 * clase a Iniciada
 * @param {Object} req - Solicitud del usuario
 * @param {Object} res - Respuesta a la solicitud de usuario
 * @param {Object} next - Siguiente funcion de middleware
 * @memberof class-controller.ClassController
 * @instance
 */
ClassController.classStart = function (req, res, next) {
  let id = req.body._id;
  let idOwner;
  //console.log("la id pasada por parametros es:" + id)

  ClassModel.getOne(id, function (err, dataClass) {
    if (err) next(err);
    if (dataClass.classState > 2) {
      res.redirect('/myClasses');
    } else {
      ClassModel.updateStart(id, function (err, dataClass) {
        if (err) {
          next(err);
        } else {
          idOwner = dataClass.classOwner;
        }
        ClassController.getOwnerPromise(idOwner).then(function (owner) {
          let locals = {
            data: dataClass,
            dataUser: req.user,
            dataOwner: owner,
          };
          res.render(path.join('pug', 'class'), locals);
        });
      });
    }
  });
};

/**
 * @function getClassesOnline() - Permite buscar las clases en
 * linea que están en progreso
 * @param {Object} req - Solicitud del usuario
 * @param {Object} res - Respuesta a la solicitud de usuario
 * @param {Object} next - Siguiente funcion de middleware
 * @memberof class-controller.ClassController
 * @instance
 */
ClassController.getClassesOnline = function (req, res, next) {
  let arrayClasses;

  let query = { state: 2 };

  if (req.body.grabadas) query.state = 4;

  if (req.body.page) query.page = req.body.page;

  if (req.body.classCategory && req.body.classCategory != 0)
    query.category = req.body.classCategory;

  if (req.body.classTitle) query.title = req.body.classTitle;

  if (req.body.classOwner) query.owner = req.body.classOwner;

  ClassModel.getAllPaginate(query, function (err, arrayClassesInprogres) {
    if (err) {
      next(err);
    } else {
      arrayClasses = arrayClassesInprogres;
    }
    //deberia controlar con un if que no entro al next error

    var fn = function asyncArrayByIds(v) {
      // sample async action
      return new Promise((resolve) => resolve(v.classOwner));
    };

    var actions = arrayClasses.docs.map(fn); // run the function over all items

    // we now have a promises array and we want to wait for it

    var results = Promise.all(actions); // pass array of promises

    let locals;
    results.then(function (data) {
      var fn2 = function asyncConvertIdToDataOwners(v) {
        // sample async action
        return new Promise((resolve) =>
          resolve(ClassController.getOwnerPromise(v))
        );
      };

      var actions2 = data.map(fn2); // run the function over all items

      var results2 = Promise.all(actions2); // pass array of promises

      results2.then((data) => {
        // or just .then(console.log)
        // console.log('DATAFINAL ----> ' + data)
        locals = {
          //dataUser: req.user,
          dataClassesInprogres: arrayClasses.docs,
          dataOwners: data,
          page:
            arrayClasses.page && arrayClasses.docs.length > 0
              ? arrayClasses.page
              : null,
          pages:
            arrayClasses.pages && arrayClasses.docs.length > 0
              ? arrayClasses.pages
              : null,
          dataMsj: {
            title: req.session.title,
            message: req.session.message,
            type: req.session.type,
          },
        };
        req.session['message'] = ''; //vacio la seccion de mensajes
        req.session['title'] = '';
        if (!req.body.classCategory) {
          locals.dataUser = req.user;

          if (req.body.grabadas)
            res.render(path.join('pug', 'classes_uploads'), locals);
          else res.render(path.join('pug', 'classes_inprogres'), locals);
        } else res.send(locals);
      });
    });
  });
};

/**
 * @function classEnd() - Permite cambiar el estado de una clase a
 * finalizada
 * @param {Object} req - Solicitud del usuario
 * @param {Object} res - Respuesta a la solicitud de usuario
 * @param {Object} next - Siguiente funcion de middleware
 * @memberof class-controller.ClassController
 * @instance
 */
ClassController.classEnd = function (req, res, next) {
  let id = req.body._id;
  let duration = Number(req.body.duration);
  //console.log('Duracion entera de la clase: '+duration)

  // console.log("la id pasada por parametros EN CLASS END es :" + id)
  ClassModel.updateEnd(id, duration, function (err) {
    if (err) {
      next(err);
    } else {
      req.session['message'] = 'Nueva clase finalizada';
      req.session['type'] = 'info';
      req.session['source'] = 'claseFinalizada';
      res.redirect('/profile:' + req.user.userName);
    }
  });
};

/**
 * @function classEndByErr() - Permite cambiar el estado de una clase a
 * finalizada a causa de una corte en la conexión del docente
 * @param {string} classId - Id de clase
 * @memberof class-controller.ClassController
 * @instance
 */
ClassController.classEndByErr = function (classId, duration) {
  setTimeout(() => {
    ClassModel.findOne(classId)
      .then((classData) => {
        if (classData.duration != -1) {
          return false;
        } else {
          return true;
        }
      })
      .then((flag) => {
        if (flag) {
          let id = classId;
          // console.log("la id pasada por parametros EN CLASS END es :" + id)
          ClassModel.updateEnd(id, duration, function (err) {
            if (err) {
              console.log(err);
            }
          });
        }
      });
  }, 2000);
};

/**
 * @function classVote() - Permite valorar una clase en linea
 * @param {Object} req - Solicitud del usuario
 * @param {Object} res - Respuesta a la solicitud de usuario
 * @param {Object} next - Siguiente funcion de middleware
 * @memberof class-controller.ClassController
 * @instance
 */
ClassController.classVote = function (req, res, next) {
  let assistData = {
    userId: req.user._id,
    quitTime: req.body.quitTime,
    alreadyVote: req.body.alreadyVote,
  };

  if (req.body.origin == 'online') assistData.isClassOnline = true;
  else assistData.isClassOnline = false;

  ClassModel.saveAssist(assistData, req.body._id.toString(), function (
    err,
    puedeVotar
  ) {
    if (err) {
      next(err);
    } else {
      if (puedeVotar) {
        let voteData = {
          id: req.body._id,
          vote: req.body.vote,
        };
        ClassModel.updateVote(voteData, function (err) {
          if (err) next(err);
        });
      }
    }
    if (req.body.origin == 'online') res.send('/classesOnline');
    else res.send('/classesRec');
  });
};

/**
 * @function getUsersPromise() - Retorna una promesa de los asistentes
 * de una clase
 * @param {Object} dataClass - Datos de la clase
 * @memberof class-controller.ClassController
 * @instance
 */
ClassController.getUsersPromise = function (dataClass) {
  return new Promise(function (resolve, reject) {
    let users = [];
    let i;
    if (dataClass.classAssists.length == 0) resolve(users);
    for (i = 0; i < dataClass.classAssists.length; i++) {
      let extraDataUser = {};
      let hourOutClass;
      if (dataClass.classAssists[i].quitTime) {
        console.log('milesegundos .:', dataClass.classAssists[i].quitTime);
        var minutes = Math.floor(dataClass.classAssists[i].quitTime / 60000);
        var seconds = Math.floor(
          dataClass.classAssists[i].quitTime / 1000 - minutes * 60
        );
        hourOutClass = '' + minutes + 'min ' + seconds + 'seg';
      }
      extraDataUser.hourOutClass = dataClass.classAssists[i].quitTime
        ? hourOutClass
        : '-';
      extraDataUser.wasToEnd =
        dataClass.classAssists[i].endClass == 1
          ? 'SI'
          : dataClass.classAssists[i].endClass == 0
          ? 'NO'
          : '-';
      extraDataUser.voted =
        dataClass.classAssists[i].alreadyVote == 1
          ? 'SI'
          : dataClass.classAssists[i].alreadyVote == 0
          ? 'NO'
          : '-';
      extraDataUser.isClassOnline = dataClass.classAssists[i].isClassOnline
        ? 'SI'
        : 'NO';
      UserModel.getUserById(dataClass.classAssists[i].userId)
        .then((user) => {
          Object.assign(user, extraDataUser);
          users.push(user);
        })
        .then(function () {
          if (users.length == dataClass.classAssists.length) {
            console.log(JSON.stringify(users));
            resolve(users);
          }
        })
        .catch(function (err) {
          console.log('err', err);
        });
    }
  });
};

/**
 * @function getOwnerPromise() - Retorna promesa de obtener
 * un usuario por medio de su id
 * @param {string} idOwner - Id de usuario
 * @memberof class-controller.ClassController
 * @instance
 */
ClassController.getOwnerPromise = function (idOwner) {
  return new Promise(function (resolve) {
    return UserModel.getUserById(idOwner)
      .then(function (user) {
        resolve(user);
      })
      .catch(function (err) {
        console.log('err', err);
      });
  });
};

/**
 * @function getAssistsP() - Retorna los asistentes de una clase
 * por medio de una promesa
 * @param {Object} req - Solicitud del usuario
 * @param {Object} res - Respuesta a la solicitud de usuario
 * @param {Object} next - Siguiente funcion de middleware
 * @memberof class-controller.ClassController
 * @instance
 */
ClassController.getAssistsP = function (req, res, next) {
  let id = req.params.id; // id de la clase q le pasas x GET
  let className;
  ClassModel.findOne(id)
    .then(function (dataClass) {
      className = dataClass.classTitle;
      return ClassController.getUsersPromise(dataClass);
    })
    .then(function (fulfilled) {
      let locals = {
        dataUsers: fulfilled,
        dataUser: req.user,
        className: className,
      };

      res.render(path.join('pug', 'table_asistense'), locals);
    })
    .catch(function (err) {
      console.log('err', err);
    });
};

/**
 * @function saveQuestionnaire() - Permite almacenar un cuestionario
 * finalizado
 * @param {Object} data - Cuestionario de una clase
 * @memberof class-controller.ClassController
 * @instance
 */
ClassController.saveQuestionnaire = function (data) {
  ClassModel.saveQuestionnaire(data, function (err) {
    if (err) console.log(err);
  });
};

/**
 * @function getScreens() - Retorna pantallas almacenadas
 * en una clase
 * @param {Object} req - Solicitud del usuario
 * @param {Object} res - Respuesta a la solicitud de usuario
 * @param {Object} next - Siguiente funcion de middleware
 * @memberof class-controller.ClassController
 * @instance
 */
ClassController.getScreens = async function (req, res, next) {
  let classId = req.params.id;
  if (classId) {
    let screens = await ClassService.getScreens(classId);
    if (screens) {
      res.status(200);
    } else {
      res.status(500);
    }
    res.send(screens);
  }
};

/**
 * @function canVote() - Verifica si un alumno puede votar en una clase
 * @param {Object} req - Solicitud del usuario
 * @param {Object} res - Respuesta a la solicitud de usuario
 * @param {Object} next - Siguiente funcion de middleware
 * @memberof class-controller.ClassController
 * @instance
 */
ClassController.canVote = function (req, res, next) {
  if (req.query._id) {
    var idClass = req.query._id;
    var idUser = req.user._id;
    ClassModel.canVote(idClass, idUser, function (err, puedeVotar) {
      if (err) next(err);
      if (puedeVotar) res.send(true);
      else res.send(false);
    });
  } else {
    next(new Error('No se envió al servidor el id de la clase'));
  }
};

module.exports = ClassController;
