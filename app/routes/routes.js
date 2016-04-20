var express               = require('express');
var router                = express.Router();
var devicesController      = require('../controllers/devices');
var sensorsController     = require('../controllers/sensors');
var sensorsDataController = require('../controllers/sensorsData');

module.exports = function(io) {
  router.use(require('./devices'));
  router.use(require('./sensors'));
  router.use(require('./sensorsData')(io));

  return router;
};
