var Device      = require('../models/device');
var Sensor     = require('../models/sensor');
var SensorData = require('../models/sensorData');
var ObjectId = (require('mongoose').Types.ObjectId);

exports.index = (request, response) => {
  request.sensor.populate('sensorData', (error, sensor) => {
    response.send(sensor.sensorData);
  });
};

exports.create = (io) => {
  return (request, response) => {
    var sensorData = new SensorData(request.body);
    sensorData.save((error, data) => {
      if (error) return response.send(500, error);
      request.sensor.sensorData.push(sensorData);
      request.sensor.save((error) => {
      if (error) return response.send(500, error);
        response.send(sensorData);
      })
    });
  }
}

exports.sensorMiddleware = (request, response, next) => {
  var sensorId = request.device.sensors.find((sensorId) => {
    return sensorId == request.params.sensor_id;
  });
  Sensor.findById(sensorId, (error, sensor) => {
    if(error) return response.send(500, error);
    if(!sensor) return response.send(404, []);
    request.sensor = sensor;
    next();
  });
};
