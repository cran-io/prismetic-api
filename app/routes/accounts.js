var express           = require('express');
var router            = express.Router();
var accountController = require('../controllers/accounts');
var auth              = require('../config/auth');

module.exports = () => {
  // POST /api/account
  router.post('/accounts', accountController.create);

  // GET /api/account
  router.get('/accounts', auth.isLoggedIn, accountController.index);

  return router;
}