var mongoose = require('mongoose');
var Schema   = mongoose.Schema;
var Sensor   = require('./sensor');

var sensorDataSchema = new Schema({
  enter: {
    type: Number,
    default: 0
  },
  exit: {
    type: Number,
    default: 0
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