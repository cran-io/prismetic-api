'use strict';
var Device   = require('../models/device');
var Account   = require('../models/account');


exports.create = (request, response, next) => {
  if(!request.body.account) return response.send(400);
  Account.findById(request.body.account, (error, account) => {
    if(error) return next(error);
    if(!account) {
      let err;
      err.status = 400;
      err.message = "No se encontro un Account con ese id";
      return next(err)
    } 
    var device = new Device();
    device.model = request.body.model;
    device.active = request.body.active;
    device.save((error, device) => {
      if (error) return next(error);
      account.devices.push(device);
      account.save((error, account) => {
        if(error) return next(error);
        response.json(device);
      });
    });
  });
};

exports.index = (request, response, next) => {
  Device.find((error, devices) => {
    if(error) return next(error);
    response.send(devices);
  });
};

