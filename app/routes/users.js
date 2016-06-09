var express          = require('express');
var router           = express.Router();
var userController   = require('../controllers/users');
var auth             = require('../config/auth');

module.exports = () => {

  router.all('/accounts/:account_id/*', userController.account);

  // POST /api/accounts/:account_id/users
  router.post('/accounts/:account_id/users', userController.checkMail, userController.create);

  // GET /api/accounts/:account_id/users
  router.get('/accounts/:account_id/users', auth.isLoggedIn, userController.index);

  //POST /api/signin 

  return router;
}