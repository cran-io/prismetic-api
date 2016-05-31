var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

var permanenceTime = new Schema({
  average: {
    type: Number,
    default: 0
  },
  sensorId: {
    type: Schema.Types.ObjectId,
    ref: 'Sensor',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('PermanenceTime', permanenceTime);