/**
 * @file Establece el esquema de usuarios almacenado en 
 * base de datos Mongo. Ademas establece parametros de comunicacion con base de datos
 * @name user-connection
 * @requires mongoose,path,bcrypt-nodejs,db-conf,mongoose.Schema
 * @author Retinta Team
 * @version 1.0.0 
 */
'use strict'

var mongoose = require('mongoose');
const path = require('path'),
    conf = require(path.join(__dirname, '.', 'db-conf')),
    bcrypt = require('bcrypt-nodejs'),
    Schema = mongoose.Schema;
var UserSchema = new Schema({ // ver tipos de datos en el esquema
    userName: { type: String, required: true },
    userLastname: { type: String, required: true },
    userMail: { type: String, unique: true, lowercase: true, required: true },
    userPassword: { type: String, required: true },
    userCity: { type: String, required: true },
    userCountry: { type: String, required: true },
    userInterests: { type: String },
    userPhone: { type: Number },
    userCollege: { type: String },
    userAbout: { type: String, default: '' },
    userAvatar: { type: String },
    userVerificationNumber: { type: Number },
    userVerificated: { type: Number },
    userVerificationTryings: { type: Number },
    userBlocked: { type: Number },
    userProfesion: { type: String }
}, {
    timestamps: true
}, {
    collection: 'user'
})

UserSchema.pre('save', function (next) {
    var usuario = this
    if (!usuario.isModified('userPassword')) {
        return next()
    }

    bcrypt.genSalt(10, function (err, salt) {
        if (err) next(err)
        bcrypt.hash(usuario.userPassword, salt, null, function (err, hash) {
            if (err) next(err)
            usuario.userPassword = hash
            next()
        })
    })
})



UserSchema.methods.compararPassword = function (userPassword, cb) {
    bcrypt.compare(userPassword, this.userPassword, function (err, sonIguales) {
        if (err) return cb(err)
        cb(null, sonIguales)
    })
}

var UserModel = mongoose.model('User', UserSchema);
mongoose.Promise = require('bluebird')
mongoose.connect(`mongodb://${conf.mongo.host}/${conf.mongo.db}`, { useNewUrlParser: true })
module.exports = UserModel