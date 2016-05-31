var express           = require('express');
var router            = express.Router();
var sensorsController = require('../controllers/sensors');

module.exports = () => {
  //Insert sensor to req.sensor for all requests /device/:device_id/sensors/:sensor_id/**
  router.all('/devices/:device_id/sensors/:sensor_id*', sensorsController.sensorMiddleware);

  // POST /devices/:device_id/sensors
  router.post('/devices/:device_id/sensors', sensorsController.findSensorMac, sensorsController.create);

  // GET /api/:device_id/sensors
  router.get('/devices/:device_id/sensors', sensorsController.index);

  // PUT /api/:device_id/sensors/:sensor_id
  router.put('/devices/:device_id/sensors/:sensor_id', sensorsController.update);

  return router;
}