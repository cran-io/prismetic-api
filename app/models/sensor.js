var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

var sensorSchema = new Schema({
  active: Boolean,
  name: {
    type: String
  },
  sensorData: [{
    type: Schema.Types.ObjectId,
    ref: 'SensorData'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Sensor', sensorSchema);
