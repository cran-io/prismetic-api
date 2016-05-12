var express           = require('express');
var router            = express.Router();
var sensorsController = require('../controllers/sensors');

//Insert device to req.device for all requests /device/:device_id/**/**
router.all('/devices/:device_id/*', sensorsController.device);

// POST /devices/:device_id/sensors
router.post('/devices/:device_id/sensors', sensorsController.create);

// GET /api/:device_id/sensors
router.get('/devices/:device_id/sensors', sensorsController.index);

//GET /api/:device_id/sensors/:sensor_id/average
router.get('/devices/:device_id/average', sensorsController.average);

//GET /api/:device_id/sensors/:sensor_id/count
// router.get('/devices/:device_id/count', sensorsController.count);

module.exports = router;
