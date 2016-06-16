var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

var permanenceTime = new Schema({
  average: {
    type: Number,
    default: 0
  },
  deviceId: {
    type: Schema.Types.ObjectId,
    ref: 'Device',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('PermanenceTime', permanenceTime);