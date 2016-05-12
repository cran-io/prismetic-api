var Device  = require('../models/device');
var Sensor = require('../models/sensor');

exports.create = (request, response) => {
  var sensor = new Sensor();
  sensor.pin = request.body.pin;
  sensor.sensorType = request.body.sensorType;
  sensor.active = request.body.active;
  sensor.save((error, sensor) => {
    if (error) return response.send(500, error);
    request.device.sensors.push(sensor);
    request.device.save((error) => {
      if (error) return response.send(error);
      response.json({ message: 'Sensor creado satisfactoriamente' });
    });
  });
};

exports.index = (request, response) => {
  request.device.populate('sensors', (error, device) => {
    if (error) return response.send(500, error);
    response.send(device);
  });
};

exports.average = (request, response) => {
  
};

exports.device = (request, response, next) => {
  Device.findById(request.params.device_id, (error, device) => {
    if(error) return response.send(500, {message: "Internal server error"});
    if(!device) return response.send([]);
    request.device = device;
    next();
  });
};