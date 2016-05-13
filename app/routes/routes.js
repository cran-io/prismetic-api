var express               = require('express');
var router                = express.Router();
var devicesController      = require('../controllers/devices');
var sensorsController     = require('../controllers/sensors');
var sensorsDataController = require('../controllers/sensorsData');

module.exports = function(io, passport) {
  router.post('/signin', passport.authenticate('local'), (req, res) => (res.send(200)));
  router.use('/api', require('./devices')());
  router.use('/api', require('./sensors')());
  router.use('/api', require('./users')());
  router.use('/api', require('./accounts')());
  router.use('/api', require('./sensorsData')(io));
  return router;
};
