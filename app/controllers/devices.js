var Device   = require('../models/device');
var exports  = module.exports;

exports.create = (request, response) => {
  device = new Device();
  device.model = request.body.model;
  device.active = request.body.active;
  device.save((error, device) => {
    if (error) return response.send(500, error);
    response.json({ message: 'Device creada satisfactoriamente!', device: device });
  });
};

exports.index = (request, response) => {
  Device.find((error, devices) => {
    if (error) return response.send(500, error);
    response.send(devices.map((device) => {
      return {
        id: device._id,
        model: device.model, 
        active: device.active,
        sensors: device.sensors.length
      }
    }));
  });
};

