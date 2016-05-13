var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

var userSchema = new Schema({
  name: {
    type: String,
    required: true
  }, 
  lastName: {
    type: String, 
    required: true
  },
  mail: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  password: {
    type: String,
    required: true,
    select: false
  }
});

module.exports = mongoose.model('User', userSchema);

