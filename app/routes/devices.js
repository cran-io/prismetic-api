var express          = require('express');
var router           = express.Router();
var devicesController = require('../controllers/devices');

// POST /api/devices
router.post('/devices', devicesController.create);

// GET /api/devices
router.get('/devices', devicesController.index);

module.exports = router;
