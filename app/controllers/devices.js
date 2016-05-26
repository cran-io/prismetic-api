'use strict';
var Device   = require('../models/device');
var Account   = require('../models/account');

//Middlewares for create.
//Find device by mac before create, if exists return the old one.
exports.findDeviceMac = (request, response, next) => {
  Device.findOne({mac: request.body.mac}, (error, device) => {
    if(error) {
      let err = new Error();
      err.message = error;
      return next(error);
    }
    if(!device) return next();
    return response.send(device);
  });
};

//Find account and save it to request.
exports.findAccount = (request, response, next) => {
  if(!request.body.account) {
    let err = new Error();
    err.message = "Falta el campo: Account";
    err.status = 400;
    return next(err);
  }
  Account.findById(request.body.account, (error, account) => {
    if(error) return next(new Error(error));
    if(!account) {
      let err = new Error();
      err.status = 400;
      err.message = "No se encontro un Account con ese id";
      return next(err)
    }
    request.account = account;
    next();
  });  
}

//Api methods.
exports.create = (request, response, next) => {
  var device = new Device();
  device.model = request.body.model;
  device.active = request.body.active;
  device.mac = request.body.mac;
  device.save((error, device) => {
    if (error) return next(error);
    request.account.devices.push(device);
    request.account.save((error, account) => {
      if(error) return next(error);
      response.json(device);
    });
  });
};

exports.index = (request, response, next) => {
  Device.find((error, devices) => {
    if(error) return next(error);
    response.send(devices);
  });
};

