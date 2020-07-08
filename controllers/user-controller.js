/**
 * @file Controlador para la administración de usuarios
 * @name user-controller
 * @requires user-model,path,passport,formidable,fs,nodemailer,dataValidation
 * @author Retinta Team
 * @version 1.0.0
 */
'use strict';

const path = require('path'),
  UserModel = require(path.join(__dirname, '..', 'models', 'user-model')),
  passport = require('passport'),
  formidable = require('formidable'),
  fs = require('fs'),
  nodemailer = require('nodemailer'),
  checker = require(path.join(__dirname, '..', 'models', 'dataValidation'));

/**
 * @class
 * @memberof user-controller
 */
var UserController = () => { };

const uploadDir = 'avatarsProfile';

let transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'retintateam@gmail.com',
    pass: 'retinta2018',
  },
});

/**
 * @function sendHome() - Envía página de Inicio de Retinta
 * @param {Object} req - Solicitud del usuario
 * @param {Object} res - Respuesta a la solicitud de usuario
 * @param {Object} next - Siguiente función de middleware
 * @memberof user-controller.UserController
 * @instance
 */
UserController.sendHome = function (req, res, next) {
  res.sendFile(path.join(__dirname, '..', 'views', 'html', 'index.html'));
};

/**
 * @function sendLogin() - Envía página de Login
 * @param {Object} req - Solicitud del usuario
 * @param {Object} res - Respuesta a la solicitud de usuario
 * @param {Object} next - Siguiente función de middleware
 * @memberof user-controller.UserController
 * @instance
 */
UserController.sendLogin = function (req, res, next) {
  let locals = {
    dataError: '',
    dataMsj: {
      title: req.session.title,
      message: req.session.message,
      type: req.session.type,
    },
  };
  req.session['message'] = ''; //vacio la seccion de mensajes
  req.session['title'] = '';
  if (req.user) res.redirect('/profile:' + req.user.userName);
  else res.render(path.join('pug', 'login'), locals);
};

/**
 * @function validate() - Valida que no haya un usuario existente asociado a un mail
 * @param {Object} req - Solicitud del usuario
 * @param {Object} res - Respuesta a la solicitud de usuario
 * @param {Object} next - Siguiente función de middleware
 * @memberof user-controller.UserController
 * @instance
 */
UserController.validate = function (req, res, next) {
  UserModel.isUser(req.body.userEmail, function (usuarioE) {
    if (usuarioE) {
      res.send(false);
    } else {
      res.send(true);
    }
  });
};

/**
 * @function comprobarDatos() - Valida que los datos de un
 * nuevo usuario cumplan con los formatos esperados
 * @param {Object} dataUser - Datos del nuevo usuario
 * @memberof user-controller
 * @instance
 */
function comprobarDatos(dataUser) {
  if (!checker.onlyLetters(dataUser.userName)) return false;
  if (!checker.onlyLetters(dataUser.userLastname)) return false;
  // if(!checker.onlyNumberAndLetters(dataUser.userAddress))return false
  if (!checker.onlyLetters(dataUser.userCity)) return false;
  if (!checker.onlyLetters(dataUser.userCountry)) return false;
  if (!checker.isMail(dataUser.userMail)) return false;
  if (!checker.isNotEmpty(dataUser.userPassword)) return false;
  if (!checker.between(dataUser.userPassword, 8, 16)) return false;
  return true;
}

/**
 * @function signup() - Permite registrarse en Retinta
 * @param {Object} req - Solicitud del usuario
 * @param {Object} res - Respuesta a la solicitud de usuario
 * @param {Object} next - Siguiente función de middleware
 * @memberof user-controller.UserController
 * @instance
 */
UserController.signup = function (req, res, next) {
  let random = parseInt(Math.random() * 899999 + 100000);


  let dataUser = {
    userName: req.body.fullname,
    userLastname: req.body.lastname,
    userCity: req.body.city,
    userCountry: req.body.country,
    userMail: req.body.userMail,
    userPassword: req.body.userPassword,
    userVerificationNumber: random,
    userVerificated: 1, //1-> No verificado, 2-> Verificado
    userVerificationTryings: 1, //Hasta 7 -> Luego se blockea
    userBlocked: 1, //1->No bloqueado, 2 -> Blockeado
    userAvatar: path.join('/', 'avatarsProfile', 'avatarUnknownSquare.jpg'),
  };
  if (comprobarDatos(dataUser)) {
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) console.log('Error al enviar mensaje: ' + error);
    });

    UserModel.save(dataUser, function (err, user) {
      if (err) {
        next(err);
      }

      req.logIn(user, function (err) {
        if (err) {
          next(err);
        }
        res.cookie('username', req.user.userName);
        res.cookie('usermail', user.userMail)
        req.session['message'] = 
          'Bienvenido ' + req.user.userName + ' a Re-tinta!';
        req.session['type'] = 'success';
        // res.redirect('/profile:' + req.user.userName)
        res.render(path.join('pug', 'mail-verification'), {
          dataUser: req.user,
        });
      });
    });
  } else {
    return UserController.error404(req, res, next);
  }
};

/**
 * @function mailValidation() - Permite validar el mail
 * con que se registra el usuario
 * @param {Object} req - Solicitud del usuario
 * @param {Object} res - Respuesta a la solicitud de usuario
 * @param {Object} next - Siguiente función de middleware
 * @memberof user-controller.UserController
 * @instance
 */
UserController.mailValidation = function (req, res, next) {
  UserModel.getUserById1(req.session.passport.user, function (user) {
    if (user.userBlocked != 2) {
      if (parseInt(req.body.codigo) == user.userVerificationNumber) {
        //console.log('Si es el código enviado al mail')
        user.userVerificated = 2;
        UserModel.updateOne(user, function (err) {
          if (err) {
            next(err);
          }
        });

        res.send({ respuesta: true, user: user.userName });
      } else if (req.body.codigo != '-1') {
        user.userVerificationTryings = user.userVerificationTryings + 1;

        if (user.userVerificationTryings == 7) {
          user.userBlocked = 2;
        }

        UserModel.updateOne(user, function (err) {
          if (err) {
            next(err);
          }
        });
        res.send({ respuesta: false, intentos: user.userVerificationTryings });
      } else if (req.body.codigo == '-1' || !req.body.codigo) {
        res.send({ respuesta: false, intentos: user.userVerificationTryings });
      }
    } else {
      res.send({ respuesta: false, intentos: user.userVerificationTryings });
    }
  });
};

/**
 * @function resendMail() - Permite reenviar la solicitud de
 * verificación al mail correspondiente
 * @param {Object} req - Solicitud del usuario
 * @param {Object} res - Respuesta a la solicitud de usuario
 * @param {Object} next - Siguiente función de middleware
 * @memberof user-controller.UserController
 * @instance
 */
UserController.resendMail = function (req, res, next) {
  UserModel.getUserById1(req.session.passport.user, function (user) {
    if (user.userBlocked != 2) {

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log('Error al enviar mensaje: ' + error);
          res.send(false);
        } else {
          res.send(true);
        }
      });
    } else {
      res.send(false);
    }
  });
};

/**
 * @function controlValidation() - Permite que sólo los usuarios
 * registrados accedan a ciertos endpoints restringidos
 * @param {Object} req - Solicitud del usuario
 * @param {Object} res - Respuesta a la solicitud de usuario
 * @param {Object} next - Siguiente función de middleware
 * @memberof user-controller.UserController
 * @instance
 */
UserController.controlValidation = function (req, res, next) {
  UserModel.getUserById1(req.session.passport.user, function (user) {
    if (user.userVerificated == 2) {
      next();
    } else {
      res.render(path.join('pug', 'mail-verification'), { dataUser: req.user });
    }
  });
};

/**
 * @function postLogin() - Loguea al usuario en el sistema,
 * previamente realiza la autenticacion del mismo
 * @param {Object} req - Solicitud del usuario
 * @param {Object} res - Respuesta a la solicitud de usuario
 * @param {Object} next - Siguiente función de middleware
 * @memberof user-controller.UserController
 * @instance
 */
UserController.postLogin = function (req, res, next) {
  passport.authenticate('local', function (err, usuario, info) {
    if (err) return next(err);
    if (!usuario) {
      let locals = {
        dataError: 'Email o contraseña no válidos',
        dataMsj: {
          title: req.session.title,
          message: req.session.message,
          type: req.session.type,
        },
      };
      req.session['message'] = ''; //vacio la seccion de mensajes
      req.session['title'] = '';
      req.session['type'] = '';
      res.render(path.join('pug', 'login'), locals);
    } else {
      req.logIn(usuario, function (err) {
        if (err) next(err);
        res.cookie('username', req.user.userName);
        res.cookie('usermail', usuario.userMail)
        //req.session['title'] = 'Login exitoso';
        req.session['message'] =
          'Bienvenido ' + req.user.userName + ' a Re-tinta!';
        req.session['type'] = 'success';
        res.redirect('/profile:' + req.user.userName);
      });
    }
  })(req, res, next);
};

/**
 * @function logout() - Desloguea al usurio de Retinta
 * @param {Object} req - Solicitud del usuario
 * @param {Object} res - Respuesta a la solicitud de usuario
 * @memberof user-controller.UserController
 * @instance
 */
UserController.logout = function (req, res) {
  req.logout();
  res.redirect('/login');
};

/**
 * @function who() - Verifica si el parámetro user es la
 * persona logueada
 * @param {Object} req - Solicitud del usuario
 * @param {Object} res - Respuesta a la solicitud de usuario
 * @param {Object} next - Siguiente función de middleware
 * @param {Object} user - Un nombre de usuario
 * @memberof user-controller.UserController
 * @instance
 */
UserController.who = function (req, res, next, user) {
  if (user !== req.user.userName) {
    return UserController.error404(req, res, next);
  }

  next();
};

/**
 * @function sendProfileUser() - Envía página de Perfil de Usuario
 * en Retinta
 * @param {Object} req - Solicitud del usuario
 * @param {Object} res - Respuesta a la solicitud de usuario
 * @param {Object} next - Siguiente función de middleware
 * @memberof user-controller.UserController
 * @instance
 */
UserController.sendProfileUser = function (req, res, next) {
  /*let locals = {
        dataUser: req.user,
        dataMsj: {
            title: req.session.title,
            message: req.session.message,
            type: req.session.type
        }
    }
    req.session['message'] = ''; //vacio la seccion de mensajes
    req.session['title'] = '';
    */
  res.redirect('/myClasses');
};

/**
 * @function sendProfileUser() - Redirecciona hacia el perfil de
 * usuario
 * @param {Object} req - Solicitud del usuario
 * @param {Object} res - Respuesta a la solicitud de usuario
 * @param {Object} next - Siguiente función de middleware
 * @memberof user-controller.UserController
 * @instance
 */
UserController.sendProfile = function (req, res, next) {
  res.redirect('/profile:' + req.user.userName);
};

/**
 * @function sendProfileAccountUser() - Envia pagina de Cuenta de
 * Perfil de usuario de Retinta
 * @param {Object} req - Solicitud del usuario
 * @param {Object} res - Respuesta a la solicitud de usuario
 * @param {Object} next - Siguiente función de middleware
 * @memberof user-controller.UserController
 * @instance
 */
UserController.sendProfileAccountUser = function (req, res, next) {
  let locals = {
    dataUser: req.user,
  };
  res.render(path.join('pug', 'profile_account'), locals);
};

/**
 * @function sendProfileAccount() - Redirecciona a la pagina de
 * Cuenta de Perfil de usuario de Retinta
 * @param {Object} req - Solicitud del usuario
 * @param {Object} res - Respuesta a la solicitud de usuario
 * @param {Object} next - Siguiente función de middleware
 * @memberof user-controller.UserController
 * @instance
 */
UserController.sendProfileAccount = function (req, res, next) {
  res.redirect('/account:' + req.user.userName);
};

/**
 * @function editProfile() - Modifica los datos de cuenta del
 * usuario
 * @param {Object} req - Solicitud del usuario
 * @param {Object} res - Respuesta a la solicitud de usuario
 * @param {Object} next - Siguiente función de middleware
 * @memberof user-controller.UserController
 * @instance
 */
UserController.editProfile = function (req, res, next) {
  req.user.userName = req.body.name;
  req.user.userLastname = req.body.lastname;
  req.user.userCity = req.body.city;
  req.user.userCountry = req.body.country;
  req.user.userPhone = req.body.phone;
  req.user.userInterests = req.body.interests;
  req.user.userCollege = req.body.college;
  req.user.userAbout = req.body.about;
  req.user.userProfesion = req.body.profesion;
  // console.log('dataUser -->'+JSON.stringify(req.user));
  UserModel.editProfile(req.user, function (err) {
    if (err) next(err);
    req.session['message'] = 'Información cambiada.';
    req.session['type'] = 'success';
    res.redirect('/profile:' + req.user.userName);
  });
};

/**
 * @function changePassword() - Cambia la contraseña de la
 * cuenta del usuario
 * @param {Object} req - Solicitud del usuario
 * @param {Object} res - Respuesta a la solicitud de usuario
 * @param {Object} next - Siguiente función de middleware
 * @memberof user-controller.UserController
 * @instance
 */
UserController.changePassword = function (req, res, next) {
  let oldPassword = req.body.oldPassword,
    newPassword = req.body.newPassword,
    reNewPassword = req.body.reNewPassword;

  if (newPassword != reNewPassword) {
    req.session['message'] = 'Las contraseñas no coinciden';
    req.session['type'] = 'error';
    res.redirect('/profile:' + req.user.userName);
  } else {
    if (newPassword.length < 8) {
      req.session['message'] =
        'La contraseña nueva debe tener al menos 8 caracteres';
      req.session['type'] = 'error';
      res.redirect('/profile:' + req.user.userName);
    } else {
      UserModel.comparePassword(req.user, oldPassword, function (
        err,
        sonIguales
      ) {
        if (sonIguales) {
          UserModel.changePassword(newPassword, req.user, function (err) {
            if (err) next(err);
            req.session['message'] = 'Contraseña cambiada';
            req.session['type'] = 'success';
            res.redirect('/profile:' + req.user.userName);
          });
        } else {
          req.session['message'] = 'Contraseña incorrecta';
          req.session['type'] = 'error';
          res.redirect('/profile:' + req.user.userName);
        }
      });
    }
  }
};

/**
 * @function changeAvatar() - Cambia la foto de perfil (avatar) de
 * la cuenta de usuario
 * @param {Object} req - Solicitud del usuario
 * @param {Object} res - Respuesta a la solicitud de usuario
 * @param {Object} next - Siguiente función de middleware
 * @memberof user-controller.UserController
 * @instance
 */
UserController.changeAvatar = function (req, res, next) {
  let filename;
  let pathAvatar;

  var form = new formidable.IncomingForm();
  form.uploadDir = path.join(__dirname, '..', 'uploads', `${uploadDir}`);
  //form.keepExtensions = true
  form.parse(req, function (err, fields, files) {
    if (err) res.send('error al cargar el avatar');

    let oldpath = files.avatar.path;

    // console.log('oldpath ---:> ' + oldpath);
    // console.log('path.basename ---:> ' + path.basename(oldpath));
    // console.log('new basename ---:> ' + withoutExtension(path.basename(oldpath)));

    let newpath = oldpath.replace(
      withoutExtension(path.basename(oldpath)),
      req.user.id
    );

    // console.log('newpath ---:> ' + newpath)

    fs.rename(oldpath, newpath, function (err) {
      if (err) throw err;
    });

    filename = path.basename(newpath); //aca poner la id del usuario

    pathAvatar = path.join('/', `${uploadDir}`, `${filename}`);
    // console.log('USER ---:> ' + JSON.stringify(req.user.id))
    // pathAvatar = `${uploadDir}/${req.user.id}`
    req.user.userAvatar = pathAvatar;
    // console.log('req.user -->'+JSON.stringify(req.user));
    UserModel.changeAvatar(req.user, function (err) {
      if (err) next(err);
      req.session['message'] = 'Foto de perfil cambiada.';
      req.session['type'] = 'success';
      res.redirect('/profile:' + req.user.userName);
    });
  });
};

/**
 * @function withoutExtension() - Retorna nombre de archivo sin la
 * extension
 * @param {string} base - Nombre de archivo con extension
 * @memberof user-controller
 * @instance
 */
function withoutExtension(base) {
  if (base.lastIndexOf('.') != -1)
    base = base.substring(0, base.lastIndexOf('.'));
  return base;
}

/**
 * @function error404() - Permite la visualización de la pantalla
 * de error
 * @param {Object} req - Solicitud del usuario
 * @param {Object} res - Respuesta a la solicitud de usuario
 * @param {Object} next - Siguiente función de middleware
 * @memberof user-controller.UserController
 * @instance
 */
UserController.error404 = function (req, res, next) {
  res.sendFile(
    path.join('pug', 'page_system_404_3', {
      error: 'La última acción llevó a un error, revise los datos ingresados',
    })
  );
};

module.exports = UserController;
