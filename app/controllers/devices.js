var Device   = require('../models/device');
var Account   = require('../models/account');
var exports  = module.exports;

exports.create = (request, response) => {
  if(!request.body.accountId) return response.send(400);
  Account.findById(request.body.accountId, (error, account) => {
    if(error) return res.send(500);
    if(!account) return res.send(400, {message: "No se encontro un Account con ese id"});
    var device = new Device();
    device.model = request.body.model;
    device.active = request.body.active;
    device.save((error, device) => {
      if (error) return response.send(500, error);
      account.devices.push(device);
      account.save((error, account) => {
        if(error) return res.send(500);
        response.json(device);
      });
    });
  });
};

exports.index = (request, response) => {
  Device.find((error, devices) => {
    if (error) return response.send(500, error);
    response.send(devices);
  });
};

