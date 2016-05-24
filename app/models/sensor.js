var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

var sensorSchema = new Schema({
  active: Boolean,
  name: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  flow: {
    type: Boolean,
    default: true
  },
  switch: {
    type: Boolean,
    default: false
  }
});

module.exports = mongoose.model('Sensor', sensorSchema);
