/**
 * @file Modelo para administrar las clases
 * @name class-model
 * @requires path,class-connection,user-connection
 * @author Retinta Team
 * @version 1.0.0
 */
'use strict';

const path = require('path'),
  ClassConn = require(path.join(__dirname, '.', 'class-connection')),
  UserConn = require(path.join(__dirname, '.', 'user-connection'));

/**
 * @class
 * @memberof class-model
 */
var ClassModel = function () {};

/**
 * @function saveClass() - Permite el almacenamiento de una clase
 * @param {Object} dataClass - Datos de la clase a almacenar
 * @param {function} cb - Funcion que se ejecuta si la clase se almacena con exito o no
 * @memberof class-model.ClassModel
 * @instance
 */
ClassModel.saveClass = function (dataClass, cb) {
  let myclass = new ClassConn({
    classTitle: dataClass.title,
    classDescription: dataClass.description,
    classPercentAssistReq: dataClass.percent_assist,
    classCategory: dataClass.category,
    classOwner: dataClass.owner,
    classPublic: dataClass.public,
    classPassword: dataClass.password,
    classImg: dataClass.img,
    classState: 1,
    classCantE: 0,
    classCantMB: 0,
    classCantB: 0,
    classCantR: 0,
    classCantM: 0,
    duration: -1
  });

  //console.log('dataClass.password en el MODELO  ----> ' + dataClass.password)
  myclass.save(function (err, data) {
    if (err) {
      cb(err);
    }
    cb(null, data);
  });
};

/**
 * @function editClass() - Permite la modificacion de una clase
 * @param {Object} dataClass - Datos de la clase a almacenar
 * @param {function} cb - Funcion que se ejecuta si la clase se modifica con exito o no
 * @memberof class-model.ClassModel
 * @instance
 */
ClassModel.editClass = function (dataClass, cb) {
  this.getOne(dataClass._id, function (err, myclass) {
    if (err) cb(err);
    (myclass.classTitle = dataClass.title),
      (myclass.classDescription = dataClass.description),
      (myclass.classCategory = dataClass.category),
      (myclass.classImg = dataClass.img),
      (myclass.classPublic = dataClass.public),
      (myclass.classPassword = dataClass.password);
    myclass.save(function (err) {
      if (err) cb(err);
      cb(null);
    });
  });
};

/**
 * @function getOne() - Obtiene una clase por id
 * @param {string} id - Id de clase a obtener
 * @param {function} cb - Funcion que se ejecuta si la clase se obtiene con exito o no
 * @memberof class-model.ClassModel
 * @instance
 */
ClassModel.getOne = function (id, cb) {
  ClassConn.findOne({ _id: id }).exec((err, myclass) => {
    if (err) {
      cb(err);
    } else {
      cb(null, myclass);
    }
  });
};

/**
 * @function findOne() - Obtiene una clase por id
 * @param {string} id - Id de clase a obtener
 * @memberof class-model.ClassModel
 * @instance
 */
ClassModel.findOne = function (id) {
  return ClassConn.findById(id).exec();
};

/**
 * @function getAllMyClasses() - Obtiene las clases por id de ower
 * @param {string} id - Id del owner de las clases
 * @param {function} cb - Funcion que se ejecuta si las clases se obtiene con exito o no
 * @memberof class-model.ClassModel
 * @instance
 */
ClassModel.getAllMyClasses = function (id, cb) {
  ClassConn.find({ classOwner: { $eq: id }, classState: { $lte: 2 } }).exec(
    (err, myClassesCreated) => {
      if (err) {
        cb(err);
      } else {
        ClassConn.find({
          classOwner: { $eq: id },
          classState: { $eq: 3 },
        }).exec((err, myClassesFinalizated) => {
          if (err) {
            cb(err);
          } else {
            ClassConn.find({
              classOwner: { $eq: id },
              classState: { $eq: 4 },
            }).exec((err, myClassesUploads) => {
              if (err) {
                cb(err);
              } else {
                // console.log("cantidad de clases Creadas son: " + myClassesCreated.length)
                // console.log("cantidad de clases Finalizadas son: " + myClassesFinalizated.length)
                // console.log("cantidad de clases Subidas son: " + myClassesUploads.length)
                cb(
                  null,
                  myClassesCreated,
                  myClassesFinalizated,
                  myClassesUploads
                );
              }
            });
          }
        });
      }
    }
  );
};

/**
 * @function updateVote() - Actualiza una clase con el voto dado por un alumno
 * @param {Object} id - Nuevo voto
 * @param {function} cb - Funcion que se ejecuta si se puede agregar el voto con exito o no
 * @memberof class-model.ClassModel
 * @instance
 */
ClassModel.updateVote = function (data, cb) {
  if (data.vote != null) {
    switch (data.vote) {
      case '5':
        ClassConn.updateOne(
          { _id: data.id },
          { $inc: { classCantE: 1 } },
          function (err) {
            if (err) {
              cb(err);
            }
            cb(null);
          }
        );

        break;

      case '4':
        ClassConn.updateOne(
          { _id: data.id },
          { $inc: { classCantMB: 1 } },
          function (err) {
            if (err) {
              cb(err);
            }
            cb(null);
          }
        );
        break;

      case '3':
        ClassConn.updateOne(
          { _id: data.id },
          { $inc: { classCantB: 1 } },
          function (err) {
            if (err) {
              cb(err);
            }
            cb(null);
          }
        );
        break;

      case '2':
        ClassConn.updateOne(
          { _id: data.id },
          { $inc: { classCantR: 1 } },
          function (err) {
            if (err) {
              cb(err);
            }
            cb(null);
          }
        );
        break;

      case '1':
        ClassConn.updateOne(
          { _id: data.id },
          { $inc: { classCantM: 1 } },
          function (err) {
            if (err) {
              cb(err);
            }
            cb(null);
          }
        );
        break;
      default:
        cb(null);
        break;
    }
  } else {
    cb(err);
  }
};

/**
 * @function saveAssist() - Guarda una asistencia de la clase
 * @param {string} userID - Id del alumno que asistio
 * @param {Object} classDoc - Clase a agregar la asistencia
 * @param {function} cb - Funcion que se ejecuta si se almaceno la asistencia con exito o no
 * @memberof class-model.ClassModel
 * @instance
 */
ClassModel.saveAssist = function (myData, classId, cb) {
  ClassConn.findById({ _id: classId }, function (err, classDoc) {
    if (err) {
      cb(err, null);
    }
    let response = true;
    if (classDoc.classAssists.length > 0) {
      let index = classDoc.classAssists.findIndex(function (currentValue) {
        return myData.userId.toString() == currentValue.userId.toString();
      });

      if (index != -1) {
        // traer el quiet time y hacer +=
        if (myData.isClassOnline == true) {
          let aVote =
            classDoc.classAssists[index].alreadyVote.toString() == '0'
              ? myData.alreadyVote
              : classDoc.classAssists[index].alreadyVote;
          if (classDoc.classAssists[index].alreadyVote.toString() == '1')
            response = false;
          let previousValueQuitTime = classDoc.classAssists[index].quitTime;
          
          classDoc.classAssists.splice(index, 1);
          let element = {
            userId: myData.userId,
            quitTime: Number(myData.quitTime) + Number(previousValueQuitTime),
            alreadyVote: aVote,
            isClassOnline: myData.isClassOnline,
          }
          if(classDoc.duration > 0){
            if(element.quitTime > Number(classDoc.duration)) 
              element.quitTime = Number(classDoc.duration)
            let calculo = element.quitTime* 100 / classDoc.duration
            element['endClass'] = (calculo >= classDoc.classPercentAssistReq)?1:0
          }
          classDoc.classAssists.push(element);
        } else {
          if (classDoc.classAssists[index].alreadyVote == 1) {
            response = false;
            cb(null, response);
            return;
          } else {
            myData.quitTime = classDoc.classAssists[index].quitTime;
            myData.isClassOnline = classDoc.classAssists[index].isClassOnline;
            if(classDoc.classAssists[index].endClass){
              myData.endClass = classDoc.classAssists[index].endClass
            }
            classDoc.classAssists.splice(index, 1);
            classDoc.classAssists.push(myData);
          }
        }
      }else{
        if(classDoc.duration > 0){
          if(myData.quitTime > Number(classDoc.duration)) 
          myData.quitTime = Number(classDoc.duration)
          let calculo = myData.quitTime* 100 / classDoc.duration
          myData['endClass'] = (calculo >= classDoc.classPercentAssistReq)?1:0
        }
        classDoc.classAssists.push(myData);
      }
    }else{
      if(classDoc.duration > 0){
        if(myData.quitTime > Number(classDoc.duration)) 
          myData.quitTime = Number(classDoc.duration)
        let calculo = myData.quitTime* 100 / classDoc.duration
        myData['endClass'] = (calculo >= classDoc.classPercentAssistReq)?1:0
      }
      classDoc.classAssists.push(myData);
    }
   
    classDoc.save(function (err) {
      if (err) {
        cb(err, null);
      }
      cb(null, response);
    });
  });
};

/**
 * @function updateEnd() - Cambia el estado de una clase a finalizada
 * @param {string} id - Id de la clase
 * @param {function} cb - Funcion que se ejecuta si se actualiza la clase con exito o no
 * @memberof class-model.ClassModel
 * @instance
 */
ClassModel.updateEnd = function (id, duration, cb) {

  ClassConn.findById({ _id: id }, function (err, classDoc) {
    if(err)cb(err)
    else{
      classDoc.classState = 3
      classDoc.duration = duration
      if(Number(duration) != 0){
        
        for (let i = classDoc.classAssists.length -1 ; i >= 0; i--) {

          let calculo = classDoc.classAssists[i].quitTime * 100 / duration
          classDoc.classAssists[i]['endClass'] = (calculo >= classDoc.classPercentAssistReq)?1:0
          let element  = classDoc.classAssists[i]
          classDoc.classAssists.splice(i,1)
          classDoc.classAssists.push(element)
        }
       
      }
     
      classDoc.save(function (err1) {
        if (err1) {
          cb(err1);
        }
        cb(null);
      });
    }
  })
  
}

/**
 * @function updateStart() - Actualiza el estado de una clase a iniciada
 * @param {string} id - Id de la clase
 * @param {function} cb - Funcion que se ejecuta si se actualiza la clase con exito o no
 * @memberof class-model.ClassModel
 * @instance
 */
ClassModel.updateStart = function (id, cb) {
  ClassConn.findByIdAndUpdate(id, { $set: { classState: 2 } }, function (
    err,
    data
  ) {
    if (err) {
      cb(err, null);
    }
    cb(null, data);
  });
};

/**
 * @function updateUpload() - Actualiza el estado de una clase a subida
 * @param {string} id - Id de la clase
 * @param {function} cb - Funcion que se ejecuta si se actualiza la clase con exito o no
 * @memberof class-model.ClassModel
 * @instance
 */
ClassModel.updateUpload = function (id, cb) {
  ClassConn.findByIdAndUpdate(id, { $set: { classState: 4 } }, function (
    err,
    data
  ) {
    if (err) {
      cb(err, null);
    }
    cb(null, data);
  });
};

/**
 * @function getAll() - Obtiene todas las clases iniciadas
 * @param {function} cb - Funcion que se ejecuta si obtengo todas las clases iniciadas con exito o no
 * @memberof class-model.ClassModel
 * @instance
 */
ClassModel.getAll = function (cb) {
  ClassConn.find({ classState: { $eq: 2 } }).exec((err, myClassesInprogres) => {
    if (err) {
      cb(err);
    } else {
      // console.log("cantidad de clases InProgres son: " + myClassesInprogres.length)
      cb(null, myClassesInprogres);
    }
  });
};

/**
 * @function getAllPaginate() - Obtiene las clases paginadas de acuerdo al estado
 * de clase solicitado
 * @param {Object} query - Peticion de clases de acuerdo a algun criterio
 * @param {function} cb - Funcion que se ejecuta si obtengo las clases con exito o no
 * @memberof class-model.ClassModel
 * @instance
 */
ClassModel.getAllPaginate = function (query, cb) {
  let query2 = { classState: query.state };

  if (!query.page) query.page = 1;

  if (query.category) query2.classCategory = query.category;

  if (query.title)
    query2.classTitle = { $regex: '^' + query.title, $options: 'i' };

  if (query.owner) {
    UserConn.find(
      { userName: { $regex: '^' + query.owner, $options: 'i' } },
      '_id',
      function (err, datos) {
        if (err) cb(err);

        if (datos.length > 0) {
          query2.classOwner = { $in: [] };
          datos.forEach((element) => {
            query2.classOwner.$in.push(element._id);
          });
        } else {
          return cb(null, { docs: [] });
        }
        ClassConn.paginate(
          query2,
          {
            page: query.page,
            limit: 20,
            sort: { classTitle: 1 },
            select: '_id classTitle classDescription classOwner classImg ',
          },
          (err, result) => {
            if (err) cb(err);
            cb(null, result);
          }
        );
      }
    );
  } else {
    ClassConn.paginate(
      query2,
      {
        page: query.page,
        limit: 20,
        sort: { classTitle: 1 },
        select: '_id classTitle classDescription classOwner classImg ',
      },
      (err, result) => {
        if (err) cb(err);
        cb(null, result);
      }
    );
  }
};

/**
 * @function getAllUploads() - Obtiene todas las clases subidas
 * @param {function} cb - Funcion que se ejecuta si obtengo todas las clases subidas con exito o no
 * @memberof class-model.ClassModel
 * @instance
 */
ClassModel.getAllUploads = function (cb) {
  ClassConn.find({ classState: { $eq: 4 } }).exec((err, myClassesUploads) => {
    if (err) {
      cb(err);
    } else {
      // console.log("cantidad de clases Uploads son: " + myClassesUploads.length)
      cb(null, myClassesUploads);
    }
  });
};

/**
 * @function updateBaja() - Da de baja una clase
 * @param {string} id - Id de clase
 * @param {function} cb - Funcion que se ejecuta si modifico la clase con exito o no
 * @memberof class-model.ClassModel
 * @instance
 */
ClassModel.updateBaja = function (id, cb) {
  ClassConn.findByIdAndUpdate(id, { $set: { classState: 6 } }, function (err) {
    if (err) {
      cb(err);
    }
    cb(null);
  });
};

/**
 * @function comparePassword() - Compara contraseñas
 * @param {Object} classDoc - Clase con contraseña a comparar
 * @param {string} pass - Contraseña
 * @param {function} cb - Funcion que se ejecutar si se comparo la contraseña
 * @memberof class-model.ClassModel
 * @instance
 */
ClassModel.comparePassword = function (classDoc, pass, cb) {
  classDoc.compararPassword(pass, cb);
};

/**
 * @function storeStrokes() - Almacena las lineas de trazado
 * @param {string} idClass - Id de la clase
 * @param {Object} strokes - Trazados a almacenar
 * @param {function} cb - Funcion que se ejecutar si almaceno los trazados
 * @memberof class-model.ClassModel
 * @instance
 */
ClassModel.storeStrokes = function (idClass, strokes, cb) {
  ClassConn.findByIdAndUpdate(
    idClass,
    { $push: { classScreens: [strokes] } },
    function (err) {
      if (err) {
        cb(err);
      }
    }
  );
};

/**
 * @function storeChat() - Almacena los chats de trazado
 * @param {string} idClass - Id de la clase
 * @param {Object} chatMsg - Chats a almacenar
 * @param {function} cb - Funcion que se ejecutar si almaceno los chats
 * @memberof class-model.ClassModel
 * @instance
 */
ClassModel.storeChat = function (classId, chatMsg, cb) {
  ClassConn.findByIdAndUpdate(
    classId,
    { $push: { classChat: chatMsg } },
    function (err) {
      if (err) {
        cb(err);
      }
    }
  );
};

/**
 * @function getSavedChat() - Obtiene chats de una clase
 * @param {string} idClass - Id de la clase
 * @param {function} cb - Funcion que se ejecutar si obtengo los chats
 * @memberof class-model.ClassModel
 * @instance
 */
ClassModel.getSavedChat = function (classId, cb) {
  ClassConn.findById({ _id: classId }, 'classChat', cb);
};

/**
 * @function saveQuestionnaire() - Almacena los cuestionarios de una clase
 * @param {Object} data - Clase
 * @param {function} cb - Funcion que se ejecutar si almaceno los cuestinarios
 * @memberof class-model.ClassModel
 * @instance
 */
ClassModel.saveQuestionnaire = function (data, cb) {
  ClassConn.findById(data.classId, function (err, clase) {
    if (err) throw err;
    var quest = [];
    if (clase.classQuestionnaires) quest = clase.classQuestionnaires;
    quest.push(data.data);
    ClassConn.updateOne(
      { _id: data.classId },
      { $set: { classQuestionnaires: quest } },
      cb
    );
  });
};

/**
 * @function getClassesByOwnerId() - Obtengo las clases al menos
 * iniciadas de un owner
 * @param {string} idClass - Id de owner
 * @memberof class-model.ClassModel
 * @instance
 */
ClassModel.getClassesByOwnerId = async (id) => {
  const result = await ClassConn.find({
    classOwner: { $eq: id },
    classState: { $gte: 2 },
  });
  return result;
};

ClassModel.canVote = function (idClass, idUser, cb) {
  ClassConn.findById({ _id: idClass }, function (err, classDoc) {
    if (err) {
      cb(err, null);
      return;
    } else {
      if (classDoc.classAssists.length > 0) {
        let index = classDoc.classAssists.findIndex(function (currentValue) {
          return idUser.toString() == currentValue.userId.toString();
        });
        if (index != -1) {
          if (classDoc.classAssists[index].alreadyVote == 1) {
            cb(null, false);
            return;
          } else {
            cb(null, true);
            return;
          }
        } else {
          cb(null, true);
          return;
        }
      } else {
        cb(null, true);
      }
    }
  });
};

module.exports = ClassModel;
