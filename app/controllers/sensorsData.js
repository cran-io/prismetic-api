"use strict"
var Device      = require('../models/device');
var Sensor     = require('../models/sensor');
var SensorData = require('../models/sensorData');
var SensorDataFail = require('../models/sensorDataFail');
var ObjectId = (require('mongoose').Types.ObjectId);
var moment = require('moment-timezone');

//Create sensor_data.
exports.create = (io) => {
  return (request, response, next) => {
    if(request.body.sentAt) request.body.sentAt = moment(request.body.sentAt).tz("America/Buenos_Aires")._d;
    var sensorData = new SensorData(request.body);
    if(request.sensor.switch) sensorData = sensorData.switchData();
    sensorData.sensorId = request.params.sensor_id;
    sensorData.deviceId = request.params.device_id;
    if(sensorData.validateSync()) {
      error.status = 400;
      return next(error);
    }
    //Find last sensorData count;
    SensorData.findOneAndUpdate({deviceId: request.params.device_id, read: false, sentAt: {$lte: sensorData.sentAt}}, {$set: {read: true}}, {sort: {sentAt: 1}}, (error, oldSensor) => {
      if(error) return next(error);
      let sum = sensorData.enter - sensorData.exit;
      let count = _resetCount(request.device.resetTime, oldSensor) ? 0 : oldSensor.count;
      //Save sensor data fail if count < 0
      if(count + sum < 0) {
        let sensorDataFail = new SensorDataFail(request.body);
        if(request.sensor.switch) sensorDataFail = sensorDataFail.switchData();
        sensorDataFail.sensorId = request.params.sensor_id;
        sensorDataFail.count = count + sum;
        sensorDataFail.save((error, data) => {
          if(error) return next(error);
          response.send(sensorDataFail);
        });
      } else {
        sensorData.count = (count + sum);
        sensorData.save((error, data) => {
          if (error) return next(error);
          response.send(sensorData);
          io.emit(request.sensor._id.toString(), sensorData);
        });
      }
    });
  }
}

exports.delete = (request, response, next) => {
  SensorData.remove({sensorId: request.params.sensor_id}, error => {
    if(error) return next(error);
    response.send(200);
  });
}

var _resetCount = (resetTime, oldSensor) => {
  if(!oldSensor) return true;
  let momentResetTime = moment().hour(resetTime).startOf('hour');
  let momentOldSensor = moment(oldSensor.sentAt);
  return momentResetTime > momentOldSensor;
}