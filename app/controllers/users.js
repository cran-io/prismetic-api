var User = require('../models/user');
var Account = require('../models/account');
var bcrypt = require('bcrypt-nodejs');
exports.create = (request, response) => {
  var user = new User(request.body);
  user.password = bcrypt.hashSync(request.body.password, bcrypt.genSaltSync(8), null);
  console.log(user.password);
  user.save((error, user) => {
    if (error) return response.send(500, error);
    request.account.users.push(user);
    request.account.save((error, account) => {
      if (error) return response.send(500, error);
      response.send(user);
    })
  });
};

exports.index = (request, response) => {
  request.account.populate('users', (error, account) => {
    if (error) return response.send(500, error);
    response.send(account.users);
  });
};

exports.account = (request, response, next) => {
  Account.findById(request.params.account_id, (error, account) => {
    if(error) return response.send(500, {message: "Internal server error"});
    if(!account) return response.send([]);
    request.account = account;
    next();
  });
};