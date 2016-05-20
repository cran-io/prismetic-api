var express               = require('express');
var router                = express.Router();
var sensorsDataController = require('../controllers/sensorsData');

module.exports = (io) => {
  router.all('/devices/:device_id/sensors/:sensor_id/*', sensorsDataController.sensorMiddleware);
  
  // GET /devices/:device_id/sensors/:sensor_id/average
  router.get('/devices/:device_id/sensors/:sensor_id/average', sensorsDataController.average);

  // GET /devices/:device_id/sensors/:sensor_id/count
  router.get('/devices/:device_id/sensors/:sensor_id/count', sensorsDataController.count);  

  // POST /devices/:device_id/sensors/:sensor_id/sensors_data
  router.post('/devices/:device_id/sensors/:sensor_id/sensors_data', sensorsDataController.create(io));

  return router;
};

