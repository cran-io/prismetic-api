var express               = require('express');
var router                = express.Router();
var sensorsDataController = require('../controllers/sensorsData');

module.exports = (io) => {
  
  // POST /devices/:device_id/sensors/:sensor_id/sensors_data
  router.post('/devices/:device_id/sensors/:sensor_id/sensors_data', sensorsDataController.create(io));

  // DELETE /devices/:device_id/sensors/:sensor_id/sensors_data
  router.delete('/devices/:device_id/sensors/:sensor_id/sensors_data', sensorsDataController.delete);

  return router;
};

