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

exports.checkMail = (request, response, next) => {
  User.findOne({mail: request.body.mail}, (error, user) => {
    if(error) _newError(error, 500, next);
    if(user) _newError("Ya existe un usuario con ese mail", 400, next);
    next();
  });
}

exports.index = (request, response, next) => {
  request.account.populate('users', (error, account) => {
    if (error) return next(error);
    response.send(account.users);
  });
};

exports.account = (request, response, next) => {
  Account.findById(request.params.account_id, (error, account) => {
    if(error) _newError(error, 500, next);
    if(!account) _newError("No se encontro un account con ese id", 404, next);
    request.account = account;
    next();
  });
};

let _newError = (message, status, next) => {
  let err = new Error();
  err.message = message;
  err.status = status;
  return next(err);
}