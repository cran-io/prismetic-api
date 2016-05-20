'use strict'

var Account = require('../models/account');

exports.create = (request, response, next) => {
  var account = new Account(request.body);
  account.save((error, account) => {
    if (error) return next(error);
    response.send(account);
  });
};

exports.index = (request, response, next) => {
  Account.find({}, (error, account) => {
    if(error) return next(error);
    response.send(account);
  });
};