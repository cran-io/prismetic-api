var mongoose = require('mongoose');
var Schema   = mongoose.Schema;
var Sensor   = require('./sensor');

var sensorDataSchema = new Schema({
  state: {
    type: String,
    enum: ['Entro', 'Salio']
  },
  sentAt: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  deviceId: {
    type: Schema.Types.ObjectId,
    ref: 'Device'
  }
});

module.exports = mongoose.model('SensorData', sensorDataSchema);
