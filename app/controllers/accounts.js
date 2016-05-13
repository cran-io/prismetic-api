var Account = require('../models/account');

exports.create = (request, response) => {
  var account = new Account(request.body);
  account.save((error, account) => {
    if (error) return response.send(500, error);
    response.send(account);
  });
};

exports.index = (request, response) => {
  Account.find({}, (error, account) => {
    if(error) return response.send(500, {message: "Internal server error"});
    response.send(account);
  });
};