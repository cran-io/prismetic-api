"use strict"
var Device      = require('../models/device');
var Sensor     = require('../models/sensor');
var SensorData = require('../models/sensorData');
var ObjectId = (require('mongoose').Types.ObjectId);
var moment = require('moment');

//Create sensor_data.
exports.create = (io) => {
  return (request, response, next) => {
    if(request.body.sentAt) delete request.body.sentAt;
    var sensorData = new SensorData(request.body);
    if(request.sensor.switch) sensorData = sensorData.switchData();
    sensorData.sensorId = request.params.sensor_id;
    if(sensorData.validateSync()) {
      error.status = 400;
      return next(error);
    }
    //Find last sensorData count;
    SensorData.findOneAndUpdate({sensorId: request.params.sensor_id, read: false, sentAt: {$lte: sensorData.sentAt}}, {$set: {read: true}}, {sort: {sentAt: 1}}, (error, oldSensor) => {
      if(error) return next(error);
      let sum = sensorData.enter - sensorData.exit;
      oldSensor = oldSensor || {count: 0};
      sensorData.count = (oldSensor.count + sum < 0 ) ? 0 : (oldSensor.count + sum);
      sensorData.save((error, data) => {
        if (error) return next(error);
        response.send(sensorData);
        io.emit(request.sensor._id.toString(), sensorData);
      });
    });
  }
}

exports.delete = (request, response, next) => {
  SensorData.remove({sensorId: request.params.sensor_id}, error => {
    if(error) return next(error);
    response.send(200);
  });
}