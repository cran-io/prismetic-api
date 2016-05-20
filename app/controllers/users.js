'use strict';
var User = require('../models/user');
var Account = require('../models/account');
var bcrypt = require('bcrypt-nodejs');
exports.create = (request, response, next) => {
  var user = new User(request.body);
  user.password = bcrypt.hashSync(request.body.password, bcrypt.genSaltSync(8), null);
  user.save((error, user) => {
    if (error) return next(error);
    request.account.users.push(user);
    request.account.save((error, account) => {
      if (error) return next(error);
      response.send(user);
    })
  });
};

exports.index = (request, response, next) => {
  request.account.populate('users', (error, account) => {
    if (error) return next(error);
    response.send(account.users);
  });
};

exports.account = (request, response, next) => {
  Account.findById(request.params.account_id, (error, account) => {
    if(error) return next(error);
    if(!account) {
      let err = new Error();
      err.message = "No se encontro account con ese id"; 
      err.status = 404;
      return next(err);
    };
    request.account = account;
    next();
  });
};