var express          = require('express');
var router           = express.Router();
var userController = require('../controllers/users');

module.exports = () => {

  router.all('/accounts/:account_id/*', userController.account);

  // POST /api/accounts/:account_id/users
  router.post('/accounts/:account_id/users', userController.create);

  // GET /api/accounts/:account_id/users
  router.get('/accounts/:account_id/users', userController.index);

  //POST /api/signin 

  function isLoggedIn(req, res, next) {

    if (req.isAuthenticated())
      return next();

    res.send(401);
  } 

  return router;
}