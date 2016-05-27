var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

var deviceSchema = new Schema({
  model: {
    type: String,
    required: true
  }, 
  active: {
    type: Boolean, 
    default: false
  },
  mac: {
    type: String,
    unique: true,
    dropDups: true
  },
  sensors: [{
    type: Schema.Types.ObjectId,
    ref: 'Sensor'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date, 
    default: Date.now
  },
  resetTime: {
    type: String,
    default: "05"
  }
});

module.exports = mongoose.model('Device', deviceSchema);