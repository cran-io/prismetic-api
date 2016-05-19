var express               = require('express');
var router                = express.Router();
var devicesController      = require('../controllers/devices');
var sensorsController     = require('../controllers/sensors');
var sensorsDataController = require('../controllers/sensorsData');
var moment = require('moment');

module.exports = function(io, passport) {
  router.post('/signin', passport.authenticate('local'), (req, res) => (res.send(200)));
  router.use('/api', require('./devices')());
  router.use('/api', require('./sensors')());
  router.use('/api', require('./users')());
  router.use('/api', require('./accounts')());
  router.use('/api', require('./sensorsData')(io));
  router.get('/api/time', (req, res) => res.send({time: moment(new Date()).format("YYYY-DD-MM HH:mm:ss")}));
  return router;
};
