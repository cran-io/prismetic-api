var express           = require('express');
var router            = express.Router();
var accountController = require('../controllers/accounts');

module.exports = () => {
  // POST /api/account
  router.post('/accounts', accountController.create);

  // GET /api/account
  router.get('/accounts', accountController.index);

  return router;
}