'use strict';
exports.isLoggedIn = (req, res, next) => {
  if (req.method === "POST" || req.isAuthenticated())
    return next();
  res.sendStatus(401);
}