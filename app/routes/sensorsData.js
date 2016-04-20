var express               = require('express');
var router                = express.Router();
var sensorsDataController = require('../controllers/sensorsData');

module.exports = function(io) {
  // GET /devices/:device_id/sensors/:sensor_id
  router.get('/devices/:device_id/sensors/:sensor_id', sensorsDataController.index);

  // POST /devices/:device_id/sensors/:sensor_id/sensors_data
  router.post('/devices/:device_id/sensors/:sensor_id/sensors_data', sensorsDataController.create(io));

  return router;
};

