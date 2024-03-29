var express = require('express');
var router = express.Router();

var HandlerGenerator = require("../handlegenerator.js");
var middleware = require("../middleware.js");

HandlerGenerator = new HandlerGenerator();

/* GET home page. */
router.get('/', middleware.checkToken, HandlerGenerator.index);

router.post( '/login', HandlerGenerator.login);

router.post('/users', HandlerGenerator.signup)

router.get('/admin', middleware.checkToken, HandlerGenerator.admin);

module.exports = router;