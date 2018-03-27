var express = require('express');
var crypto = require("crypto");
var bcrypt = require("bcryptjs");
var jwt = require('jsonwebtoken');
var users = require('../storage/arango_storage').users;

var router = express.Router();

router.get('/', function(req, res, next) {
  res.render('login', { title: 'Login'} );
});

router.post('/', function(req, res, next) {
  users.getBy('name', req.body.name).then(user => {
    if (!user || !bcrypt.compareSync(req.body.password, user.pwdHash)){
      var err = new Error('User not found');
      err.status = 401;
      next(err);
      return;
    }
    
    var token = jwt.sign({ id: user._key }, req.app.get('TOKEN_SECRET'), {
      expiresIn: 86400000 // expires in 24 hours
    });

    res.cookie('a_token', token, { maxAge: 86400000, httpOnly: true });
    res.redirect('/');
  });
});

router.get('/register', function(req, res, next) {
  res.render('register', { title: 'Register'} );
});

router.post('/register', function(req, res, next) {
  var hashedPassword = bcrypt.hashSync(req.body.password, 8);

  var user = {
    _key: crypto.randomBytes(8).toString("hex"),
    name: req.body.name,
    pwdHash: hashedPassword
  };

  users.getBy('name', user.name).then(existing => {
    if (existing){
      var err = new Error('User name conflict');
      err.status = 400;
      next(err);
      return;
    }

    users.store(user).then(() => {
      var token = jwt.sign({ id: user._key }, req.app.get('TOKEN_SECRET'), {
        expiresIn: 86400000 // expires in 24 hours
      });
  
      res.cookie('a_token', token, { maxAge: 86400000, httpOnly: true });
      res.redirect('/');
    });
  });
});

module.exports = router;