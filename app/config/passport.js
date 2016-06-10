module.exports = () =>{
  var passport = require('passport');
  var LocalStrategy = require('passport-local').Strategy;
  var bcrypt = require('bcrypt-nodejs');
  var User = require('./../models/user');
  passport.use(new LocalStrategy({
    usernameField: 'mail',
    passwordField: 'password'
  }, (username, password, cb) => {
    User.findOne({mail: username}, {password: 1, name: 1, lastName: 1, mail: 1, createdAt: 1}, (err, user) => {
      if (err) { return cb(err); }
      if (!user) { return cb(null, false, {message: "Not user with that mail"}); }
      if (!bcrypt.compareSync(password, user.password)) { return cb(null, false, {message: "Invalid password"}); }
      return cb(null, user);
    });
  }));

  passport.serializeUser(function(user, cb) {
    cb(null, user._id);
  });

  passport.deserializeUser(function(id, cb) {
    User.findById(id, function (err, user) {
      if (err) { return cb(err); }
      cb(null, user);
    });
  });

  return passport;
}();