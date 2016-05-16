var Device  = require('../models/device');
var Sensor = require('../models/sensor');

exports.create = (request, response) => {
  console.log(request.body)
  var sensor = new Sensor(request.body);
  sensor.save((error, sensor) => {
    if (error) return response.send(500, error);
    request.device.sensors.push(sensor);
    request.device.save((error) => {
      if (error) return response.send(500, error);
      response.json(sensor);
    });
  });
};

exports.index = (request, response) => {
  request.device.populate('sensors', (error, device) => {
    if (error) return response.send(500, error);
    response.send(device.sensors);
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