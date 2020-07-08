/**
 * @file Establece el esquema de clase almacenado en
 * base de datos Mongo. Ademas establece parametros de comunicacion con base de datos
 * @name class-connection
 * @requires mongoose,bcrypt-nodejs,mongoose-paginate,mongoose.Schema
 * @author Retinta Team
 * @version 1.0.0
 */
'use strict';

const mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  mongoosePaginate = require('mongoose-paginate'),
  bcrypt = require('bcrypt-nodejs'),
  moment = require('moment'),
  ClassSchema = new Schema(
    {
      classTitle: { type: String },
      classImg: { type: String },
      classPublic: { type: Boolean },
      classPassword: { type: String },
      classCategory: { type: String },
      classOwner: { type: Schema.Types.ObjectId },
      classDescription: { type: String },
      classPercentAssistReq: { type: Number },
      createdAt: {
        type: String,
        default: moment(new Date()).format('DD/MM/YYYY HH:mm'),
      },
      classAssists: { type: [] },
      classState: { type: Number }, //1 creada 2 iniciada 3 terminada 4 guardada, 5 baja logica
      classCantE: { type: Number },
      classCantMB: { type: Number },
      classCantB: { type: Number },
      classCantR: { type: Number },
      classCantM: { type: Number },
      classScreens: { type: [[]] },
      classChat: { type: [] },
      classQuestionnaires: { type: [] },
      duration: {type:Number}
    },
    {
      collection: 'classes',
    }
  );

ClassSchema.pre('save', function (next) {
  var myclass = this;
  if (!myclass.isModified('classPassword')) {
    return next();
  }

  bcrypt.genSalt(10, function (err, salt) {
    if (err) next(err);
    bcrypt.hash(myclass.classPassword, salt, null, function (err, hash) {
      if (err) next(err);
      myclass.classPassword = hash;
      next();
    });
  });
});

ClassSchema.methods.compararPassword = function (classPassword, cb) {
  bcrypt.compare(classPassword, this.classPassword, function (err, sonIguales) {
    if (err) return cb(err);
    cb(null, sonIguales);
  });
};
ClassSchema.plugin(mongoosePaginate);
ClassSchema.index({ classTitle: 1 });
var ClassModel = mongoose.model('Class', ClassSchema);
module.exports = ClassModel;
