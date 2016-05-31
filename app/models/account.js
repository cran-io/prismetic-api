var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

var accountSchema = new Schema({
  name: {
    type: String,
    required: true
  }, 
  address: {
    type: String, 
    required: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  users: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  devices: [{
    type: Schema.Types.ObjectId,
    ref: 'Device'
  }]
});

module.exports = mongoose.model('Account', accountSchema);