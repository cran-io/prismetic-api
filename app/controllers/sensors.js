var Device  = require('../models/device');
var Sensor = require('../models/sensor');

exports.create = function(request, response) {
  var sensor = new Sensor();
  sensor.pin = request.body.pin;
  sensor.sensorType = request.body.sensorType;
  sensor.active = request.body.active;
  sensor.save(function(error, sensor) {
    if (error) {
      response.send(error);
    } else {
      Device.findById(request.params.device_id, function(error, device) {
        device.sensors.push(sensor);
        device.save(function(error) {
          if (error) {
            response.send(error);
          } else {
            response.json({ message: 'Sensor creado satisfactoriamente' });
          }
        });
      });
    }
  });
};

exports.index =  function(request, response) {
  Device.findById(request.params.device_id, function(error, device) {
    if (error) {
      response.send(error);
    } else {
      device.populate('sensors', function(error, device) {
        response.send(device);
      });
    }
  });
};
