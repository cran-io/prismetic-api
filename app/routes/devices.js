var express          = require('express');
var router           = express.Router();
var devicesController = require('../controllers/devices');

module.exports = () => {

  //Insert device to req.device for all requests /device/:device_id/**/**
  router.all('/devices/:device_id/*', devicesController.deviceMiddleware);

  // POST /api/devices
  router.post('/devices', devicesController.findAccount, devicesController.findDeviceMac, devicesController.create);

  // GET /api/devices
  router.get('/devices', devicesController.index);

  return router;
}