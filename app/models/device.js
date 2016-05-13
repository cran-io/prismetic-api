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
  }
});

module.exports = mongoose.model('Device', deviceSchema);

