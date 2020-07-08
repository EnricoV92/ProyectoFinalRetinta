/**
 * @file Modelo de Usuarios
 * @name user-model
 * @requires path,user-connection
 * @author Retinta Team
 * @version 1.0.0
 */
'use strict';

const path = require('path'),
  UserConn = require(path.join(__dirname, '.', 'user-connection'));

/**
 * @class
 * @memberof user-model
 */
var UserModel = () => {};

/**
 * @function isUser() - Valida si el mail ya existe para un usuario registrado en dbRT
 * @param {string} userMail - Mail a validar
 * @param {function} cb - Retorna true o false si existe o no respectivamente
 * @memberof user-model.UserModel
 * @instance
 */
UserModel.isUser = function (userMail, cb) {
  let query = { userMail: userMail };
  UserConn.findOne(query).exec(function (err, user) {
    if (err) throw err;
    cb(user);
  });
};

/**
 * @function getUserByMail() - Retorna usuario segun mail otorgada
 * @param {string} mail - mail de usuario
 * @memberof user-model.UserModel
 * @instance
 */
UserModel.getUserByMail = function (mail, cb) {
  UserConn.findOne(
    { userMail: mail },
    '_id userName userLastname userMail userAbout userProfesion userAvatar'
  ).exec(function (err, user) {
    if (err) {
      cb(err, null);
    }

    cb(null, user);
  });
};

/**
 * @function getUserById() - Retorna usuario segun id otorgada
 * @param {string} id - Id de usuario
 * @memberof user-model.UserModel
 * @instance
 */
UserModel.getUserById = function (id) {
  return UserConn.findById(
    id,
    '_id userName userLastname userMail userCountry userAvatar'
  ).exec();
};

/**
 * @function isUser() - Ejecuta funcion si existe el usuario segun
 * la id otorgada
 * @param {string} id - Id de usuario
 * @param {function} cb  - Funcion a ejecutarse si no hay ningun error
 * @memberof user-model.UserModel
 * @instance
 */
UserModel.getUserById1 = function (id, cb) {
  UserConn.findById(id).exec(function (err, user) {
    if (err) throw err;
    cb(user);
  });
};

/**
 * @function save() - Salva / guarda un usuario en dbRT
 * @param {Object} dataUser - Info del usuario a salvar
 * @param {function} cb - Loguea automaticamente al usuario luego de que se salva
 * @memberof user-model.UserModel
 * @instance
 */
UserModel.save = function (dataUser, cb) {
  let user = new UserConn({
    userName: dataUser.userName,
    userLastname: dataUser.userLastname,
    userCity: dataUser.userCity,
    userCountry: dataUser.userCountry,
    userMail: dataUser.userMail,
    userPassword: dataUser.userPassword,
    userAvatar: dataUser.userAvatar,
  });
  if (dataUser.userVerificationNumber) {
    user.userVerificationNumber = dataUser.userVerificationNumber;
  }
  if (dataUser.userVerificated) {
    user.userVerificated = dataUser.userVerificated;
  }
  if (dataUser.userVerificationTryings) {
    user.userVerificationTryings = dataUser.userVerificationTryings;
  }
  if (dataUser.userBlocked) {
    user.userBlocked = dataUser.userBlocked;
  }

  user.save(function (err) {
    if (err) {
      cb(err);
    }
    cb(null, user);
  });
};

/**
 * @function updateOne() - Actualiza un usuario existente segun
 * datos pasados por parametros
 * @param {Object} user - Usuario a ser actualizado
 * @param {function} cb - Funcion a ejecutarse luego que se realiza la actualizacion
 * @memberof user-model.UserModel
 * @instance
 */
UserModel.updateOne = function (user, cb) {
  UserConn.update({ _id: user._id }, user, cb);
};

/**
 * @function editProfile() - Actualiza los datos del usuario en dbRT
 * @param {Object} user - Usuario actualizado
 * @param {function} cb - Redirecciona al perfil de usuario
 * @memberof user-model.UserModel
 * @instance
 */
UserModel.editProfile = function (user, cb) {
  user.save(function (err) {
    if (err) cb(err);
    cb(null);
  });
};

/**
 * @function comparePassword() - Compara contraseña ingresada contra la que existe para un usuario en dbRT
 * @param {Object} user - Usuario
 * @param {String} oldPass - Contraseña que ingresa el usuario
 * @param {function} cb - Maneja la respuesta de la comparacion
 * @memberof user-model.UserModel
 * @instance
 */
UserModel.comparePassword = function (user, oldPass, cb) {
  user.compararPassword(oldPass, cb);
};

/**
 * @function changePassword() - Modifica la contraseña del usuario en dbRT
 * @param {Object} user - Usuario
 * @param {String} newPass - Contraseña nueva que se almacena y modifica la que existe en dbRT
 * @param {function} cb - Redirecciona al perfil de usuario
 * @memberof user-model.UserModel
 * @instance
 */
UserModel.changePassword = function (newPass, user, cb) {
  user.userPassword = newPass;
  user.save(function (err) {
    if (err) cb(err);
    cb(null);
  });
  /*let query = {userMail: userMail}
    UserConn.where().update()
        .where(query)
        .update({$set: {userPassword: newPass}})
        .exec(cb())*/
};

/**
 * @function changeAvatar() - Cambia el avatar de un usuario
 * @param {Object} user - Usuario
 * @param {function} cb - Redirecciona al perfil de usuario
 * @memberof user-model.UserModel
 * @instance
 */
UserModel.changeAvatar = function (user, cb) {
  user.save(function (err) {
    if (err) cb(err);
    cb(null);
  });
};

module.exports = UserModel;
