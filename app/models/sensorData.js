var mongoose = require('mongoose');
var Schema   = mongoose.Schema;
var Sensor   = require('./sensor');

var sensorDataSchema = new Schema({
  enter: {
    type: String,
    default: 0
  },
  exit: {
    type: String,
    default: 0
  },
  count: {
    type: Number
  },
  read: {
    type: Boolean,
    default: false
  },
  sentAt: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('SensorData', sensorDataSchema);