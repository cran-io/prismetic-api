var express          = require('express');
var router           = express.Router();
var devicesController = require('../controllers/devices');

module.exports = () => {
  // POST /api/devices
  router.post('/devices', devicesController.create);

  // GET /api/devices
  router.get('/devices', devicesController.index);

  return router;
}