var express           = require('express');
var router            = express.Router();
var devicesController = require('../controllers/devices');
var auth              = require('../config/auth');

module.exports = () => {

  //Insert device to req.device for all requests /device/:device_id/**/**
  router.all('/devices/:device_id*', auth.isLoggedIn, devicesController.verifyAccountUser, devicesController.verifyDeviceUser, devicesController.deviceMiddleware);
  
  // GET /api/devices
  router.get('/devices', auth.isLoggedIn, devicesController.verifyAccountUser, devicesController.index);

  // POST /api/devices
  router.post('/devices', devicesController.findAccount, devicesController.findDeviceMac, devicesController.create);

  // PUT /api/devices
  router.put('/devices/:device_id/', auth.isLoggedIn, devicesController.update);

  // GET /api/:device_id/graphSensorData
  router.get('/devices/:device_id/graphSensorData', auth.isLoggedIn, devicesController.graphSensorData);
  
  return router;
}