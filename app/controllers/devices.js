var device   = require('../models/device');
var exports = module.exports;

exports.create = function(request, response) {
  device = new Device();
  device.model = request.body.model;
  device.active = request.body.active;
  device.save(function(error, device) {
    if (error) {
      response.send(error);
    } else {
      response.json({ message: 'Device creada satisfactoriamente!', device: device });
    }
  });
};

exports.index = function(request, response) {
  Device.find(function(error, devices) {
    if (error) {
      response.send(error);
    } else {
      response.send(devices.map(function(device) {
        return { 
          id: device._id,
          model: device.model, 
          active: device.active,
          sensors: device.sensors.length
        }
      }));
    } 
  });
};

