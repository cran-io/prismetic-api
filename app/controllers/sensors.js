'use strict'
var Device  = require('../models/device');
var Sensor = require('../models/sensor');
var SensorData = require('../models/sensorData');
var moment = require('moment');

//Show sensors for a device.
exports.index = (request, response, next) => {
  request.device.populate('sensors', (error, device) => {
    if (error) return next(error);
    response.send(device.sensors);
  });
};

//Create sensor with device.
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

exports.update = (request, response, next) => {
  let fields = new Set(["name", "switch", "flow"]);
  for(let key in request.body) {
    if(fields.has(key)) request.sensor[key] = request.body[key];
  }
  request.sensor.save((error, sensor) => {
    if(error) return next(error);
    response.json(sensor);
  });
}

//===== MIDDLEWARES ===== 

//Get sensor and save it on request.
exports.sensorMiddleware = (request, response, next) => {
  var sensorId = request.device.sensors.find((sensorId) => {
    return sensorId == request.params.sensor_id;
  });
  Sensor.findById(sensorId, (error, sensor) => {
    if(error) return next(error);
    if(!sensor) {
      let err = new Error();
      err.message = "No se encontro el sensor con ese id"; 
      err.status = 404;
      return next(err);
    }
    request.sensor = sensor;
    next();
  });
};

//Find sensor by mac before create, if exists return the old one.
exports.findSensorMac = (request, response, next) => {
  Sensor.findOne({mac: request.body.mac}, (error, sensor) => {
    if(error) return next(new Error());
    if(!sensor) return next();
    return response.send(sensor);
  });
};