'use strict'
var Device  = require('../models/device');
var Sensor = require('../models/sensor');

exports.create = (request, response, next) => {
  var sensor = new Sensor(request.body);
  sensor.save((error, sensor) => {
    if (error) return next(error);
    request.device.sensors.push(sensor);
    request.device.save((error) => {
      if (error) return next(error);
      response.json(sensor);
    });
  });
};

exports.index = (request, response, next) => {
  request.device.populate('sensors', (error, device) => {
    if (error) return next(error);
    response.send(device.sensors);
  });
};

exports.device = (request, response, next) => {
  Device.findById(request.params.device_id, (error, device) => {
    if(error) return next(error);
    if(!device) {
      let err = new Error();
      err.message = "No se encontro el device con ese id"; 
      err.status = 404;
      return next(err);
    }
    request.device = device;
    next();
  });
};