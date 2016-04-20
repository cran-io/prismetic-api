var express           = require('express');
var router            = express.Router();
var sensorsController = require('../controllers/sensors');

// POST /devices/:device_id/sensors
router.post('/devices/:device_id/sensors', sensorsController.create);

// GET /api/:device_id/sensors
router.get('/devices/:device_id/sensors', sensorsController.index);

module.exports = router;
